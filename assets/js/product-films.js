// Scripted previews only: no customer data is read and no requests are submitted.
(() => {
  function loop(root, duration, staticTime, render, name) {
    if (!root) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = motion.matches,
      visible = false,
      time = 0,
      last = null,
      frame = null;
    const button = root.querySelector("[data-playback]");
    function paint() {
      render(motion.matches && paused ? staticTime : time % duration);
      const progress = root.querySelector("[data-film-progress]");
      if (progress)
        progress.style.transform = `scaleX(${(time % duration) / duration})`;
    }
    function tick(now) {
      frame = null;
      if (paused || !visible || document.hidden) {
        last = null;
        return;
      }
      if (last !== null) time += Math.min(now - last, 80);
      last = now;
      paint();
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      button.textContent = paused ? "▶ Play" : "Ⅱ Pause";
      button.setAttribute(
        "aria-label",
        `${paused ? "Play" : "Pause"} ${name} animation`,
      );
      if (paused || !visible || document.hidden) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        last = null;
      } else if (frame === null) frame = requestAnimationFrame(tick);
      paint();
    }
    button.addEventListener("click", () => {
      paused = !paused;
      sync();
    });
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        sync();
      },
      { threshold: 0.12 },
    ).observe(root);
    new ResizeObserver(paint).observe(root);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", () => {
      paused = motion.matches;
      sync();
    });
    sync();
  }
  const voc = document.getElementById("voc-film");
  loop(
    voc,
    18000,
    14500,
    (t) => {
      const stage =
        t < 4000
          ? "read"
          : t < 6500
            ? "discover"
            : t < 11500
              ? "analyze"
              : "evidence";
      const descriptions = {
        read: ["01 / READ", "Start with your customers’ own words."],
        discover: [
          "02 / DISCOVER",
          "Find the topics that actually appear in the comments.",
        ],
        analyze: [
          "03 / UNDERSTAND",
          "See sentiment for each topic, not just one overall score.",
        ],
        evidence: [
          "04 / TRACE BACK",
          "Follow a recommendation back to the original comment.",
        ],
      };
      voc.dataset.stage = stage;
      voc.querySelector("[data-scene-label]").textContent =
        descriptions[stage][0];
      voc.querySelector("[data-scene-caption]").textContent =
        descriptions[stage][1];
      voc
        .querySelectorAll(".voc-comments p")
        .forEach((p, i) =>
          p.style.setProperty(
            "--comment-visible",
            String(t > 350 + i * 550 ? 1 : 0),
          ),
        );
    },
    "Voice of Customer",
  );
  const chat = document.getElementById("chat-film");
  const question = "How did our check-in rating change?";
  const answer =
    "The average increased from 3.6 to 4.0 out of 5. Each sample survey contains 5 ratings.";
  loop(
    chat,
    22000,
    18500,
    (t) => {
      const stage =
        t < 2500
          ? "compose"
          : t < 4500
            ? "thinking"
            : t < 9000
              ? "answer"
              : t < 12500
                ? "chart"
                : t < 14500
                  ? "followup"
                  : "calculation";
      chat.dataset.stage = stage;
      const messages = chat.querySelector(".conversation-messages");
      const followup = chat.querySelector(".followup-user");
      const followupScroll = Math.max(
        0,
        followup.offsetTop + followup.offsetHeight - messages.clientHeight + 10,
      );
      const endScroll = messages.scrollHeight - messages.clientHeight;
      const smooth = (value) => {
        const v = Math.max(0, Math.min(1, value));
        return v * v * (3 - 2 * v);
      };
      messages.scrollTop =
        t < 12500
          ? 0
          : t < 14500
            ? followupScroll * smooth((t - 12500) / 900)
            : followupScroll +
              (endScroll - followupScroll) * smooth((t - 14500) / 1100);

      chat.querySelector("#composer-text").textContent =
        t < 2500
          ? question.slice(0, Math.floor(t / 55))
          : "Ask a follow-up about your data…";
      chat.querySelector("#typed-answer").textContent = answer.slice(
        0,
        Math.max(0, Math.floor((t - 4500) / 32)),
      );
      chat.querySelector("[data-scene-caption]").textContent = {
        compose: "Ask a question in your own words.",
        thinking: "The assistant reads your selected data.",
        answer: "Get an answer grounded in the data.",
        chart: "See the comparison as a chart.",
        followup: "Keep asking. The conversation continues.",
        calculation: "Inspect the calculation behind the answer.",
      }[stage];
    },
    "chat",
  );
})();
