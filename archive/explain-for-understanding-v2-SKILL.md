---
name: explain-for-understanding
version: 2.0
description: >
  Turn complex technical, scientific, strategic, or research material into an explanation
  that builds a correct mental model before presenting detail. Optimize for transfer of
  understanding, not compression, decoration, or exhaustive summary. Use especially when
  the user asks to explain, teach, compare reasoning, build intuition, or create an
  explanatory HTML page.
---

# Explain for Understanding

## Mission

Do not merely summarize information.

Build a **correct, testable mental model** in the reader's head.

A successful explanation lets the reader answer three questions without rereading:

1. **What is really going on?**
2. **Why does the obvious/simple interpretation fail?**
3. **What rule should I use next time?**

Prefer causal structure, constraints, contrasts, and counterexamples over exhaustive detail.

---

# 1. Core principle: Truth Model before Teaching Model

Always work in two passes.

## Pass A — Truth Model

Before deciding how to explain the topic, determine:

- What is **observed / sourced fact**?
- What is **derived / calculated**?
- What is an **assumption**?
- What is a **bound**?
- What is a **proposal / heuristic / engineering target**?
- What is actually **proven / guaranteed**?
- What remains **unknown / unvalidated**?

Never upgrade the strength of a conclusion while explaining it.

### Epistemic labels

Use these meanings consistently:

| Label | Meaning |
|---|---|
| **Observed** | Directly measured, sourced, or given |
| **Derived** | Follows from stated inputs by calculation |
| **Assumption** | Needed to make the model tractable |
| **Capacity bound** | Aggregate demand fits available capacity |
| **Schedulability bound** | Necessary or sufficient timing condition under stated scheduling assumptions |
| **Engineering target** | Deliberately conservative design choice |
| **Validated** | Tested against the relevant model or data |
| **Guaranteed** | All material constraints required for the guarantee have been checked |

### Hard rule

Do **not** use words such as:

- guaranteed
- safe
- proven
- supports
- pass

unless the exact scope is explicit.

Prefer:

- `capacity-bound PASS`
- `schedulable under these assumptions`
- `proposed admission target`
- `validated for the modeled constraints`
- `not yet including X/Y/Z`

Example:

Bad:
> 416 MHz guarantees 8 layers.

Better:
> 416 MHz is capacity-feasible for 8 layers in the modeled S11–S13 window, but the engineering target is 6 layers until IRQ3, preemption cost, stalls, and WCET variation are validated.

---

# 2. Choose the explanatory spine

Do not organize by source order.

Organize by the shortest path to understanding.

Default spine:

1. **One-sentence thesis**
2. **The tempting but wrong/simple model**
3. **The correct mental model**
4. **Primitive quantities / vocabulary**
5. **Mechanism or causal chain**
6. **Where the bottleneck / boundary / conflict appears**
7. **One derivation or worked example**
8. **One counterexample that breaks the naive model**
9. **Decision rule / design rule**
10. **What still needs validation**

Not every explanation needs all ten sections, but the order should generally move from **intuition → mechanism → evidence → decision**.

---

# 3. Start with the contrast, not the definition

The opening should answer:

> What misconception should the reader stop using?

Good opening pattern:

> This is not mainly a **total-capacity** problem. It is a **deadline-window** problem.

Then immediately give one concrete anchor:

> Average utilization is 63%, but the worst timing window has only 1.71 units of margin.

This creates a reason to learn the rest.

Avoid openings such as:

> X is defined as...
> There are five components...
> In this article we will discuss...

unless the definition itself is the source of confusion.

---

# 4. Build a mental model before detail

Use one compact visual or verbal model early.

Preferred explanatory objects:

- timeline
- pipeline
- causal chain
- state transition
- hierarchy
- feedback loop
- resource budget
- comparison table
- bottleneck diagram

The model should be small enough to remember.

Example:

```text
measurement
    ↓
IRQ release
    ↓
compute window
    ↓
next IRQ = deadline
```

Once this exists, attach details to it.

Do not introduce many numbers before the reader knows **where those numbers live in the model**.

---

# 5. Distinguish three different questions

For engineering / performance / scheduling topics, explicitly separate:

## A. Average utilization

\[
U = \frac{\text{total work}}{\text{total interval}}
\]

Answers:

> Is there enough total compute on average?

It does **not** answer:

> Can every deadline be met?

## B. Capacity bound

\[
D(I) \le C(I)
\]

for a selected interval \(I\).

Answers:

> Does aggregate demand fit inside this interval?

It may still ignore detailed release/deadline ordering or preemption restrictions.

## C. Schedulability

Requires task timing semantics:

- release time
- absolute deadline
- priority
- preemptability
- execution cost
- interference
- overhead

Answers:

> Can the actual scheduler meet every deadline under the stated model?

### Mandatory warning

If only A or B has been checked, do not present C as proven.

---

# 6. Treat slack as deadline-qualified slack

