import { DEFAULT_SCENARIO_ID, getScenario, scenarios } from "./scenarios.js";
import { clearAllAppliedPlans, clearAppliedPlan, loadAppliedPlan, saveAppliedPlan } from "./persistence.js";

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
    disruptionDraft: false,
    planDisruption: false,
    traceOpen: false,
    conversationDraft: "",
    conversation: [{
      role: "waypoint",
      text: "Ask about this sample, suggest one change, or ask why. I only match a small set of local phrases."
    }],
    notice: "Adjust a sample brief, then build its local plan.",
    persistenceStatus: "empty"
  };
}

function restoreState(scenarioId) {
  const state = createInitialState(scenarioId);
  const result = loadAppliedPlan(scenarioId);
  if (result.status !== "restored") return { ...state, persistenceStatus: result.status };

  const { planBrief, planDisruption } = result.plan;
  return {
    ...state,
    planBuilt: true,
    planBrief,
    draftBrief: {
      deadline: planBrief.deadline,
      budgetCap: planBrief.budgetCap == null ? "" : String(planBrief.budgetCap),
      groupCount: planBrief.groupCount == null ? "" : String(planBrief.groupCount)
    },
    disruptionDraft: planDisruption,
    planDisruption,
    conversation: [{
      role: "waypoint",
      text: "I restored the last applied plan from this device. Earlier conversation text was not saved."
    }],
    notice: "Saved local plan restored. Conversation text is not stored.",
    persistenceStatus: "restored"
  };
}

function persistChangedAppliedPlan(previousState, nextState) {
  if (!nextState.planBuilt || !nextState.planBrief) return nextState;
  const changed = !previousState.planBuilt
    || !sameBrief(previousState.planBrief, nextState.planBrief)
    || previousState.planDisruption !== nextState.planDisruption;
  if (!changed) return nextState;
  return { ...nextState, persistenceStatus: saveAppliedPlan(nextState) };
}

