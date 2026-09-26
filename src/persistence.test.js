import { describe, expect, it } from "vitest";
import { clearAllAppliedPlans, clearAppliedPlan, loadAppliedPlan, saveAppliedPlan } from "./persistence.js";

function memoryStorage(initial = null) {
  const values = new Map(initial === null ? [] : [["waypoint.applied-plans.v1", initial]]);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    value: () => values.get("waypoint.applied-plans.v1") ?? null
  };
}

function appliedState(scenarioId, planBrief, planDisruption = false) {
  return {
    scenarioId,
    planBuilt: true,
    planBrief,
    planDisruption,
    conversation: [{ role: "you", text: "Never persist this private conversation" }],
    conversationDraft: "This draft is not part of the saved plan",
    draftBrief: { ...planBrief, unused: "must not be stored" }
  };
}

describe("device-local applied-plan storage", () => {
  it("stores only the normalized applied-plan fields and no conversation or draft text", () => {
    const storage = memoryStorage();
    const state = appliedState("open-house", { deadline: "18:00", budgetCap: null, groupCount: 3 }, true);

    expect(saveAppliedPlan(state, storage)).toBe("saved");
    const serialized = storage.value();
    expect(serialized).not.toContain("private conversation");
    expect(serialized).not.toContain("not part of the saved plan");
    expect(serialized).not.toContain("must not be stored");
    expect(JSON.parse(serialized)).toEqual({
      version: 1,
      plans: {
        "open-house": { deadline: "18:00", budgetCap: null, groupCount: 3, planDisruption: true }
      }
    });
  });

  it("restores an applied plan for its sample without affecting other samples", () => {
    const storage = memoryStorage();
    saveAppliedPlan(appliedState("dinner", { deadline: "19:00", budgetCap: 125, groupCount: 5 }), storage);
    saveAppliedPlan(appliedState("open-house", { deadline: "18:00", budgetCap: null, groupCount: 3 }, true), storage);

    expect(loadAppliedPlan("open-house", storage)).toEqual({
      status: "restored",
      plan: {
        scenarioId: "open-house",
        planBrief: { deadline: "18:00", budgetCap: null, groupCount: 3 },
        planDisruption: true
      }
    });
    expect(loadAppliedPlan("weekend", storage)).toEqual({ status: "empty", plan: null });
  });

  it("rejects malformed JSON, invalid deadlines, invalid scenario fields, and unsupported versions", () => {
    expect(loadAppliedPlan("dinner", memoryStorage("not-json")).status).toBe("invalid");
    expect(loadAppliedPlan("dinner", memoryStorage(JSON.stringify({
      version: 1,
      plans: { dinner: { deadline: "01:00", budgetCap: null, groupCount: 4, planDisruption: false } }
    }))).status).toBe("invalid");
    expect(loadAppliedPlan("dinner", memoryStorage(JSON.stringify({
      version: 2,
      plans: { dinner: { deadline: "19:00", budgetCap: null, groupCount: 4, planDisruption: false } }
    }))).status).toBe("invalid");
  });

  it("fails closed when browser storage reads or writes are unavailable", () => {
    const brokenStorage = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
      removeItem() { throw new Error("blocked"); }
    };
    expect(loadAppliedPlan("dinner", brokenStorage)).toEqual({ status: "unavailable", plan: null });
    expect(saveAppliedPlan(appliedState("dinner", { deadline: "19:00", budgetCap: 90, groupCount: 4 }), brokenStorage)).toBe("unavailable");
    expect(clearAppliedPlan("dinner", brokenStorage)).toBe("unavailable");
    expect(clearAllAppliedPlans(brokenStorage)).toBe("unavailable");
  });

  it("clears one sample at a time and can clear the full local store", () => {
    const storage = memoryStorage();
    saveAppliedPlan(appliedState("dinner", { deadline: "19:00", budgetCap: 125, groupCount: 5 }), storage);
    saveAppliedPlan(appliedState("open-house", { deadline: "18:00", budgetCap: null, groupCount: 3 }, true), storage);

    expect(clearAppliedPlan("open-house", storage)).toBe("cleared");
    expect(loadAppliedPlan("open-house", storage).status).toBe("empty");
    expect(loadAppliedPlan("dinner", storage).status).toBe("restored");
    expect(clearAllAppliedPlans(storage)).toBe("cleared");
    expect(storage.value()).toBeNull();
  });

  it("removes unreadable stored data without attempting to restore it", () => {
    const storage = memoryStorage("{broken");
    expect(loadAppliedPlan("dinner", storage)).toEqual({ status: "invalid", plan: null });
    expect(clearAppliedPlan("dinner", storage)).toBe("cleared-invalid");
    expect(storage.value()).toBeNull();
  });
});
