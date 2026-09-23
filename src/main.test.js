/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { createInitialState, mount, renderWorkspace } from "./main.js";

afterEach(() => {
  document.body.innerHTML = "";
});

function renderMountedWorkspace() {
  const announcer = document.createElement("div");
  announcer.id = "live-announcer";
  document.body.append(announcer);
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

function sendConversation(root, message) {
  const input = root.querySelector("#conversation-input");
  input.value = message;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  root.querySelector("#conversation-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

describe("Waypoint local planning simulation", () => {
  it("renders the static boundary, selected scenario, and editable brief", () => {
    const view = renderWorkspace(createInitialState());
    expect(view).toContain("Saturday dinner, without the scramble.");
    expect(view).toContain("Finish by");
    expect(view).toContain("no live prices are checked");
    expect(view).toContain("does not connect to external services");
    expect(view).not.toMatch(/Alexa\+|Amazon|AWS/);
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
    expect(root.querySelector(".explanation").textContent).toContain("At 6:20 PM");
    expect(root.querySelector("#decision-record").textContent).toContain("At 6:20 PM");
  });

  it("keeps the prior route until a simulated delay is applied, then restores it only after review", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-scenario-id="open-house"]').click();
    setBriefField(root, "deadline", "18:30");
    submitBrief(root);
    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");

    root.querySelector('[data-action="delivery-delay"]').click();
    expect(root.textContent).toContain("Delivery delay — update the plan");
    expect(root.textContent).toContain("current route stays unchanged");
    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");
    expect(root.querySelector('[data-brief-field="deadline"]').value).toBe("18:30");
    submitBrief(root);

    expect(root.querySelector(".timeline").textContent).toContain("Keep the opening path clear");
    expect(root.querySelector(".timeline").textContent).toContain("6:50 PM, after the 6:30 PM opening");
    expect(root.querySelector("#decision-record").textContent).toContain("30 minutes late");
    expect(root.querySelector("#decision-record").textContent).toContain("confirm the opening without the late item");

    root.querySelector('[data-action="delivery-delay"]').click();
    expect(root.textContent).toContain("Delivery response changed — update the plan");
    expect(root.querySelector(".timeline").textContent).toContain("Keep the opening path clear");
    submitBrief(root);
    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");
  });

  it("can build the first route around a delay that arrives before any plan exists", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-scenario-id="open-house"]').click();
    root.querySelector('[data-action="delivery-delay"]').click();

    expect(root.textContent).toContain("Delay simulated — build the plan");
    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");
    expect(root.querySelector(".disruption-preview").textContent).toContain("5:50 PM, after the 5:30 PM opening");
    root.querySelector("#brief-form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(root.querySelector(".timeline").textContent).toContain("Keep the opening path clear");
    expect(root.querySelector(".timeline").textContent).toContain("5:50 PM, after the 5:30 PM opening");
  });

  it("carries a delivery-delay conversation through explanation and explicit plan application", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-scenario-id="open-house"]').click();
    submitBrief(root);
    sendConversation(root, "The delivery is 30 minutes late.");

    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");
    expect(root.querySelector(".conversation-log").textContent).toContain("5:50 PM");
    expect(document.querySelector("#live-announcer").textContent).toContain("5:50 PM");
    expect(root.querySelector("#conversation-input")).toBe(document.activeElement);

    root.querySelector('[data-action="conversation-prompt"][data-prompt="What stays on time?"]').click();
    expect(root.querySelector(".conversation-log").textContent).toContain("The 5:30 PM opening stays fixed");
    expect(document.querySelector("#live-announcer").textContent).toContain("opening stays fixed");
    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");

    root.querySelector('[data-action="conversation-prompt"][data-prompt="Apply the revised route"]').click();
    expect(root.querySelector(".timeline").textContent).toContain("Keep the opening path clear");
    expect(root.querySelector(".timeline").textContent).toContain("5:50 PM, after the 5:30 PM opening");
    expect(root.querySelector(".conversation-log").textContent).toContain("The local route is updated");
    root.querySelector('[data-action="conversation-prompt"][data-prompt="Clear the delay"]').click();
    expect(root.querySelector(".timeline").textContent).toContain("Keep the opening path clear");
    expect(root.querySelector(".conversation-log").textContent).toContain("The current route remains in place until you apply");
    root.querySelector('[data-action="conversation-prompt"][data-prompt="Apply the revised route"]').click();
    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");
  });

  it("keeps an edited finish time as a draft until the person applies it", () => {
    const root = renderMountedWorkspace();
    submitBrief(root);
    sendConversation(root, "Move dinner to 7:00 PM.");

    expect(root.textContent).toContain("Brief changed — update the plan");
    expect(root.querySelector(".timeline").textContent).toContain("4:15 PM");
    expect(root.querySelector(".conversation-log").textContent).toContain("The route will finish by 7:00 PM");

    sendConversation(root, "Apply the proposed plan.");
    expect(root.querySelector(".timeline").textContent).toContain("4:45 PM");
    expect(root.querySelector(".timeline").textContent).toContain("6:45 PM");
    expect(root.querySelector(".timeline").textContent).not.toContain("4:15 PM");
  });

  it("keeps a time constraint when a delivery change and opening time arrive in one turn", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-scenario-id="open-house"]').click();
    submitBrief(root);
    sendConversation(root, "The delivery is late. Keep the opening at 5:30 PM.");

    expect(root.querySelector(".conversation-log").textContent).toContain("kept the 5:30 PM opening fixed");
    expect(root.querySelector(".conversation-log").textContent).toContain("projected at 5:50 PM");
    expect(root.querySelector(".timeline").textContent).toContain("Absorb the late delivery");
    root.querySelector('[data-action="conversation-prompt"][data-prompt="Apply the revised route"]').click();
    expect(root.querySelector(".timeline").textContent).toContain("Keep the opening path clear");
  });

  it("does not stage a delay when the person explicitly says the delivery is not late", () => {
    const root = renderMountedWorkspace();
    root.querySelector('[data-scenario-id="open-house"]').click();
    submitBrief(root);
    sendConversation(root, "The delivery is not late.");

    expect(root.querySelector(".disruption-preview")).toBeNull();
    expect(root.querySelector(".conversation-log").textContent).toContain("No delivery delay was staged.");

    sendConversation(root, "Don't stage another delivery delay.");
    expect(root.querySelector(".disruption-preview")).toBeNull();
    expect(root.querySelector(".conversation-log").textContent).toContain("No delivery delay was staged.");
  });

  it("rejects a finish time that would move the route into the previous day", () => {
    const root = renderMountedWorkspace();
    sendConversation(root, "Move dinner to 1:00 AM.");

    expect(root.querySelector('[data-brief-field="deadline"]').value).toBe("18:30");
    expect(root.querySelector(".conversation-log").textContent).toContain("earliest valid finish time is 2:15 AM");
  });

  it("treats conversation text as text and resets its context when the sample changes", () => {
    const root = renderMountedWorkspace();
    sendConversation(root, "<img src=x onerror=alert(1)>");
    expect(root.querySelector(".conversation-log img")).toBeNull();
    expect(root.querySelector(".conversation-log").textContent).toContain("<img src=x onerror=alert(1)>");

    root.querySelector('[data-scenario-id="open-house"]').click();
    expect(root.querySelector(".conversation-log").textContent).not.toContain("onerror");
    expect(root.querySelector("#conversation-title").textContent).toContain("Ask about this plan");
    expect(root.querySelector(".conversation-log").textContent).toContain("Ask about this sample");
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