function persistenceMessage(status) {
  if (status === "saved" || status === "restored") return "Last applied plan saved on this device. Draft edits and conversation text are not saved.";
  if (status === "unavailable") return "This browser cannot save plans right now. The current tab still works; reload will reset it.";
  if (status === "invalid") return "Saved plan data could not be read. Reset the demo to remove it.";
  if (status === "cleared") return "Saved plan for this sample cleared. The current route stays in this tab.";
  if (status === "cleared-invalid") return "Unreadable saved data cleared from this device. The current route stays in this tab.";
  if (status === "cleared-all") return "Saved plans cleared from this device.";
  return "Only applied plan details are saved on this device. Draft edits and conversation text are not saved.";
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

function formatMinutesAsTime(minutes) {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const value = `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
  return formatTime(value);
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function parseConversationTime(message) {
  const match = /\b(?:to|at|by)\s+(\d{1,2})(?::([0-5]\d))?\s*(am|pm)?\b/i.exec(message);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const period = match[3]?.toLowerCase();
  if (hours > 23 || (period && (hours < 1 || hours > 12))) return { invalid: true };
  if (!period && hours <= 12) return { ambiguous: true };
  if (period === "am" && hours === 12) hours = 0;
  if (period === "pm" && hours !== 12) hours += 12;

  return {
    value: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  };
}

function hasUnappliedChange(state, scenario) {
  return !state.planBuilt
    || !sameBrief(normalizeBrief(state.draftBrief, scenario), state.planBrief)
    || state.disruptionDraft !== state.planDisruption;
}

function conversationReply(state, message) {
  const scenario = getScenario(state.scenarioId);
  const text = message.trim();
  const lower = text.toLowerCase();
  const asksForTimeChange = /\b(?:move|change|set|keep|shift|finish|opening|deadline|doors)\b/.test(lower);
  const deniesDelay = /\b(?:not|isn't|isnt|aren't|arent|wasn't|wasnt|no longer)\b.{0,32}\b(?:late|delayed|delay|slip(?:ping)?)\b|\bno\s+(?:(?:delivery|shipping)\s+)?delay(?:s)?\b|\b(?:don't|do not|doesn't|does not|didn't|did not|can't|cannot|won't|will not)\b.{0,32}\b(?:late|delayed|delay|slip(?:ping)?)\b|\bwithout\b.{0,32}\b(?:late|delayed|delay|slip(?:ping)?)\b/.test(lower);
  const asksForDelay = !deniesDelay && /\b(?:late|delay|slip|slips|arrive after)\b/.test(lower);
  const parsedTime = asksForTimeChange ? parseConversationTime(text) : null;

  if (parsedTime?.ambiguous) {
    return { state, reply: "Please include AM or PM, such as 5:30 PM, so I don't guess the time." };
  }
  if (parsedTime?.invalid) {
    return { state, reply: "That time is outside the 24-hour clock. No plan detail was changed." };
  }
  if (parsedTime?.value) {
    const deadline = parseClock(parsedTime.value);
    const earliest = scenario.scheduleOffsets[0];
    if (deadline === null || deadline < earliest) {
      return {
        state,
        reply: `That leaves too little time for this sample. The earliest valid finish time is ${formatTime(minimumDeadline(scenario))}; no change was made.`
      };
    }
    const nextState = {
      ...state,
      draftBrief: { ...state.draftBrief, deadline: parsedTime.value },
      disruptionDraft: state.disruptionDraft || Boolean(asksForDelay && scenario.disruption)
    };
    if (asksForDelay && scenario.disruption) {
      const impact = getDisruptionImpact(scenario, normalizeBrief(nextState.draftBrief, scenario));
      return {
        state: nextState,
        reply: state.planBuilt
          ? `I staged the ${scenario.disruption.delayMinutes}-minute delay and kept the ${impact.deadlineTime} opening fixed. Delivery is projected at ${impact.arrivalTime}; the current route stays unchanged until you apply it.`
          : `I staged the ${scenario.disruption.delayMinutes}-minute delay and kept the ${impact.deadlineTime} opening fixed. Delivery is projected at ${impact.arrivalTime}; build the local plan to see the proposed route.`
      };
    }
    return {
      state: nextState,
      reply: state.planBuilt
        ? `${deniesDelay ? "No delivery delay was staged. " : ""}The route will finish by ${formatTime(parsedTime.value)} if you apply it. The currently built route stays as it is until then.`
        : `${deniesDelay ? "No delivery delay was staged. " : ""}The first local route will finish by ${formatTime(parsedTime.value)} when you build it. No route has been built yet.`
    };
  }

  if (/\b(?:apply|go ahead|update|rebuild|build|use that)\b/.test(lower)) {
    const brief = normalizeBrief(state.draftBrief, scenario);
    const deadline = parseClock(brief.deadline);
    if (deadline === null || deadline < scenario.scheduleOffsets[0] || (scenario.groupLabel && brief.groupCount === null)) {
      return { state, reply: `I can't build this route with those boundaries. The earliest valid finish time is ${formatTime(minimumDeadline(scenario))}.` };
    }
    if (!hasUnappliedChange(state, scenario)) {
      return { state, reply: "The current route already reflects this plan. No outside action was taken." };
    }
    const wasBuilt = state.planBuilt;
    return {
      state: {
        ...state,
        planBuilt: true,
        planBrief: brief,
        planDisruption: state.disruptionDraft,
        activeStage: "constraints",
        notice: "Plan assembled from the current local conversation. No request left this page."
      },
      reply: `The local route is ${wasBuilt ? "updated" : "built"} for ${formatTime(brief.deadline)}. Review the route below; no outside action was taken.`
    };
  }

  if (/\b(?:clear|remove|cancel)\b/.test(lower) && /\bdelay\b/.test(lower)) {
    if (!scenario.disruption) {
      return { state, reply: "This sample has no delivery-delay example, so nothing changed." };
    }
    const nextState = { ...state, disruptionDraft: false };
    return {
      state: nextState,
      reply: state.planDisruption
        ? "The proposed version removes the delay. The current route remains in place until you apply the update."
        : state.planBuilt
          ? "The staged delay is cleared. The current route has not changed."
          : "The staged delay is cleared. No route has been built or changed."
    };
  }

  if (/\b(?:undo|discard)\b/.test(lower)) {
    const nextState = {
      ...state,
      draftBrief: state.planBuilt ? { ...state.planBrief } : scenarioBrief(scenario),
      disruptionDraft: state.planBuilt ? state.planDisruption : false
    };
    return {
      state: nextState,
      reply: state.planBuilt
        ? "Unapplied changes are cleared. The last built route remains unchanged."
        : "Unapplied changes are cleared. The original sample boundaries are restored."
    };
  }

  if (asksForDelay) {
    if (!scenario.disruption) {
      return { state, reply: "This sample has no delivery-delay event. Choose the studio example to try that change." };
    }
    const nextState = { ...state, disruptionDraft: true };
    const impact = getDisruptionImpact(scenario, normalizeBrief(state.draftBrief, scenario));
    return {
      state: nextState,
      reply: state.planBuilt
        ? `I staged a ${scenario.disruption.delayMinutes}-minute delay. The delivery is projected at ${impact.arrivalTime}, after the ${impact.deadlineTime} opening. The current route remains unchanged until you apply it.`
        : `I staged a ${scenario.disruption.delayMinutes}-minute delay. The delivery is projected at ${impact.arrivalTime}, after the ${impact.deadlineTime} opening. Build the local plan to see the proposed route.`
    };
  }

  if (deniesDelay) {
    return {
      state,
      reply: "No delivery delay was staged. If you meant to remove an earlier local delay, say “Clear the delay”; the built route will still wait for you to apply that update."
    };
  }

  if (/\bwhy\b/.test(lower)) {
    const reason = state.disruptionDraft && scenario.disruption
      ? scenario.disruption.routeRationale
      : scenario.trace[2][1];
    return { state, reply: `${reason} This is a local explanation based on the selected sample.` };
  }

  if (/\bwhat\b/.test(lower) || /\b(?:stay on time|remain fixed|what changed)\b/.test(lower)) {
    const brief = normalizeBrief(state.draftBrief, scenario);
    if (scenario.disruption && state.disruptionDraft) {
      const impact = getDisruptionImpact(scenario, brief);
      return {
        state,
        reply: state.planBuilt
          ? `The ${formatTime(brief.deadline)} opening stays fixed. The delivery is projected at ${impact.arrivalTime}, after opening; the current route stays in place until you apply the revised route.`
          : `The ${formatTime(brief.deadline)} opening stays fixed. The delivery is projected at ${impact.arrivalTime}, after opening. Build the local plan to see the proposed route.`
      };
    }
    if (hasUnappliedChange(state, scenario)) {
      return {
        state,
        reply: state.planBuilt
          ? `The proposed route will finish by ${formatTime(brief.deadline)}. Your current route remains unchanged until you apply it.`
          : `The first route will finish by ${formatTime(brief.deadline)} when built. No route has been applied yet.`
      };
    }
    return {
      state,
      reply: `The current sample keeps its ${formatTime(brief.deadline)} finish time and stated constraints. No outside service is contacted.`
    };
  }

  if (asksForTimeChange) {
    return { state, reply: "Tell me the finish time or opening time with AM or PM, such as 6:00 PM." };
  }

  return {
    state,
    reply: "I can adjust a finish time, stage a delivery delay where available, explain this route, or apply a local plan. Try one of the suggested phrases."
  };
}

