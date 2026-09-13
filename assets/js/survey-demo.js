// A silent looping product illustration. Motion stops off-screen or in a hidden tab.
(() => {
  const root = document.querySelector(".survey-film");
  if (!root) return;
  const canvas = root.querySelector("#flow-canvas");
  const svg = root.querySelector("#flow-wires");
  const ifWire = root.querySelector("#wire-if");
  const elseWire = root.querySelector("#wire-else");
  const trace = root.querySelector("#wire-trace");
  const traveler = root.querySelector("#flow-traveler");
  const cursor = root.querySelector("#flow-cursor");
  const toggle = root.querySelector("#film-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 20000;
  let elapsed = 0,
    lastTime = null,
    frame = null;
  let visible = false,
    userPaused = reduced.matches,
    scene = "";
  let geometry = null;
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const ease = (n) => {
    const t = clamp(n);
    return t * t * (3 - 2 * t);
  };
  function measure() {
    const box = canvas.getBoundingClientRect();
    const point = (selector) => {
      const r = root.querySelector(selector).getBoundingClientRect();
      return { x: r.x + r.width / 2 - box.x, y: r.y + r.height / 2 - box.y };
    };
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    geometry = {
      if: point("#port-if i"),
      else: point("#port-else i"),
      q2: point("[data-target=q2] .input-port"),
      q3: point("[data-target=q3] .input-port"),
      end: point("[data-target=end] .input-port"),
    };
    render();
  }
  function curve(a, b) {
    const mid = a.y + (b.y - a.y) * 0.58;
    return `M ${a.x} ${a.y} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
  }
  function interpolate(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }
  function setScene(key, step, caption, answer, target) {
    if (scene === key) return;
    scene = key;
    root.dataset.scene = key;
    root.querySelector("#film-step").textContent = step;
    root.querySelector("#film-caption").textContent = caption;
    root
      .querySelectorAll("[data-score]")
      .forEach((el) =>
        el.classList.toggle("is-selected", el.dataset.score === answer),
      );
    root
      .querySelectorAll("[data-target]")
      .forEach((el) =>
        el.classList.toggle("is-followed", el.dataset.target === target),
      );
  }
  function render() {
    if (!geometry) return;
    const t = elapsed % duration,
      g = geometry;
    const staticView = reduced.matches && userPaused;
    let blend =
      t < 2500
        ? 0
        : t < 5500
          ? ease((t - 2500) / 3000)
          : t < 17500
            ? 1
            : 1 - ease((t - 17500) / 2500);
    if (staticView) blend = 1;
    const end = interpolate(g.end, g.q3, blend);
    ifWire.setAttribute("d", curve(g.if, g.q2));
    elseWire.setAttribute("d", curve(g.else, end));
    cursor.style.opacity = "0";
    trace.style.opacity = "0";
    traveler.style.opacity = "0";
    if (staticView) {
      setScene(
        "static",
        "IF / OTHERWISE",
        "Rating 2 → improve the experience. Other ratings → learn what worked.",
        null,
        null,
      );
    } else if (t < 2500) {
      setScene(
        "connect",
        "01 / CONNECT",
        "Connect each answer to its next step.",
        null,
        null,
      );
    } else if (t < 5500) {
      setScene(
        "rewire",
        "01 / CONNECT",
        "Move the Otherwise wire to a different question.",
        null,
        null,
      );
      cursor.setAttribute("transform", `translate(${end.x},${end.y})`);
      cursor.style.opacity = String(Math.min(1, (t - 2500) / 250));
    } else if (t < 7000) {
      setScene(
        "connected",
        "01 / CONNECT",
        "One question. Two relevant follow-ups.",
        null,
        null,
      );
    } else if (t < 11000) {
      setScene(
        "if-answer",
        "02 / IF",
        "A rating of 2 asks what could be improved.",
        "2",
        t > 8400 ? "q2" : null,
      );
      if (t > 8400)
        root.querySelector("[data-target=q2]").classList.add("is-followed");
      follow(ifWire, clamp((t - 7400) / 1600), "#398158");
    } else if (t < 12000) {
      setScene(
        "next-answer",
        "03 / OTHERWISE",
        "Now, a different customer gives a rating of 5.",
        "5",
        null,
      );
    } else if (t < 17000) {
      setScene(
        "otherwise-answer",
        "03 / OTHERWISE",
        "The Otherwise path asks what the customer enjoyed.",
        "5",
        t > 13600 ? "q3" : null,
      );
      if (t > 13600)
        root.querySelector("[data-target=q3]").classList.add("is-followed");
      follow(elseWire, clamp((t - 12200) / 1700), "#b78945");
    } else {
      setScene(
        "reset",
        "01 / CONNECT",
        "You decide where each answer goes.",
        null,
        null,
      );
      if (t > 17500) {
        cursor.setAttribute("transform", `translate(${end.x},${end.y})`);
        cursor.style.opacity = String(Math.min(1, (t - 17500) / 200));
      }
    }
    root.querySelector("#film-progress").style.transform =
      `scaleX(${staticView ? 1 : t / duration})`;
  }
  function follow(path, progress, color) {
    const d = path.getAttribute("d");
    trace.setAttribute("d", d);
    trace.style.stroke = color;
    trace.style.opacity = "1";
    const length = path.getTotalLength();
    trace.style.strokeDasharray = String(length);
    trace.style.strokeDashoffset = String(length * (1 - progress));
    if (progress > 0 && progress < 1) {
      const p = path.getPointAtLength(length * progress);
      traveler.setAttribute("cx", p.x);
      traveler.setAttribute("cy", p.y);
      traveler.setAttribute("fill", color);
      traveler.style.opacity = "1";
    }
  }
  function tick(now) {
    frame = null;
    if (!visible || document.hidden || userPaused) {
      lastTime = null;
      return;
    }
    if (lastTime !== null) elapsed += Math.min(now - lastTime, 80);
    lastTime = now;
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    toggle.textContent = userPaused ? "▶ Play" : "Ⅱ Pause";
    toggle.setAttribute(
      "aria-label",
      userPaused ? "Play survey animation" : "Pause survey animation",
    );
    root.querySelector("#film-mode").textContent =
      reduced.matches && userPaused
        ? "Static preview · reduced motion"
        : "↻ 20-second looping preview";
    if (!visible || document.hidden || userPaused) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      lastTime = null;
    } else if (frame === null) frame = requestAnimationFrame(tick);
    render();
  }
  toggle.addEventListener("click", () => {
    userPaused = !userPaused;
    sync();
  });
  new ResizeObserver(measure).observe(canvas);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      sync();
    },
    { threshold: 0.15 },
  ).observe(root);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", () => {
    userPaused = reduced.matches;
    sync();
  });
  measure();
  sync();
})();
