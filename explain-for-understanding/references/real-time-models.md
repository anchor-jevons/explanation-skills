# Real-time and capacity explanations

Read for scheduling, utilization, deadlines, slack, or engineering capacity questions.
This profile adds domain constraints to the general Truth Model; it does not prescribe
a particular interrupt policy, layer count, or architecture.

## Three distinct questions

1. **Average utilization:** total execution demand divided by the available processor
   time over an interval. Define the interval and processor resources. This aggregate
   ratio alone does not prove that individual jobs meet deadlines.
2. **Window capacity:** compare specified demand D(I) with capacity C(I) for a window I.
   Define how demand is assigned to I. A check for one chosen window says only what it
   covers; it does not automatically cover other windows, carry-in work, release order,
   blocking, or preemption restrictions. State when the inequality is a necessary
   condition and what additional assumptions would make it sufficient.
3. **Schedulability:** requires a stated task and scheduler model: releases, deadlines,
   execution costs, resource availability, priorities, preemption, blocking, overhead,
   and interference. Use an appropriate proof or bounded validation procedure. A trace
   that meets its deadlines establishes that trace's behavior, not a universal guarantee.

Keep admission (which workload is allowed) separate from dispatch (which job runs next).
Present example policies as examples unless the source establishes the actual policy.

## Slack and offsets

Define reusable slack relative to a specific task model, analysis horizon, and proposed
use. Reassigning it must preserve every affected hard-deadline constraint within that
scope, including future releases or carry-in work that the model covers. Being idle
before a deadline does not by itself make an interval safe to spend.

For a periodic event at B[n] - delta, preserve delta when it affects conflicts or timing.
If omitted from a simplified view, identify the omission and the invariant that remains
valid, such as the period between consecutive equally offset events.

## Worked example: capacity check, not a schedule proof

The following values are an illustrative reuse of the original discussion, not measured
facts for a new system. Define u before applying this example to an actual workload.

```text
Analyzed window: S11–S13
Capacity: 55.71 u
Modeled demand: (6N + 6) u
At N = 8: demand = 54 u; capacity margin = 1.71 u
Result: this window's aggregate capacity check passes.
Still unknown: schedulability and whether 1.71 u covers the required overhead budget.
```

A failed necessary capacity condition can rule out a modeled configuration. A passing
check does not establish a stronger condition. Even a positive margin should not be
called sufficient or insufficient without its required budget or acceptance criterion.

## Modeled limit and engineering target

Label the strongest result actually established: capacity upper bound, schedulable
limit under stated assumptions, measured operating range, or proposed admission target.
Explain what any margin covers. Include relevant interrupt, context-switch, memory,
contention, implementation-granularity, and execution-time terms; quantify what is known
and identify what is not. Do not import the original 4/6/8 targets into another system.

## Useful transfer prompt

Offer a pair of small job sets with the same total demand but different release or
deadline placement. Ask whether the same utilization implies the same deadline outcome.
Work out the schedules independently before using them as a teaching example. This tests
the model rather than whether the reader memorized a layer count.