function appendConversationTurn(state, message) {
  const result = conversationReply(state, message);
  const conversation = [
    ...state.conversation,
    { role: "you", text: message.trim() },
    { role: "waypoint", text: result.reply }
  ].slice(-13);
  return { ...result.state, conversation, conversationDraft: "" };
}

function conversationPrompts(scenario, state) {
  if (scenario.disruption) {
    if (state.planBuilt && hasUnappliedChange(state, scenario)) {
      return ["What stays on time?", "Apply the revised route", "Undo change"];
    }
    if (state.planBuilt && state.planDisruption) {
      return ["What stays on time?", "Why this route?", "Clear the delay"];
    }
    if (!state.planBuilt && state.disruptionDraft) {
      return ["What stays on time?", "Apply the revised route", "Undo change"];
    }
    if (!state.planBuilt) {
      return [`The delivery is ${scenario.disruption.delayMinutes} minutes late.`, "What stays on time?", "Build the local plan"];
    }
    return [
      `The delivery is ${scenario.disruption.delayMinutes} minutes late.`,
      "What stays on time?",
      "Why this route?"
    ];
  }
  if (state.planBuilt && hasUnappliedChange(state, scenario)) {
    return ["What changes?", "Apply the proposed plan", "Undo change"];
  }
  const deadline = parseClock(scenario.deadline);
  const suggestedTime = formatMinutesAsTime(deadline + 30);
  return [
    `Move the finish time to ${suggestedTime}.`,
    "Why this route?",
    state.planBuilt ? "What stays on time?" : "Build the local plan"
  ];
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
  return !sameBrief(normalizeBrief(state.draftBrief, scenario), state.planBrief)
    || state.disruptionDraft !== state.planDisruption;
}

