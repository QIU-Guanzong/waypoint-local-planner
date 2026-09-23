import "./styles.css";
import { DEFAULT_SCENARIO_ID, getScenario, scenarios } from "./scenarios.js";

const INITIAL_STATE = {
  scenarioId: DEFAULT_SCENARIO_ID,
  activeStage: "constraints",
  planBuilt: false,
  traceOpen: false,
  notice: "Choose a sample brief, then build its local plan."
};

export function createInitialState() {
  return { ...INITIAL_STATE };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

export function renderWorkspace(state) {
  const scenario = getScenario(state.scenarioId);
  const active = scenario.stages.find((stage) => stage.id === state.activeStage) ?? scenario.stages[0];
  const stateTitle = state.planBuilt ? "Plan assembled locally" : "Sample brief selected";
  const stateDetail = state.planBuilt
    ? "The route below was revealed from local example data. No request left this page."
    : state.notice;

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
        <div>
          <p class="section-label">01 / SELECT A BRIEF</p>
          <h2 id="brief-title">${escapeHtml(scenario.title)}</h2>
          <p>${escapeHtml(scenario.goal)}</p>
        </div>
        <div class="brief-meta" aria-label="Scenario constraints">
          ${scenario.constraints.map((constraint) => `<span>${escapeHtml(constraint)}</span>`).join("")}
        </div>
        <fieldset class="scenario-picker" aria-label="Sample planning briefs">
          <legend>Sample brief</legend>
          <div class="scenario-options">
            ${scenarios.map((item) => `
              <button type="button" class="scenario-option ${item.id === scenario.id ? "is-selected" : ""}" data-action="scenario" data-scenario-id="${item.id}" aria-pressed="${item.id === scenario.id}">
                <span>${escapeHtml(item.badge)}</span>${escapeHtml(item.title)}
              </button>
            `).join("")}
          </div>
        </fieldset>
      </section>

      <section class="plan-status" aria-live="polite">
        <span class="status-signal ${state.planBuilt ? "is-built" : ""}" aria-hidden="true"></span>
        <div><b>${stateTitle}</b><p>${stateDetail}</p></div>
        <button class="primary-action" type="button" data-action="build">${state.planBuilt ? "Rebuild local plan" : "Build local plan"}</button>
      </section>

      <section class="work-grid" aria-label="Local planning workspace">
        <aside class="flow-panel" aria-labelledby="flow-title">
          <p class="section-label">02 / READ THE PLAN</p>
          <h2 id="flow-title" class="visually-hidden">Plan stages</h2>
          <ol class="stage-list">
            ${scenario.stages.map((stage, index) => {
              const status = stageStatus(state, stage);
              return `
                <li class="stage ${state.activeStage === stage.id ? "is-active" : ""}">
                  <button type="button" data-action="stage" data-stage-id="${stage.id}" aria-pressed="${state.activeStage === stage.id}">
                    <strong>${String(index + 1).padStart(2, "0")}</strong>
                    <span><b>${escapeHtml(stage.label)}</b><small>${escapeHtml(stage.short)}</small></span>
                    <em class="stage-status is-${status}">${statusText(status)}</em>
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
            <p class="simulation-chip">Local example</p>
          </div>
          <h2 id="plan-title">${escapeHtml(active.label)}</h2>
          <p class="explanation">${escapeHtml(active.explanation)}</p>

          <div class="route-block">
            <div class="route-heading"><p class="section-label">PROPOSED ROUTE</p><span>${escapeHtml(scenario.outcome)}</span></div>
            <ol class="timeline">
              ${scenario.route.map((item) => `
                <li>
                  <time>${escapeHtml(item.time)}</time>
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
          ${scenario.trace.map(([label, detail], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><b>${escapeHtml(label)}</b><p>${escapeHtml(detail)}</p></div></li>`).join("")}
        </ol>
      </section>

      <section class="boundary-note" aria-label="Prototype boundary">
        <span class="boundary-icon" aria-hidden="true">!</span>
        <p><strong>Prototype boundary.</strong> This is a local planning simulation. It does not connect to Alexa+, Amazon, AWS, stores, calendars, accounts, or customer data. It cannot reserve, purchase, send, or complete a real-world action.</p>
      </section>

      <footer class="footer"><p>Designed as a local, reviewable alternative-path prototype. “Alexa+” is used only to describe the hackathon context; this project is not affiliated with Amazon.</p><button type="button" class="reset-action" data-action="reset">Reset local demo</button></footer>
    </main>
  `;
}

export function mount(root) {
  let state = createInitialState();

  function render() {
    root.innerHTML = renderWorkspace(state);
  }

  root.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const action = control.dataset.action;
    if (action === "scenario") {
      state = {
        ...createInitialState(),
        scenarioId: control.dataset.scenarioId,
        notice: "Sample brief changed. Build its local route when you are ready."
      };
    }

    if (action === "stage") {
      state = { ...state, activeStage: control.dataset.stageId };
    }

    if (action === "build") {
      state = {
        ...state,
        planBuilt: true,
        notice: "Plan assembled from local example data. No request left this page."
      };
    }

    if (action === "trace") {
      state = { ...state, traceOpen: !state.traceOpen };
    }

    if (action === "reset") {
      state = createInitialState();
    }

    render();
  });

  render();
}

const root = document.querySelector("#app");
if (root) mount(root);