Never describe all idle time as equally usable.

Define:

> **Deadline-qualified slack** = compute time that can be reassigned without causing any earlier hard deadline to miss.

Bad:

> There are 10 units idle, so GE can use them.

Better:

> There are 10 units of nominal idle; only the portion before the relevant hard deadlines is deadline-qualified slack available to GE.

This rule is mandatory for real-time, pipeline, networking, DSP, CPU, accelerator, and scheduling explanations.

---

# 7. Preserve offsets that matter

Do not snap events to neat boundaries merely to simplify the picture if the offset affects reasoning.

If a task occurs at:

\[
B_n - \delta
\]

draw or state the offset.

If the exact value is not material, explicitly say:

> The absolute offset is small and is omitted in this capacity view; the GM-to-GM period is preserved.

This is better than silently drawing the event at the boundary.

---

# 8. Use one decisive worked example

Choose the example that exposes the core concept, not the easiest arithmetic.

For a deadline-bound system, prefer a hotspot window over a full-slot average.

A strong worked example contains:

1. interval
2. capacity
3. demand components
4. result
5. interpretation

Example shape:

```text
Window: S11–S13
Capacity: 55.71u
Demand: 6N + 6
At N = 8:
Demand = 54u
Margin = 1.71u
Interpretation: mathematically feasible, engineering margin is too small.
```

Do not bury the interpretation after the arithmetic.

---

# 9. Always include one counterexample

A counterexample is often the highest-value part of an explanation.

Use it to destroy the naive rule.

Example:

```text
Average slot utilization = 63.1%
Worst-window margin = 1.71u
```

Then state the lesson:

> A lightly utilized processor can still be deadline-bound.

For research, policy, forecasting, or causal arguments, the counterexample may instead challenge:

- a hidden premise
- a causal jump
- a base-rate assumption
- a scope error
- an extrapolation

---

# 10. Separate theoretical limit from engineering target

When deriving maximum capacity, present at least two levels when relevant:

### Theoretical / modeled limit

What the current mathematical model permits.

### Engineering target

What should actually be configured after preserving margin.

Example:

| Frequency | Modeled limit | Proposed target |
|---|---:|---:|
| 312 MHz | 5L | 4L |
| 416 MHz | 8L | 6L |
| 499.2 MHz | 10L | 8L |

Then explain **what the margin is buying**.

Possible margin consumers:

- interrupt overhead
- context save/restore
- scheduler overhead
- memory/cache stalls
- DMA contention
- clock variation
- measured WCET variation
- unmodeled IRQs
- implementation granularity

Never call the engineering target a guarantee until those terms are bounded or validated.

---

# 11. Interaction is for testing the model

Use interaction only when changing a parameter teaches the key relationship.

Good interaction:

- layer count slider
- clock selector
- with/without TPC toggle
- scenario switch
- evidence-strength switch
- sensitivity slider

Bad interaction:

- decorative tabs
- animation that conveys no new state
- counters that simply restate text
- a calculator whose result is just `PASS/FAIL`

### Interactive result labels

Prefer precise output labels:

- `Capacity-bound PASS`
- `Capacity-bound FAIL`
- `Schedulability not yet established`
- `Margin = 13.7u`
- `Assumptions active: preemptive / TPC highest priority / GE deadline=B1`

The UI must tell the reader **what was actually tested**.

---

# 12. HTML explanation pattern

When the user asks for HTML, create a self-contained offline page unless another renderer is explicitly requested.

Default structure:

```text
Hero
  → One-sentence thesis
  → One counterintuitive anchor

01 Mental model
02 Primitive quantities
03 Mechanism / timeline
04 Bottleneck or worst window
05 Derivation
06 Theoretical limit vs engineering choice
07 Counterexample
08 Scheduler / decision rule
09 What remains to validate
```

Use 6–10 meaningful sections, not dozens of cards.

### Visual hierarchy

Use:

- one strong headline
- one dominant explanatory visual per section
- restrained tables
- compact callouts
- consistent semantic colors

Do not make every fact a card.

---

# 13. Mobile-first diagram rule

Large diagrams must remain readable on a phone.

Do not scale a 1200 px SVG down until text becomes unreadable.

For wide timelines / pipelines:

- use a local horizontal-scroll container
- give the diagram a meaningful `min-width`
- keep text at readable CSS pixel size
- keep the page itself free from horizontal overflow

Preferred:

```css
.diagram-scroll {
  overflow-x: auto;
}
.diagram-scroll svg {
  min-width: 900px;
}
```

Not:

```css
svg {
  width: 100%;
}
```

when that causes labels to shrink below readable size.

Also provide a compact textual takeaway below the diagram.

---

# 14. Evidence and source boundaries

For source-based explanations, state the evidence boundary early.

Examples:

> This explains the publicly available introduction and Chapter 1, not the full book.

> This conclusion comes from three measured traces; it is not a general property of all workloads.

