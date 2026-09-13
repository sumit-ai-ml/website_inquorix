// Customer Analytics product concept. All survey data below is fictional.
(() => {
  const sites = {
    city: {
      name: "City hotel",
      current: {
        responses: 240,
        satisfied: 180,
        promoters: 110,
        detractors: 70,
        comments: 180,
        invited: 600,
        delivered: 590,
        started: 300,
      },
      previous: {
        responses: 200,
        satisfied: 172,
        promoters: 120,
        detractors: 40,
        comments: 140,
        invited: 600,
        delivered: 588,
        started: 248,
      },
    },
    coast: {
      name: "Coast retreat",
      current: {
        responses: 160,
        satisfied: 146,
        promoters: 100,
        detractors: 20,
        comments: 100,
        invited: 400,
        delivered: 395,
        started: 185,
      },
      previous: {
        responses: 140,
        satisfied: 126,
        promoters: 84,
        detractors: 28,
        comments: 98,
        invited: 420,
        delivered: 412,
        started: 165,
      },
    },
    airport: {
      name: "Airport hotel",
      current: {
        responses: 80,
        satisfied: 68,
        promoters: 50,
        detractors: 16,
        comments: 56,
        invited: 200,
        delivered: 195,
        started: 95,
      },
      previous: {
        responses: 60,
        satisfied: 46,
        promoters: 36,
        detractors: 12,
        comments: 42,
        invited: 180,
        delivered: 176,
        started: 78,
      },
    },
  };
  const metricDefs = {
    csat: {
      label: "Satisfaction",
      title: "Satisfaction over time",
      unit: "%",
      definition:
        "CSAT = satisfied or very satisfied answers ÷ all valid satisfaction answers. Every completed response in this sample has a valid answer.",
      get: (d) => (d.satisfied / d.responses) * 100,
      base: (d) => `${d.satisfied} of ${d.responses} satisfied`,
    },
    nps: {
      label: "NPS",
      title: "Recommendation over time",
      unit: "",
      definition:
        "NPS = percentage of promoters (ratings 9–10) minus detractors (0–6). Passives (7–8) remain in the denominator.",
      get: (d) => ((d.promoters - d.detractors) / d.responses) * 100,
      base: (d) => `${d.promoters} promoters · ${d.detractors} detractors`,
    },
    responses: {
      label: "Responses",
      title: "Completed responses over time",
      unit: "",
      definition:
        "Count of completed survey responses. Email is the only collection channel in this fictional example.",
      get: (d) => d.responses,
      base: (d) => `${d.started} started the survey`,
    },
    email: {
      label: "Email response rate",
      title: "Email response rate over time",
      unit: "%",
      definition:
        "Completed survey responses ÷ delivered email invitations. Sent but undelivered invitations are excluded.",
      get: (d) => (d.responses / d.delivered) * 100,
      base: (d) => `${d.responses} of ${d.delivered} delivered invites`,
    },
    comments: {
      label: "Written comments",
      title: "Written feedback over time",
      unit: "",
      definition:
        "Written answers submitted by completed respondents. Theme categories may overlap within a comment.",
      get: (d) => d.comments,
      base: (d) => `From ${d.responses} completed responses`,
    },
  };
  let scope = "all",
    metric = "csat",
    granularity = "monthly";
  const $ = (id) => document.getElementById(id);
  const round = (n) => Math.round(n * 10) / 10;
  const number = (n) =>
    round(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
  const fmt = (key, value) => `${number(value)}${metricDefs[key].unit}`;
  const scopedName = () =>
    scope === "all" ? "All locations" : sites[scope].name;
  function totals(key, site = scope) {
    if (site !== "all") return sites[site][key];
    return Object.keys(sites.city[key]).reduce(
      (sum, k) => ({
        ...sum,
        [k]: Object.values(sites).reduce((v, s) => v + s[key][k], 0),
      }),
      {},
    );
  }
  function delta(key, current, previous) {
    const diff = metricDefs[key].get(current) - metricDefs[key].get(previous);
    return `${diff >= 0 ? "+" : "−"}${number(Math.abs(diff))}${metricDefs[key].unit === "%" ? " pp" : key === "nps" ? " pts" : ""}`;
  }
  function historical(key) {
    const c = metricDefs[key].get(totals("current")),
      p = metricDefs[key].get(totals("previous"));
    return [p * 0.94, p * 0.97, p * 0.95, p * 0.99, p, c].map((v) =>
      ["responses", "comments"].includes(key) ? Math.round(v) : round(v),
    );
  }
  function spark(values) {
    const lo = Math.min(...values) - 2,
      hi = Math.max(...values) + 2;
    return values
      .map((v, i) => `${3 + i * 31},${27 - ((v - lo) / (hi - lo)) * 23}`)
      .join(" ");
  }
  function renderMetrics() {
    const c = totals("current"),
      p = totals("previous");
    $("metrics").innerHTML = Object.entries(metricDefs)
      .map(([key, m]) => {
        const diff = m.get(c) - m.get(p);
        return `<button class="metric" data-metric="${key}" aria-pressed="${key === metric}"><span class="metric-label">${m.label}</span><strong class="metric-value">${fmt(key, m.get(c))}</strong><span class="metric-change ${diff >= 0 ? "positive" : "negative"}">${delta(key, c, p)} vs July</span><span class="metric-base">${m.base(c)}</span><svg viewBox="0 0 162 32" aria-hidden="true"><polyline class="chart-line" points="${spark(historical(key))}"/></svg></button>`;
      })
      .join("");
  }
  function weeklyData() {
    const c = totals("current");
    const weights = [0.22, 0.24, 0.26, 0.28];
    const split = (n) => {
      const a = weights.slice(0, 3).map((w) => Math.round(n * w));
      return [...a, n - a.reduce((v, x) => v + x, 0)];
    };
    const data = weights.map(() => ({}));
    Object.entries(c).forEach(([key, value]) =>
      split(value).forEach((v, i) => (data[i][key] = v)),
    );
    return data;
  }
  function renderTrend() {
    const m = metricDefs[metric],
      previous = m.get(totals("previous"));
    const weekly = granularity === "weekly";
    const labels = weekly
      ? ["1–7 Aug", "8–14 Aug", "15–21 Aug", "22–31 Aug"]
      : ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const values = weekly ? weeklyData().map(m.get) : historical(metric);
    const lo = metric === "nps" ? -100 : 0,
      hi = ["csat", "email", "nps"].includes(metric)
        ? 100
        : Math.ceil(Math.max(...values, weekly ? 0 : previous) / 50) * 50;
    const x = (i) => 48 + (i * 445) / (values.length - 1),
      y = (v) => 172 - ((v - lo) / (hi - lo)) * 145;
    const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
    const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    $("trend-heading").textContent = m.title;
    $("trend-meta").innerHTML =
      `<span>— ${scopedName()}</span>${weekly ? "" : `<span>┄ July baseline: ${fmt(metric, previous)}</span>`}`;
    $("overview-chart").innerHTML =
      `<svg viewBox="0 0 535 212" role="img" aria-label="${m.label}, ${scopedName()}: ${labels.map((l, i) => `${l} ${fmt(metric, values[i])}`).join(", ")}. Sample data.">${ticks.map((v) => `<line x1="48" x2="493" y1="${y(v)}" y2="${y(v)}" class="chart-grid"/><text x="39" y="${y(v) + 3}" text-anchor="end">${Math.round(v)}${m.unit}</text>`).join("")}${weekly ? "" : `<line x1="48" x2="493" y1="${y(previous)}" y2="${y(previous)}" class="baseline"/>`}<polyline class="chart-line" points="${line}"/>${values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#518157"><title>${labels[i]}: ${fmt(metric, v)}</title></circle>`).join("")}${labels.map((l, i) => `<text x="${x(i)}" y="199" text-anchor="middle">${l}</text>`).join("")}</svg>`;
    $("trend-note").textContent = weekly
      ? "August response periods. The final period covers 10 days; count totals are not directly comparable to 7-day periods. Rates use each period’s own denominator."
      : "Illustrative monthly history. July and August match the survey comparison above; earlier months are example history.";
    $("trend-table").innerHTML =
      `<table><caption class="sr-only">${m.label}, ${scopedName()}</caption><thead><tr><th scope="col">Period</th><th scope="col">${m.label}</th></tr></thead><tbody>${labels.map((l, i) => `<tr><th scope="row">${l}</th><td>${fmt(metric, values[i])}</td></tr>`).join("")}</tbody></table><p>${m.definition}</p>`;
  }
  function renderLocations() {
    $("location-breakdown").innerHTML = Object.entries(sites)
      .map(([id, s]) => {
        const score = metricDefs.csat.get(s.current);
        return `<button class="location-row ${scope === id ? "active" : ""}" data-location="${id}" aria-pressed="${scope === id}"><span class="location-title">${s.name}<strong>${fmt("csat", score)}</strong></span><span class="location-scorebar"><span><i style="width:${score}%"></i></span><span class="${score >= metricDefs.csat.get(s.previous) ? "positive" : "negative"}">${delta("csat", s.current, s.previous)}</span></span><span class="location-foot">${s.current.responses} responses · ${s.current.satisfied} satisfied · view location →</span></button>`;
      })
      .join("");
  }
  function renderCoverage() {
    const c = totals("current");
    const rows = [
      ["Invitations sent", c.invited],
      ["Email delivered", c.delivered],
      ["Survey started", c.started],
      ["Completed", c.responses],
    ];
    $("response-funnel").innerHTML = rows
      .map(
        ([label, value]) =>
          `<div class="funnel-row"><span>${label}</span><span class="funnel-bar"><i style="width:${(value / c.invited) * 100}%"></i></span><strong>${value}</strong></div>`,
      )
      .join("");
    $("coverage-takeaway").innerHTML =
      `<strong>${c.started - c.responses} started but did not finish.</strong><p>${number((c.responses / c.started) * 100)}% of starts became completed responses. ${c.delivered - c.responses} delivered invitations did not produce a completed response. ${c.invited - c.delivered} invitations were not delivered.</p><p><strong>${c.comments} written answers</strong> were submitted. This is an answer count, not another funnel stage.</p>`;
  }
  function render() {
    renderMetrics();
    renderTrend();
    renderLocations();
    renderCoverage();
  }
  $("location-filter").addEventListener("change", (event) => {
    scope = event.target.value;
    render();
    $("app-status").textContent = `Overview updated for ${scopedName()}.`;
  });
  $("location-breakdown").addEventListener("click", (event) => {
    const b = event.target.closest("[data-location]");
    if (!b) return;
    scope = b.dataset.location;
    $("location-filter").value = scope;
    render();
    $("location-breakdown")
      .querySelector(`[data-location="${scope}"]`)
      .focus({ preventScroll: true });
    $("app-status").textContent = `Overview updated for ${scopedName()}.`;
  });
  $("metrics").addEventListener("click", (event) => {
    const b = event.target.closest("[data-metric]");
    if (!b) return;
    metric = b.dataset.metric;
    renderMetrics();
    renderTrend();
    $("metrics")
      .querySelector(`[data-metric="${metric}"]`)
      .focus({ preventScroll: true });
    $("app-status").textContent =
      `Showing ${metricDefs[metric].label.toLowerCase()} trend.`;
  });
  document.querySelectorAll("[data-granularity]").forEach((b) =>
    b.addEventListener("click", () => {
      granularity = b.dataset.granularity;
      document
        .querySelectorAll("[data-granularity]")
        .forEach((button) =>
          button.setAttribute("aria-pressed", String(button === b)),
        );
      renderTrend();
      $("app-status").textContent = `Showing ${granularity} trend.`;
    }),
  );
  $("reset-demo").addEventListener("click", () => {
    scope = "all";
    metric = "csat";
    granularity = "monthly";
    $("location-filter").value = scope;
    document
      .querySelectorAll("[data-granularity]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.granularity === granularity),
        ),
      );
    render();
    $("app-status").textContent = "Demo restored to the original sample.";
  });
  $("export-summary").addEventListener("click", () => {
    const c = totals("current"),
      p = totals("previous");
    const text = [
      "INQUORIX — CUSTOMER ANALYTICS",
      "Fictional product concept; not live business data.",
      `${scopedName()} · August 2026 vs July 2026`,
      "",
      ...Object.entries(metricDefs).map(
        ([key, m]) =>
          `${m.label}: ${fmt(key, m.get(c))} (${delta(key, c, p)} vs July). ${m.base(c)}.`,
      ),
      "",
      "Response coverage",
      `Invitations sent: ${c.invited}. Delivered: ${c.delivered}. Started: ${c.started}. Completed: ${c.responses}.`,
      `Completion rate: ${number((c.responses / c.started) * 100)}% of starts.`,
      "",
      "Comparison notes: same survey questions, different respondent groups. Rates use the denominators shown above.",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquorix-overview-${scope}-sample.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("app-status").textContent = "Sample overview downloaded.";
  });
  render();
})();

(() => {
  const links = Array.from(document.querySelectorAll(".sidebar nav a"));
  let pending = false;
  function updateNavigation() {
    pending = false;
    let active = links[0];
    links.forEach((link) => {
      if (document.querySelector(link.hash).getBoundingClientRect().top <= 150)
        active = link;
    });
    links.forEach((link) => {
      link.classList.toggle("nav-active", link === active);
      if (link === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(updateNavigation);
      }
    },
    { passive: true },
  );
  updateNavigation();
})();
