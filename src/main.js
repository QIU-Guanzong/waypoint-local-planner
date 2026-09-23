import { DEFAULT_SCENARIO_ID, getScenario, scenarios } from "./scenarios.js";

function scenarioBrief(scenario) {
  return {
    deadline: scenario.deadline,
    budgetCap: scenario.budgetCap == null ? "" : String(scenario.budgetCap),
    groupCount: scenario.groupCount == null ? "" : String(scenario.groupCount)
  };
}

export function createInitialState(scenarioId = DEFAULT_SCENARIO_ID) {
  const scenario = getScenario(scenarioId);
  return {
    scenarioId: scenario.id,
    activeStage: "constraints",
    planBuilt: false,
    planBrief: null,
    draftBrief: scenarioBrief(scenario),
    traceOpen: false,
    notice: "Adjust a sample brief, then build its local plan."
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeBrief(brief, scenario) {
  const budget = brief.budgetCap === "" ? null : Number(brief.budgetCap);
  const groupCount = scenario.groupLabel ? Number(brief.groupCount) : null;
  return {
    deadline: brief.deadline,
    budgetCap: Number.isFinite(budget) && budget >= 0 ? budget : null,
    groupCount: Number.isInteger(groupCount) && groupCount > 0 ? groupCount : null
  };
}

function minimumDeadline(scenario) {
  const minutes = scenario.scheduleOffsets[0];
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const remainder = String(minutes % 60).padStart(2, "0");
  return `${hours}:${remainder}`;
}

function sameBrief(left, right) {
  return Boolean(left && right)
    && left.deadline === right.deadline
    && left.budgetCap === right.budgetCap
    && left.groupCount === right.groupCount;
}

function parseClock(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatTime(value) {
  const minutes = parseClock(value);
  if (minutes === null) return "the selected time";
  const hour24 = Math.floor(minutes / 60);
  const hour12 = hour24 % 12 || 12;
  const minutePart = String(minutes % 60).padStart(2, "0");
  const period = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minutePart} ${period}`;
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatGoal(scenario, brief) {
  if (scenario.id === "dinner") {
    const people = brief.groupCount ?? scenario.groupCount;
    const cap = brief.budgetCap == null ? "" : `, under ${formatMoney(brief.budgetCap)}`;
    return `Plan a relaxed dinner for ${people} ${people === 1 ? "person" : "people"} by ${formatTime(brief.deadline)}${cap}, with one grocery stop.`;
  }
  if (scenario.id === "open-house") {
    const helpers = brief.groupCount ?? scenario.groupCount;
    return `Prepare a welcoming studio open house by ${formatTime(brief.deadline)} with ${helpers} ${helpers === 1 ? "helper" : "helpers"}; leave room for one late delivery.`;
  }
  return `Fit errands, a shared meal, and two quiet hours into Saturday by ${formatTime(brief.deadline)}, while leaving a buffer for plans that change.`;
}

function getConstraintLabels(scenario, brief) {
  const labels = [`Finish by ${formatTime(brief.deadline)}`];
  if (scenario.groupLabel) {
    const count = brief.groupCount ?? scenario.groupCount;
    labels.push(`${count} ${scenario.groupLabel.toLowerCase()}`);
  }
  if (brief.budgetCap != null) labels.push(`${formatMoney(brief.budgetCap)} cap`);
  return [...labels, ...scenario.constraints];
}

function getPlanBrief(state, scenario) {
  if (state.planBuilt && state.planBrief) return state.planBrief;
  return normalizeBrief(state.draftBrief, scenario);
}

function isDraftDirty(state, scenario) {
  if (!state.planBuilt || !state.planBrief) return false;
  return !sameBrief(normalizeBrief(state.draftBrief, scenario), state.planBrief);
}

function getRoute(scenario, brief) {
  const deadline = parseClock(brief.deadline);
  if (deadline === null) return scenario.route;
  return scenario.route.map((item, index) => {
    const minutes = (deadline - scenario.scheduleOffsets[index] + 24 * 60) % (24 * 60);
    const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    return { ...item, displayTime: formatTime(time) };
  });
}

function stageStatus(state, stage) {
  if (!state.planBuilt) return stage.id === "constraints" ? "ready" : "waiting";
  return stage.id === state.activeStage ? "current" : "ready";
}

function statusText(status) {
  if (status === "current") return "In view";
  if (status === "ready") return "Ready";
  return "Waiting";
}

function statusCopy(state, scenario) {
  if (isDraftDirty(state, scenario)) {
    return {
      title: "Brief changed — update the plan",
      detail: "The route still shows the previous version. Rebuild it to apply the new time, cap, or group size."
    };
  }
  if (state.planBuilt) {
    return {
      title: "Plan assembled locally",
      detail: `The sample route is scheduled to finish by ${formatTime(state.planBrief.deadline)}. No request left this page.`
    };
  }
  return {
    title: "Sample brief ready",
    detail: state.notice
  };
}

function stageExplanation(scenario, stage, brief) {
  if (scenario.id === "open-house" && stage.id === "handoff") {
    const handoffTime = getRoute(scenario, brief)[2]?.displayTime ?? "the final step";
    return `At ${handoffTime}, decide whether the delivery belongs in the room. This prototype does not contact vendors or change the schedule.`;
  }
  if (stage.id !== "constraints") return stage.explanation;
  if (scenario.id === "dinner") {
    const groupCount = brief.groupCount ?? scenario.groupCount;
    const cap = brief.budgetCap == null ? "no spending cap" : `${formatMoney(brief.budgetCap)} spending cap`;
    return `The fixed points are the ${formatTime(brief.deadline)} dinner time, ${groupCount} ${groupCount === 1 ? "diner" : "diners"}, a single-store trip, and the ${cap}. The local simulation does not check live prices.`;
  }
  if (scenario.id === "open-house") {
    const count = brief.groupCount ?? scenario.groupCount;
    return `The ${formatTime(brief.deadline)} opening time, ${count} ${count === 1 ? "helper" : "helpers"}, and a clear arrival path stay fixed. The late delivery remains optional.`;
  }
  return stage.explanation;
}

function decisionRecord(scenario, brief) {
  const checkpoint = scenario.id === "open-house"
    ? `At ${getRoute(scenario, brief)[2]?.displayTime ?? "the final step"}, decide whether to include the late item.`
    : scenario.trace[3][1];
  return [
    ["Brief captured", formatGoal(scenario, brief)],
    ["Working assumption", scenario.trace[1][1]],
    ["Route selected", `${scenario.trace[2][1]} Scheduled backward from ${formatTime(brief.deadline)}.`],
    ["Human checkpoint", checkpoint]
  ];
}

function renderBriefFields(scenario, brief) {
  const budgetValue = brief.budgetCap == null ? "" : String(brief.budgetCap);
  const groupField = scenario.groupLabel
    ? `<label class="brief-field brief-field--compact"><span>${escapeHtml(scenario.groupLabel)}</span><input type="number" name="groupCount" data-brief-field="groupCount" min="1" max="20" step="1" required value="${escapeHtml(brief.groupCount ?? scenario.groupCount)}" aria-describedby="group-help"><small id="group-help">Use a whole number from 1 to 20.</small></label>`
    : "";
  return `
    <form id="brief-form" class="brief-editor" aria-labelledby="brief-form-title">
      <div class="brief-editor-heading"><div><p class="section-label">ADJUST THIS SAMPLE</p><h3 id="brief-form-title">Set the boundary that matters.</h3></div><p>Only the finish time changes the route. The spending cap is recorded, not price-checked.</p></div>
      <div class="brief-fields">
        <label class="brief-field brief-field--time"><span>Finish by</span><input type="time" name="deadline" data-brief-field="deadline" min="${minimumDeadline(scenario)}" required value="${escapeHtml(brief.deadline)}" aria-describedby="time-help"><small id="time-help">The route is scheduled backward from this time, on the same day.</small></label>
        <label class="brief-field"><span>Spending cap <em>optional · USD</em></span><input type="number" name="budgetCap" data-brief-field="budgetCap" min="0" max="1000000" step="1" value="${escapeHtml(budgetValue)}" placeholder="No cap"><small>Local example only; no live prices are checked.</small></label>
        ${groupField}
      </div>
    </form>
  `;
}

export function renderWorkspace(state) {
  const scenario = getScenario(state.scenarioId);
  const brief = getPlanBrief(state, scenario);
  const active = scenario.stages.find((stage) => stage.id === state.activeStage) ?? scenario.stages[0];
  const route = getRoute(scenario, brief);
  const status = statusCopy(state, scenario);
  const trace = decisionRecord(scenario, brief);

  return `
    <main class="workspace" aria-labelledby="page-title">
      <header class="topbar">
        <a class="wordmark" href="#overview" aria-label="Waypoint home">
          <span class="wordmark-mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>WAYPOINT</span>
        </a>
        <p class="prototype-note">Local simulation <span aria-hidden="true">·</span> no service connected</p>
      </header>

      <section class="intro" id="overview">
        <p class="eyebrow">A transparent agent-style workflow</p>
        <h1 id="page-title">Make the next move<br />easy to trust.</h1>
        <p class="lede">Waypoint turns a household goal into a visible sequence. Every recommendation names the constraint it protects, the assumption it makes, and the person who remains in control.</p>
      </section>

      <section class="brief-panel" aria-labelledby="brief-title">
        <div class="brief-overview">
          <p class="section-label">01 / START WITH A BRIEF</p>
          <h2 id="brief-title">${escapeHtml(scenario.title)}</h2>
          <p class="brief-summary">${escapeHtml(formatGoal(scenario, normalizeBrief(state.draftBrief, scenario)))}</p>
        </div>
        <div class="brief-meta" aria-label="Current brief boundaries">
          ${getConstraintLabels(scenario, normalizeBrief(state.draftBrief, scenario)).map((constraint) => `<span>${escapeHtml(constraint)}</span>`).join("")}
        </div>
        <fieldset class="scenario-picker" aria-label="Sample planning briefs">
          <legend>Start from a sample</legend>
          <div class="scenario-options">
            ${scenarios.map((item) => `
              <button type="button" class="scenario-option ${item.id === scenario.id ? "is-selected" : ""}" data-action="scenario" data-scenario-id="${item.id}" aria-pressed="${item.id === scenario.id}">
                <span>${escapeHtml(item.badge)}</span>${escapeHtml(item.title)}
              </button>
            `).join("")}
          </div>
        </fieldset>
        ${renderBriefFields(scenario, state.draftBrief)}
      </section>

      <section class="plan-status" aria-live="polite" aria-atomic="true">
        <span class="status-signal ${state.planBuilt && !isDraftDirty(state, scenario) ? "is-built" : ""}" aria-hidden="true"></span>
        <div><b id="plan-status-title" tabindex="-1">${escapeHtml(status.title)}</b><p id="plan-status-detail">${escapeHtml(status.detail)}</p></div>
        <button class="primary-action" type="submit" form="brief-form">${state.planBuilt ? "Update local plan" : "Build local plan"}</button>
      </section>

      <section class="work-grid" aria-label="Local planning workspace">
        <aside class="flow-panel" aria-labelledby="flow-title">
          <p class="section-label">02 / READ THE PLAN</p>
          <h2 id="flow-title" class="visually-hidden">Plan stages</h2>
          <ol class="stage-list">
            ${scenario.stages.map((stage, index) => {
              const statusName = stageStatus(state, stage);
              return `
                <li class="stage ${state.activeStage === stage.id ? "is-active" : ""}">
                  <button type="button" data-action="stage" data-stage-id="${stage.id}" aria-pressed="${state.activeStage === stage.id}">
                    <strong>${String(index + 1).padStart(2, "0")}</strong>
                    <span><b>${escapeHtml(stage.label)}</b><small>${escapeHtml(stage.short)}</small></span>
                    <em class="stage-status is-${statusName}">${statusText(statusName)}</em>
                  </button>
                </li>
              `;
            }).join("")}
          </ol>
          <button type="button" class="text-action" data-action="trace" aria-expanded="${state.traceOpen}" aria-controls="decision-record">${state.traceOpen ? "Hide decision record" : "Show decision record"}</button>
        </aside>

        <section class="plan-panel" aria-labelledby="plan-title">
          <div class="panel-heading">
            <p class="section-label">CURRENT VIEW / ${escapeHtml(active.id.toUpperCase())}</p>
            <p class="simulation-chip">${state.planBuilt ? "Rule-based local example" : "Sample route"}</p>
          </div>
          <h2 id="plan-title" tabindex="-1">${escapeHtml(active.label)}</h2>
          <p class="explanation">${escapeHtml(stageExplanation(scenario, active, brief))}</p>

          <div class="route-block">
            <div class="route-heading"><p class="section-label">PROPOSED ROUTE</p><span>${escapeHtml(scenario.outcome)}</span></div>
            <ol class="timeline">
              ${route.map((item) => `
                <li>
                  <time>${escapeHtml(item.displayTime ?? item.time)}</time>
                  <div><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.detail)}</p></div>
                </li>
              `).join("")}
            </ol>
          </div>

          <div class="checkpoint">
            <span class="checkpoint-number">03</span>
            <div><p class="section-label">PERSON CHECKPOINT</p><p>Before anything happens outside this page, review the assumptions and choose the next action yourself.</p></div>
          </div>
        </section>
      </section>

      <section id="decision-record" class="trace-panel ${state.traceOpen ? "is-open" : ""}" ${state.traceOpen ? "" : "hidden"} aria-label="Decision record">
        <div class="trace-heading"><div><p class="section-label">DECISION RECORD</p><h2>What the local example used.</h2></div><button type="button" class="close-trace" data-action="trace" aria-label="Hide decision record">Close</button></div>
        <ol>
          ${trace.map(([label, detail], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><b>${escapeHtml(label)}</b><p>${escapeHtml(detail)}</p></div></li>`).join("")}
        </ol>
      </section>

      <section class="boundary-note" aria-label="Prototype boundary">
        <span class="boundary-icon" aria-hidden="true">!</span>
        <p><strong>Prototype boundary.</strong> This is a local rule-based simulation. It does not connect to Alexa+, Amazon, AWS, stores, calendars, accounts, or customer data. Budget caps are not checked against live prices. It cannot reserve, purchase, send, or complete a real-world action.</p>
      </section>

      <footer class="footer"><p>Designed as a local, reviewable alternative-path prototype. “Alexa+” is used only to describe the hackathon context; this project is not affiliated with Amazon.</p><button type="button" class="reset-action" data-action="reset">Reset local demo</button></footer>
    </main>
  `;
}

function updateStatus(root, state) {
  const scenario = getScenario(state.scenarioId);
  const status = statusCopy(state, scenario);
  const title = root.querySelector("#plan-status-title");
  const detail = root.querySelector("#plan-status-detail");
  const signal = root.querySelector(".status-signal");
  if (!title || !detail || !signal) return;
  title.textContent = status.title;
  detail.textContent = status.detail;
  signal.classList.toggle("is-built", state.planBuilt && !isDraftDirty(state, scenario));
}

function updateBriefSummary(root, state) {
  const scenario = getScenario(state.scenarioId);
  const brief = normalizeBrief(state.draftBrief, scenario);
  const summary = root.querySelector(".brief-summary");
  const meta = root.querySelector(".brief-meta");
  if (summary) summary.textContent = formatGoal(scenario, brief);
  if (meta) {
    meta.replaceChildren(...getConstraintLabels(scenario, brief).map((label) => {
      const chip = document.createElement("span");
      chip.textContent = label;
      return chip;
    }));
  }
}

export function mount(root) {
  let state = createInitialState();

  function render() {
    root.innerHTML = renderWorkspace(state);
  }

  function restoreFocus(action, target) {
    if (action === "scenario") root.querySelector(`[data-action="scenario"][data-scenario-id="${state.scenarioId}"]`)?.focus({ preventScroll: true });
    else if (action === "stage") root.querySelector(`[data-action="stage"][data-stage-id="${target}"]`)?.focus({ preventScroll: true });
    else if (action === "trace") root.querySelector(state.traceOpen ? ".close-trace" : ".text-action")?.focus({ preventScroll: true });
    else if (action === "reset") root.querySelector(`[data-action="scenario"][data-scenario-id="${state.scenarioId}"]`)?.focus({ preventScroll: true });
  }

  root.addEventListener("input", (event) => {
    const field = event.target.dataset.briefField;
    if (!field) return;
    state = { ...state, draftBrief: { ...state.draftBrief, [field]: event.target.value } };
    updateBriefSummary(root, state);
    updateStatus(root, state);
  });

  root.addEventListener("submit", (event) => {
    if (event.target.id !== "brief-form") return;
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const scenario = getScenario(state.scenarioId);
    const planBrief = normalizeBrief(state.draftBrief, scenario);
    const deadline = parseClock(planBrief.deadline);
    if (deadline === null || deadline < scenario.scheduleOffsets[0] || (scenario.groupLabel && planBrief.groupCount === null)) return;
    state = {
      ...state,
      planBuilt: true,
      planBrief,
      activeStage: "constraints",
      notice: "Plan assembled from the current local brief. No request left this page."
    };
    render();
    root.querySelector("#plan-status-title")?.focus({ preventScroll: true });
  });

  root.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const action = control.dataset.action;
    const target = control.dataset.stageId;
    if (action === "scenario") {
      state = createInitialState(control.dataset.scenarioId);
    } else if (action === "stage") {
      state = { ...state, activeStage: target };
    } else if (action === "trace") {
      state = { ...state, traceOpen: !state.traceOpen };
    } else if (action === "reset") {
      state = createInitialState();
    } else {
      return;
    }

    render();
    restoreFocus(action, target);
  });

  render();
}

const root = document.querySelector("#app");
if (root) mount(root);
