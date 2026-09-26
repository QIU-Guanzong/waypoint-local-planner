import { getScenario, scenarios } from "./scenarios.js";

const STORAGE_KEY = "waypoint.applied-plans.v1";
const SCENARIO_IDS = new Set(scenarios.map((scenario) => scenario.id));

function getStorage(storage) {
  if (storage !== undefined) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function parseClock(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function validatePlan(scenarioId, value) {
  if (!SCENARIO_IDS.has(scenarioId) || !value || typeof value !== "object" || Array.isArray(value)) return null;
  const scenario = getScenario(scenarioId);
  const deadline = parseClock(value.deadline);
  const budgetCap = value.budgetCap;
  const groupCount = value.groupCount;

  if (deadline === null || deadline < scenario.scheduleOffsets[0]) return null;
  if (budgetCap !== null && (typeof budgetCap !== "number" || !Number.isFinite(budgetCap) || budgetCap < 0 || budgetCap > 1_000_000)) return null;
  if (scenario.groupLabel) {
    if (!Number.isInteger(groupCount) || groupCount < 1 || groupCount > 20) return null;
  } else if (groupCount !== null) {
    return null;
  }
  if (typeof value.planDisruption !== "boolean" || (value.planDisruption && !scenario.disruption)) return null;

  return {
    deadline: value.deadline,
    budgetCap,
    groupCount,
    planDisruption: value.planDisruption
  };
}

function readStore(storage) {
  if (!storage) return { status: "unavailable", plans: {} };
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: "unavailable", plans: {} };
  }
  if (raw === null) return { status: "empty", plans: {} };

  try {
    const document = JSON.parse(raw);
    if (!document || document.version !== 1 || !document.plans || typeof document.plans !== "object" || Array.isArray(document.plans)) {
      return { status: "invalid", plans: {} };
    }
    const plans = {};
    for (const [scenarioId, value] of Object.entries(document.plans)) {
      const plan = validatePlan(scenarioId, value);
      if (!plan) return { status: "invalid", plans: {} };
      plans[scenarioId] = plan;
    }
    return { status: "ok", plans };
  } catch {
    return { status: "invalid", plans: {} };
  }
}

export function loadAppliedPlan(scenarioId, storage) {
  const result = readStore(getStorage(storage));
  if (result.status === "unavailable" || result.status === "invalid") return { status: result.status, plan: null };
  const plan = result.plans[scenarioId];
  if (!plan) return { status: "empty", plan: null };
  const { deadline, budgetCap, groupCount, planDisruption } = plan;
  return {
    status: "restored",
    plan: { scenarioId, planBrief: { deadline, budgetCap, groupCount }, planDisruption }
  };
}

export function saveAppliedPlan(state, storage) {
  const target = getStorage(storage);
  if (!target || !state?.planBuilt || !state.planBrief) return "unavailable";
  const plan = validatePlan(state.scenarioId, {
    ...state.planBrief,
    planDisruption: state.planDisruption
  });
  if (!plan) return "unavailable";

  const current = readStore(target);
  const plans = current.status === "ok" ? current.plans : {};
  plans[state.scenarioId] = plan;
  try {
    target.setItem(STORAGE_KEY, JSON.stringify({ version: 1, plans }));
    return "saved";
  } catch {
    return "unavailable";
  }
}

export function clearAppliedPlan(scenarioId, storage) {
  const target = getStorage(storage);
  if (!target) return "unavailable";
  const current = readStore(target);
  try {
    if (current.status === "invalid") {
      target.removeItem(STORAGE_KEY);
      return "cleared-invalid";
    }
    if (current.status === "unavailable") return "unavailable";
    const plans = { ...current.plans };
    delete plans[scenarioId];
    if (Object.keys(plans).length === 0) target.removeItem(STORAGE_KEY);
    else target.setItem(STORAGE_KEY, JSON.stringify({ version: 1, plans }));
    return "cleared";
  } catch {
    return "unavailable";
  }
}

export function clearAllAppliedPlans(storage) {
  const target = getStorage(storage);
  if (!target) return "unavailable";
  try {
    target.removeItem(STORAGE_KEY);
    return "cleared";
  } catch {
    return "unavailable";
  }
}
