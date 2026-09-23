/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { createInitialState, mount, renderWorkspace } from "./main.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Waypoint local simulation", () => {
  it("renders the static boundary and selected scenario", () => {
    const view = renderWorkspace(createInitialState());
    expect(view).toContain("Saturday dinner, without the scramble.");
    expect(view).toContain("Prototype boundary.");
    expect(view).toContain("does not connect to Alexa+");
  });

  it("changes the example brief and leaves the plan unbuilt", () => {
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);

    root.querySelector('[data-scenario-id="open-house"]').click();
    expect(root.textContent).toContain("Open the studio on time.");
    expect(root.textContent).toContain("Sample brief changed. Build its local route when you are ready.");
    expect(root.querySelector(".status-signal").classList.contains("is-built")).toBe(false);
  });

  it("builds locally, exposes decision record, and resets predictably", () => {
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);

    root.querySelector('[data-action="build"]').click();
    expect(root.textContent).toContain("Plan assembled locally");
    expect(root.querySelector(".status-signal").classList.contains("is-built")).toBe(true);

    root.querySelector('[data-action="trace"]').click();
    const trace = root.querySelector("#decision-record");
    expect(trace.hidden).toBe(false);
    expect(trace.textContent).toContain("Human checkpoint");

    root.querySelector('[data-action="reset"]').click();
    expect(root.textContent).toContain("Sample brief selected");
    expect(root.querySelector("#decision-record").hidden).toBe(true);
  });

  it("updates the active explanatory stage with button semantics", () => {
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);

    root.querySelector('[data-stage-id="handoff"]').click();
    const activeHandoff = root.querySelector('[data-stage-id="handoff"]');
    expect(activeHandoff.getAttribute("aria-pressed")).toBe("true");
    expect(root.querySelector("#plan-title").textContent).toContain("Hand back a clear next action");
  });
});