function getDisruptionImpact(scenario, brief) {
  if (!scenario.disruption) return null;
  const deadline = parseClock(brief.deadline);
  if (deadline === null) return null;
  const plannedArrival = deadline - scenario.scheduleOffsets[scenario.disruption.routeIndex];
  return {
    arrivalTime: formatMinutesAsTime(plannedArrival + scenario.disruption.delayMinutes),
    deadlineTime: formatTime(brief.deadline)
  };
}

function getRoute(scenario, brief, disruptionApplied = false) {
  const deadline = parseClock(brief.deadline);
  if (deadline === null) return scenario.route;
  const impact = disruptionApplied && scenario.disruption ? getDisruptionImpact(scenario, brief) : null;
  const route = disruptionApplied && scenario.disruption
    ? scenario.route.map((item, index) => index === scenario.disruption.routeIndex
      ? {
        ...item,
        title: scenario.disruption.replannedStep.title,
        detail: `The delivery now arrives at ${impact.arrivalTime}, after the ${impact.deadlineTime} opening. Keep it outside the welcome route; decide later whether to bring it in.`
      }
      : item)
    : scenario.route;
  return route.map((item, index) => {
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
    const disruptionChanged = state.disruptionDraft !== state.planDisruption;
    if (disruptionChanged && state.disruptionDraft) {
      return {
        title: "Delivery delay — update the plan",
        detail: "The current route is still shown. Review the delayed-delivery response and apply it to keep the opening time fixed."
      };
    }
    if (disruptionChanged) {
      return {
        title: "Delivery response changed — update the plan",
        detail: "The route still reflects the earlier delivery delay. Apply the update to restore the original sample route."
      };
    }
    return {
      title: "Brief changed — update the plan",
      detail: "The route still shows the previous version. Rebuild it to apply the new time, cap, or group size."
    };
  }
  if (!state.planBuilt && state.disruptionDraft) {
    return {
      title: "Delay simulated — build the plan",
      detail: `The ${scenario.disruption.delayMinutes}-minute delay is part of this local example. Build the route to keep the opening time fixed.`
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

function stageExplanation(scenario, stage, brief, disruptionApplied = false) {
  if (scenario.id === "open-house" && stage.id === "handoff") {
    const handoffTime = getRoute(scenario, brief, disruptionApplied)[2]?.displayTime ?? "the final step";
    if (disruptionApplied) {
      const impact = getDisruptionImpact(scenario, brief);
      return `At ${handoffTime}, confirm the room is ready without the delayed item. It is expected at ${impact.arrivalTime}, after the ${impact.deadlineTime} opening; decide later whether to bring it in.`;
    }
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

function decisionRecord(scenario, brief, disruptionApplied = false) {
  const checkpoint = scenario.id === "open-house"
    ? disruptionApplied
      ? `At ${getRoute(scenario, brief, true)[2]?.displayTime ?? "the final step"}, confirm the opening without the late item; decide later whether to include it.`
      : `At ${getRoute(scenario, brief)[2]?.displayTime ?? "the final step"}, decide whether to include the late item.`
    : scenario.trace[3][1];
  return [
    ["Brief captured", formatGoal(scenario, brief)],
    ["Working assumption", disruptionApplied && scenario.disruption ? `The delivery is ${scenario.disruption.delayMinutes} minutes late and expected at ${getDisruptionImpact(scenario, brief).arrivalTime}, after opening.` : scenario.trace[1][1]],
    ["Route selected", `${disruptionApplied && scenario.disruption ? scenario.disruption.routeRationale : scenario.trace[2][1]} Scheduled backward from ${formatTime(brief.deadline)}.`],
    ["Human checkpoint", checkpoint]
  ];
}

export function previewLocalPlan(options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return { ok: false, error: "Provide planning options as an object." };
  }

  const scenarioId = options.scenarioId ?? DEFAULT_SCENARIO_ID;
  const scenario = scenarios.find((item) => item.id === scenarioId);
  if (!scenario) return { ok: false, error: "Choose one of the listed sample scenarios." };

  const deadline = options.deadline ?? scenario.deadline;
  const deadlineMinutes = parseClock(deadline);
  if (deadlineMinutes === null || deadlineMinutes < scenario.scheduleOffsets[0]) {
    return {
      ok: false,
      error: `Finish time must be a valid 24-hour time no earlier than ${formatTime(minimumDeadline(scenario))}.`
    };
  }

  const budgetCap = options.budgetCap === undefined ? scenario.budgetCap : options.budgetCap;
  if (budgetCap !== null && (typeof budgetCap !== "number" || !Number.isFinite(budgetCap) || budgetCap < 0 || budgetCap > 1_000_000)) {
    return { ok: false, error: "Budget cap must be a non-negative number up to 1,000,000, or null." };
  }

  const requestedGroupCount = options.groupCount === undefined ? scenario.groupCount : options.groupCount;
  if (scenario.groupLabel) {
    if (!Number.isInteger(requestedGroupCount) || requestedGroupCount < 1 || requestedGroupCount > 20) {
      return { ok: false, error: "Group count must be a whole number from 1 to 20." };
    }
  } else if (requestedGroupCount !== null) {
    return { ok: false, error: "This sample does not use a group count; pass null or omit it." };
  }

  const simulateDeliveryDelay = options.simulateDeliveryDelay === true;
  if (simulateDeliveryDelay && !scenario.disruption) {
    return { ok: false, error: "A delivery delay is only available in the open-house sample." };
  }

  const brief = {
    deadline,
    budgetCap,
    groupCount: scenario.groupLabel ? requestedGroupCount : null
  };
  const route = getRoute(scenario, brief, simulateDeliveryDelay);
  const record = decisionRecord(scenario, brief, simulateDeliveryDelay);

  return {
    ok: true,
    status: "preview_only",
    scenario: {
      id: scenario.id,
      title: scenario.title,
      constraints: getConstraintLabels(scenario, brief)
    },
    brief: {
      deadline,
      deadlineLabel: formatTime(deadline),
      budgetCap,
      groupCount: brief.groupCount
    },
    route,
    assumptions: scenario.trace[1][1],
    decisionRecord: Object.fromEntries(record),
    humanCheckpoint: record.find(([label]) => label === "Human checkpoint")?.[1] ?? "Review the proposal before any outside action.",
    limitations: [
      "This preview uses fictional sample data and deterministic local rules.",
      "Budget caps are recorded but not used to check prices or affordability.",
      "No plan is saved and no external service, purchase, reservation, or message is contacted."
    ]
  };
}

export function previewDeliveryDelay(options = {}) {
  const scenarioId = options?.scenarioId ?? "open-house";
  const scenario = scenarios.find((item) => item.id === scenarioId);
  if (!scenario?.disruption) {
    return { ok: false, error: "Choose the open-house sample to preview its delivery delay." };
  }

  const baseline = previewLocalPlan({ ...options, scenarioId, simulateDeliveryDelay: false });
  if (!baseline.ok) return baseline;
  const proposal = previewLocalPlan({ ...options, scenarioId, simulateDeliveryDelay: true });
  if (!proposal.ok) return proposal;

  const impact = getDisruptionImpact(scenario, baseline.brief);
  const changedIndex = scenario.disruption.routeIndex;
  return {
    ok: true,
    status: "requires_human_review",
    scenario: baseline.scenario,
    deadline: baseline.brief.deadlineLabel,
    delayMinutes: scenario.disruption.delayMinutes,
    projectedArrival: impact.arrivalTime,
    currentRoute: baseline.route,
    proposedRoute: proposal.route,
    changedStep: {
      index: changedIndex,
      currentTitle: baseline.route[changedIndex]?.title,
      proposedTitle: proposal.route[changedIndex]?.title
    },
    humanCheckpoint: proposal.humanCheckpoint,
    note: "This tool proposes a route only. A person must review and apply any change in Waypoint. No outside action is taken."
  };
}

function renderDisruptionControl(scenario, state) {
  if (!scenario.disruption) return "";
  const brief = normalizeBrief(state.draftBrief, scenario);
  const impact = getDisruptionImpact(scenario, brief);
  return `
    <section class="disruption-panel" aria-labelledby="disruption-title">
      <div><p class="section-label">TEST A CHANGE</p><h3 id="disruption-title">What if the delivery slips?</h3><p>A local event adds ${scenario.disruption.delayMinutes} minutes. The opening time and the two helpers stay fixed.</p></div>
      <div class="disruption-action"><button type="button" class="secondary-action" data-action="delivery-delay">${state.disruptionDraft ? "Clear simulated delay" : `Simulate a ${scenario.disruption.delayMinutes}-minute delay`}</button><small>Simulation only · no vendor or order is contacted.</small></div>
      ${state.disruptionDraft ? `<p class="disruption-preview" role="status"><b>Proposed response:</b> the delivery is now expected at ${escapeHtml(impact.arrivalTime)}, after the ${escapeHtml(impact.deadlineTime)} opening. Keep it outside the welcome route; the current route stays unchanged until you ${state.planBuilt ? "update" : "build"} it.</p>` : ""}
    </section>
  `;
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

function renderConversation(state, scenario) {
  const prompts = conversationPrompts(scenario, state);
  return `
    <section class="conversation-panel" aria-labelledby="conversation-title">
      <div class="conversation-heading">
        <div><p class="section-label">LOCAL CONVERSATION</p><h3 id="conversation-title">Ask about this plan</h3></div>
        <p class="conversation-chip">Fixed phrase examples · no model</p>
      </div>
      <ol class="conversation-log" aria-label="Waypoint conversation transcript">
        ${state.conversation.map((turn) => `
          <li class="conversation-turn conversation-turn--${turn.role === "you" ? "you" : "waypoint"}">
            <span class="conversation-role">${turn.role === "you" ? "You" : "Waypoint"}</span>
            <p>${escapeHtml(turn.text)}</p>
          </li>
        `).join("")}
      </ol>
      <div class="conversation-suggestions" aria-label="Suggested local phrases">
        <span class="suggestions-label">Try</span>
        ${prompts.map((prompt) => `<button type="button" class="conversation-prompt" data-action="conversation-prompt" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`).join("")}
      </div>
      <form id="conversation-form" class="conversation-form" aria-label="Ask Waypoint about the plan">
        <label for="conversation-input">Your turn</label>
        <div class="conversation-composer">
          <input id="conversation-input" name="message" type="text" maxlength="240" autocomplete="off" required value="${escapeHtml(state.conversationDraft)}" placeholder="e.g. The delivery is 30 minutes late." aria-describedby="conversation-help">
          <button type="submit" class="secondary-action conversation-send">Send</button>
        </div>
        <small id="conversation-help">This local phrase matcher keeps the selected sample in context. It makes no network request.</small>
      </form>
    </section>
  `;
}

export function renderWorkspace(state) {
  const scenario = getScenario(state.scenarioId);
  const brief = getPlanBrief(state, scenario);
  const active = scenario.stages.find((stage) => stage.id === state.activeStage) ?? scenario.stages[0];
  const route = getRoute(scenario, brief, state.planBuilt && state.planDisruption);
  const status = statusCopy(state, scenario);
  const trace = decisionRecord(scenario, brief, state.planBuilt && state.planDisruption);

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
        ${renderDisruptionControl(scenario, state)}
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
          <p class="explanation">${escapeHtml(stageExplanation(scenario, active, brief, state.planBuilt && state.planDisruption))}</p>

          ${renderConversation(state, scenario)}

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
        <p><strong>Prototype boundary.</strong> This is a local rule-based simulation with fictional examples. It does not connect to external services, accounts, or customer data. Budget caps are not checked against live prices. It cannot make bookings, purchases, or send messages.</p>
      </section>

      <footer class="footer">
        <div class="footer-copy">
          <p>A local, reviewable prototype. It acts only inside this page and uses fictional sample data.</p>
          <p class="saved-plan-status" role="status" aria-live="polite">${escapeHtml(persistenceMessage(state.persistenceStatus))}</p>
        </div>
        <div class="footer-actions">
          <button type="button" class="reset-action" data-action="clear-saved-plan" ${["saved", "restored", "invalid"].includes(state.persistenceStatus) ? "" : "disabled"}>Clear saved plan for this sample</button>
          <button type="button" class="reset-action" data-action="reset">Reset demo &amp; clear saved plans</button>
        </div>
      </footer>
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
  let state = restoreState(DEFAULT_SCENARIO_ID);

  function render() {
    root.innerHTML = renderWorkspace(state);
  }

  function announceConversationReply() {
    const announcer = root.parentElement?.querySelector("#live-announcer");
    const latestTurn = state.conversation.at(-1);
    if (announcer && latestTurn?.role === "waypoint") announcer.textContent = latestTurn.text;
  }

  function restoreFocus(action, target) {
    if (action === "scenario") root.querySelector(`[data-action="scenario"][data-scenario-id="${state.scenarioId}"]`)?.focus({ preventScroll: true });
    else if (action === "stage") root.querySelector(`[data-action="stage"][data-stage-id="${target}"]`)?.focus({ preventScroll: true });
    else if (action === "trace") root.querySelector(state.traceOpen ? ".close-trace" : ".text-action")?.focus({ preventScroll: true });
    else if (action === "reset") root.querySelector(`[data-action="scenario"][data-scenario-id="${state.scenarioId}"]`)?.focus({ preventScroll: true });
    else if (action === "clear-saved-plan") root.querySelector('[data-action="clear-saved-plan"]')?.focus({ preventScroll: true });
    else if (action === "conversation-prompt") root.querySelector("#conversation-input")?.focus({ preventScroll: true });
  }

  root.addEventListener("input", (event) => {
    if (event.target.id === "conversation-input") {
      state = { ...state, conversationDraft: event.target.value };
      return;
    }
    const field = event.target.dataset.briefField;
    if (!field) return;
    state = { ...state, draftBrief: { ...state.draftBrief, [field]: event.target.value } };
    updateBriefSummary(root, state);
    updateStatus(root, state);
  });

  root.addEventListener("submit", (event) => {
    if (event.target.id === "conversation-form") {
      event.preventDefault();
      if (!event.target.reportValidity()) return;
      const message = state.conversationDraft.trim();
      if (!message) return;
      const previousState = state;
      state = persistChangedAppliedPlan(previousState, appendConversationTurn(state, message));
      render();
      announceConversationReply();
      root.querySelector("#conversation-input")?.focus({ preventScroll: true });
      return;
    }
    if (event.target.id !== "brief-form") return;
    event.preventDefault();
    if (!event.target.reportValidity()) return;
    const scenario = getScenario(state.scenarioId);
    const planBrief = normalizeBrief(state.draftBrief, scenario);
    const deadline = parseClock(planBrief.deadline);
    if (deadline === null || deadline < scenario.scheduleOffsets[0] || (scenario.groupLabel && planBrief.groupCount === null)) return;
    const appliedState = {
      ...state,
      planBuilt: true,
      planBrief,
      planDisruption: state.disruptionDraft,
      activeStage: "constraints",
      notice: "Plan assembled from the current local brief. No request left this page."
    };
    state = { ...appliedState, persistenceStatus: saveAppliedPlan(appliedState) };
    render();
    root.querySelector("#plan-status-title")?.focus({ preventScroll: true });
  });

  root.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const action = control.dataset.action;
    const target = control.dataset.stageId;
    if (action === "scenario") {
      state = restoreState(control.dataset.scenarioId);
    } else if (action === "stage") {
      state = { ...state, activeStage: target };
    } else if (action === "trace") {
      state = { ...state, traceOpen: !state.traceOpen };
    } else if (action === "delivery-delay") {
      state = { ...state, disruptionDraft: !state.disruptionDraft };
    } else if (action === "conversation-prompt") {
      const previousState = state;
      state = persistChangedAppliedPlan(previousState, appendConversationTurn(state, control.dataset.prompt ?? ""));
    } else if (action === "clear-saved-plan") {
      if (control.disabled) return;
      const result = clearAppliedPlan(state.scenarioId);
      state = { ...state, persistenceStatus: result === "cleared-invalid" ? "cleared-invalid" : result === "cleared" ? "cleared" : "unavailable" };
    } else if (action === "reset") {
      const result = clearAllAppliedPlans();
      state = { ...createInitialState(), persistenceStatus: result === "cleared" ? "cleared-all" : "unavailable" };
    } else {
      return;
    }

    render();
    if (action === "conversation-prompt") announceConversationReply();
    restoreFocus(action, target);
    if (action === "delivery-delay") root.querySelector('[data-action="delivery-delay"]')?.focus({ preventScroll: true });
  });

  render();
}

if (typeof document !== "undefined") {
  const root = document.querySelector("#app");
  if (root) mount(root);
}
