export const DEFAULT_SCENARIO_ID = "dinner";

export const scenarios = [
  {
    id: "dinner",
    badge: "HOME / SATURDAY",
    title: "Saturday dinner, without the scramble.",
    goal: "Set a relaxed dinner for four, keep the grocery trip to one stop, and stay within a $90 budget.",
    constraints: ["4 people", "6:30 PM", "$90 cap", "1 store"],
    outcome: "One shop. One pan. Enough time to sit down.",
    route: [
      { time: "4:15", title: "Collect the basket", detail: "Use one familiar store to protect the travel constraint." },
      { time: "5:15", title: "Start the oven and prep", detail: "Prepare the longer-cooking item first; keep the table task separate." },
      { time: "6:15", title: "Finish and plate", detail: "Reserve fifteen minutes for a late item or a conversation." }
    ],
    stages: [
      {
        id: "constraints",
        label: "Fix the non-negotiables",
        short: "Time, budget, and one-store limit",
        explanation: "The fixed points are dinner time, the spending cap, four diners, and a single-store trip. The plan does not quietly trade any of those away."
      },
      {
        id: "route",
        label: "Choose the low-friction route",
        short: "Pickup, prep, cook, serve",
        explanation: "The route prioritizes fewer hand-offs over the largest possible menu. A compact basket and parallel table setup leave a margin before serving."
      },
      {
        id: "tradeoffs",
        label: "Keep the trade-offs visible",
        short: "Why this route is preferred",
        explanation: "A multi-store route may broaden choices, but it risks both the travel time and budget. This route preserves the stated constraints first."
      },
      {
        id: "handoff",
        label: "Hand back a clear next action",
        short: "Review before any real-world action",
        explanation: "The next move is a review, not an automatic checkout: confirm the basket, then decide whether to act outside this prototype."
      }
    ],
    trace: [
      ["Brief captured", "Dinner for four; 6:30 PM; $90; one store."],
      ["Working assumption", "A familiar store is reachable before 4:15 PM."],
      ["Route selected", "One-stop basket and a 60-minute cooking window."],
      ["Human checkpoint", "Review the basket before any purchase or reservation."]
    ]
  },
  {
    id: "open-house",
    badge: "STUDIO / THURSDAY",
    title: "Open the studio on time.",
    goal: "Prepare a compact open-house checklist, leave room for a late delivery, and make the space welcoming by 5:30 PM.",
    constraints: ["5:30 PM open", "2 helpers", "1 late delivery", "90 min setup"],
    outcome: "The welcome path is ready before the details arrive.",
    route: [
      { time: "3:45", title: "Set the arrival path", detail: "Place signs, clear the entrance, and keep the first-view wall uncluttered." },
      { time: "4:30", title: "Divide the setup", detail: "One person prepares the room; one checks lighting, labels, and the welcome table." },
      { time: "5:10", title: "Absorb the late delivery", detail: "Add the delivery only if it does not interrupt the opening path." }
    ],
    stages: [
      {
        id: "constraints",
        label: "Fix the non-negotiables",
        short: "Opening time, helpers, and delivery risk",
        explanation: "The opening time and a clear arrival path matter more than placing every item. The late delivery is treated as optional until it is physically present."
      },
      {
        id: "route",
        label: "Choose the low-friction route",
        short: "Entrance, room, then late item",
        explanation: "The setup moves from what guests see first to what can wait. This makes the space usable even if the delivery is delayed."
      },
      {
        id: "tradeoffs",
        label: "Keep the trade-offs visible",
        short: "Readiness beats completeness",
        explanation: "Adding every detail may improve the display, but it puts the opening time at risk. The plan keeps a complete-looking entrance as the first checkpoint."
      },
      {
        id: "handoff",
        label: "Hand back a clear next action",
        short: "Review before a real-world action",
        explanation: "At 5:10 PM, decide whether the delivery belongs in the room. This prototype does not contact vendors or change the schedule."
      }
    ],
    trace: [
      ["Brief captured", "Open at 5:30 PM with two helpers and one uncertain delivery."],
      ["Working assumption", "The entrance and primary room are accessible from 3:45 PM."],
      ["Route selected", "Guest path first; delivery becomes an optional final task."],
      ["Human checkpoint", "At 5:10 PM, decide whether to include the late item."]
    ]
  },
  {
    id: "weekend",
    badge: "HOME / WEEKEND",
    title: "Reset the weekend without overbooking it.",
    goal: "Fit errands, a shared meal, and two quiet hours into Saturday while leaving a buffer for plans that change.",
    constraints: ["1 shared car", "2 quiet hours", "3 errands", "change buffer"],
    outcome: "The essentials are placed; the rest stays optional.",
    route: [
      { time: "10:00", title: "Run the linked errands", detail: "Group the three stops by route so the shared car is used once." },
      { time: "1:00", title: "Eat and reset", detail: "Make the shared meal a fixed pause rather than another task." },
      { time: "3:00", title: "Protect the quiet window", detail: "Keep two hours open; move only optional work into the evening." }
    ],
    stages: [
      {
        id: "constraints",
        label: "Fix the non-negotiables",
        short: "Shared car, rest, and change buffer",
        explanation: "The shared car and the quiet window are treated as fixed. The plan groups errands so they do not consume the whole day."
      },
      {
        id: "route",
        label: "Choose the low-friction route",
        short: "Errands, meal, then open time",
        explanation: "The sequence uses the shared resource once, creates a real pause, and leaves the least predictable part of the day uncommitted."
      },
      {
        id: "tradeoffs",
        label: "Keep the trade-offs visible",
        short: "A buffer is an intentional choice",
        explanation: "Filling the late afternoon could complete more tasks, but it would erase the buffer the brief requested. Optional items stay optional."
      },
      {
        id: "handoff",
        label: "Hand back a clear next action",
        short: "Review before a real-world action",
        explanation: "Review the errand order with the other driver before leaving. This prototype does not access maps, calendars, or reminders."
      }
    ],
    trace: [
      ["Brief captured", "Shared car, three errands, a meal, two quiet hours, and a change buffer."],
      ["Working assumption", "The errands can be grouped into one car trip."],
      ["Route selected", "Run errands early, preserve the meal and quiet time."],
      ["Human checkpoint", "Confirm the errand order with the other driver."]
    ]
  }
];

export function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0];
}