Separate:

1. what the source says
2. what the data shows
3. what the explanation derives
4. what the model infers

Use citations next to the claim they support.

---

# 15. Technical writing style

Use controlled technical prose.

Preferred style:

- short sentences
- one causal claim per sentence
- explicit subject
- explicit units
- explicit scope
- minimal pronouns when referents are ambiguous

Prefer:

> GE releases 91 µs before the slot boundary.

Over:

> It comes in a little earlier.

Prefer:

> The capacity model ignores IRQ3.

Over:

> Some other overhead is not considered.

For engineering audiences, it is acceptable to mix standard English technical terms with Chinese when that improves precision:

- deadline
- release
- slack
- preemption
- utilization
- workload
- admission policy
- worst-case window

---

# 16. Do not over-explain what the reader already accepts

Spend explanation budget on conceptual discontinuities.

Good targets:

- why an intuitive metric fails
- why two similar quantities differ
- why a bound is not a proof
- why a timing offset changes feasibility
- why an architecture choice follows from the workload

Compress routine arithmetic unless it changes the decision.

---

# 17. Use progressive disclosure

The reader should be able to stop at three depths:

## Level 1 — 30-second understanding

- thesis
- mental model
- decision rule

## Level 2 — 3-minute understanding

- key numbers
- worked example
- counterexample
- engineering implication

## Level 3 — audit

- assumptions
- equations
- tables
- sources
- validation checklist

HTML should visually support these levels.

---

# 18. Scheduler explanations: recommended pattern

For real-time scheduler topics, show:

### Event semantics

```text
release → ready → run/preempt → complete → deadline
```

### Priority policy

Example:

```text
TPC: fixed highest priority
AGC: EDF
```

### Re-scheduling events

- new hard-priority IRQ
- new AGC job
- current job completion
- optional timer / epoch update

### Admission control

Keep admission policy separate from dispatch policy.

Example:

```text
Admission:
312 MHz → ≤4 layers
416 MHz → ≤6 layers
499.2 MHz → ≤8 layers

Dispatch:
TPC fixed priority
AGC EDF
```

This separation is important.

---

# 19. Self-review before final output

Before delivering, run this checklist.

## Truth check

- [ ] Are facts, assumptions, derived values, and proposals distinguishable?
- [ ] Did I accidentally turn a bound into a guarantee?
- [ ] Did I state omitted overheads?
- [ ] Are units consistent?
- [ ] Are release and deadline semantics preserved?
- [ ] Is any timing offset visually or verbally misplaced?

## Understanding check

- [ ] Can the thesis be repeated in one sentence?
- [ ] Is there one memorable mental model?
- [ ] Is there one decisive worked example?
- [ ] Is there one counterexample to the naive interpretation?
- [ ] Is the final design rule explicit?

## Visual check

- [ ] Does each diagram teach something text alone would not?
- [ ] Are mobile labels readable?
- [ ] Are wide diagrams locally scrollable?
- [ ] Are colors semantic and consistent?
- [ ] Is there unnecessary dashboard/card clutter?

## Interaction check

- [ ] Does each control teach a relationship?
- [ ] Does the result say exactly what was tested?
- [ ] Does `PASS` specify capacity vs schedulability?
- [ ] Are assumptions visible near the result?

---

# 20. Default output recipe

When the user invokes `$explain-for-understanding` without extra instructions:

1. Identify the misconception or central question.
2. Build the Truth Model.
3. Write the one-sentence thesis.
4. Choose one mental model visual.
5. Derive one decisive example.
6. Add one counterexample.
7. State the decision rule.
8. Label theoretical limits separately from engineering choices.
9. State remaining uncertainty / validation needs.
10. If HTML is requested or clearly useful, render a single-file responsive explainer with:
   - dark/light mode
   - print support
   - mobile-readable wide diagrams
   - optional interaction only when it tests the core model.

---

# 21. Anti-patterns

Do not:

- summarize every paragraph in source order
- equate average utilization with schedulability
- call nominal idle time usable slack without deadline analysis
- label aggregate-capacity checks as generic `PASS`
- call conservative targets `guaranteed` without validation
- hide assumptions in footnotes
- force every topic into the same visual template
- use interactive widgets only for decoration
- shrink complex SVGs until mobile text is unreadable
- use a large table before the reader understands what the columns mean
- add detail before establishing the mental model
- end without a practical decision rule

---

# 22. Success criterion

The explanation succeeds when the reader can independently reconstruct the reasoning.

For the 5G scheduling example, a reader should be able to say:

> Slot-average utilization is not the sizing metric. The critical quantity is deadline-constrained demand in the S11–S13 hotspot. TPC has hard priority, AGC uses deadline-aware scheduling, and 4/6/8 is an engineering admission target that preserves margin rather than a mathematically maximal layer count.

If the reader can repeat only the numbers but not this model, the explanation failed.
