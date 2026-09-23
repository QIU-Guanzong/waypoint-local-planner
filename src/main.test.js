/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { createInitialState, mount, renderWorkspace } from "./main.js";

afterEach(() => {
  document.body.innerHTML = "";
});

function renderMountedWorkspace() {
  const root = document.createElement("div");
  document.body.append(root);
  mount(root);
  return root;
}

function submitBrief(root) {
  root.querySelector("#brief-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function setBriefField(root, name, value) {
  const field = root.querySelector(`[data-brief-field="${name}"]`);
  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  return field;
}

describe("Waypoint local planning simulation", () => {
  it("renders the static boundary, selected scenario, and editable brief", () => {
    const view = renderWorkspace(createInitialState());
    expect(view).toContain("Saturday dinner, without the scramble.");
    expect(view).toContain("Finish by");
    expect(view).toContain("no live prices are checked");
    expect(view).toContain("does not connect to Alexa+");
  });

  it("changes the sample and resets its editable values", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-scenario-id="open-house"]').click();
    expect(root.textContent).toContain("Open the studio on time.");
    expect(root.textContent).toContain("2 helpers");
    expect(root.querySelector('[data-brief-field="deadline"]').value).toBe("17:30");
    expect(root.querySelector(".status-signal").classList.contains("is-built")).toBe(false);
  });

  it("builds a route from the selected sample and shows its decision record", () => {
    const root = renderMountedWorkspace();
    submitBrief(root);
    expect(root.textContent).toContain("Plan assembled locally");
    expect(root.querySelector(".status-signal").classList.contains("is-built")).toBe(true);
    expect(root.querySelector(".timeline").textContent).toContain("4:15 PM");

    root.querySelector('[data-action="trace"]').click();
    const trace = root.querySelector("#decision-record");
    expect(trace.hidden).toBe(false);
    expect(trace.textContent).toContain("$90");
    expect(trace.textContent).toContain("Human checkpoint");
  });

  it("applies edited time, budget, and group size without replacing an unbuilt route", () => {
    const root = renderMountedWorkspace();
    submitBrief(root);
    setBriefField(root, "deadline", "19:00");
    setBriefField(root, "budgetCap", "125");
    setBriefField(root, "groupCount", "6");

    expect(root.textContent).toContain("Brief changed — update the plan");
    expect(root.querySelector(".brief-summary").textContent).toContain("6 people");
    expect(root.querySelector(".brief-meta").textContent).toContain("$125 cap");
    expect(root.querySelector(".timeline").textContent).toContain("4:15 PM");
    submitBrief(root);

    expect(root.querySelector(".timeline").textContent).toContain("4:45 PM");
    expect(root.querySelector(".timeline").textContent).toContain("5:45 PM");
    expect(root.querySelector(".timeline").textContent).toContain("6:45 PM");
    expect(root.querySelector(".brief-meta").textContent).toContain("6 diners");
    expect(root.querySelector(".brief-meta").textContent).toContain("$125 cap");
    expect(root.querySelector("#decision-record").textContent).toContain("6 people");
  });

  it("rejects a deadline that would schedule the sample on the previous day", () => {
    const root = renderMountedWorkspace();
    submitBrief(root);
    const field = setBriefField(root, "deadline", "01:00");
    expect(field.min).toBe("02:15");
    submitBrief(root);
    expect(root.textContent).toContain("Brief changed — update the plan");
    expect(root.querySelector(".timeline").textContent).toContain("4:15 PM");
  });

  it("keeps the open-house human checkpoint aligned with its adjusted route", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-scenario-id="open-house"]').click();
    setBriefField(root, "deadline", "18:30");
    submitBrief(root);
    root.querySelector('[data-stage-id="handoff"]').click();
    expect(root.querySelector(".explanation").textContent).toContain("At 6:10 PM");
    expect(root.querySelector("#decision-record").textContent).toContain("At 6:10 PM");
  });

  it("keeps stage controls, focusable state, and reset behavior consistent", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-stage-id="handoff"]').click();
    const handoff = root.querySelector('[data-stage-id="handoff"]');
    expect(handoff.getAttribute("aria-pressed")).toBe("true");
    expect(root.querySelector("#plan-title").textContent).toContain("Hand back a clear next action");

    root.querySelector("[data-action='reset']").click();
    expect(root.textContent).toContain("Sample brief ready");
    expect(root.querySelector("#decision-record").hidden).toBe(true);
    expect(root.querySelector('[data-brief-field="deadline"]').value).toBe("18:30");
  });
});
