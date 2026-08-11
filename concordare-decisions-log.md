# Concordare EHR Prototype — Decisions Log

Single source of truth for architecture and UX decisions on the take-home prototype (XYZ Family Clinic, Assistant Sam Whitfield / Physician Amara Osei, patient Jordan Reyes). Feeds the PRD and flow diagrams. Supersedes any conflicting detail in earlier prototype files (v1–v5) or the context/problem doc, which are stale until regenerated against this log.

Every decision below carries an explicit **Rationale:** — the reasoning a reviewer or interviewer would expect to hear if they asked "why did you build it that way," not just the description of what was built.

---

## 1. Access model — labs & imaging

**Default state:** all lab and imaging results are locked to the assistant until the physician acts on them. This is the baseline gate described in the brief, not a special case for one result.

**Two paths to visibility for any pending item:**
1. Normal release — physician releases the result into the record, permanently visible to the assistant from that point on.
2. Temporary access grant — Assistant requests early access with a stated care reason; physician grants a time-limited window or denies with written feedback.

**What's visible while locked:** type is shown, value is hidden. The Assistant sees test/image name, date ordered, and a "pending physician release" status. She does not see the result value or clinical interpretation.

**Applies to all pending labs/imaging**, not just the Hepatitis C result. Hep C is the demo case used to walk through the full grant/countdown/expiry interaction; the pattern generalizes to every pending item in the panel.

**Rationale:** order existence is administrative/logistical information the practice already documents (the assistant may have drawn the sample or placed the order). What's protected is the interpreted result — the clinical judgment layer. This also makes the request flow legitimate, since she needs enough context to write a real care reason instead of guessing blind. It's the deliberate counterpoint to the confidential note (Section 5), which hides existence entirely — same visual "restricted" language, two different gate depths, for two different categories of information (practice-owned record vs. physician-owned judgment). Scoping the gate to every pending item rather than just Hep C matters because a reviewer testing edge cases would immediately notice a special-cased demo item and read it as the design not actually generalizing.

**Clarification, surfaced during card design work:** the gate only ever restricts the *Assistant's* visibility. The physician has an unconditional "View" action on every lab card, in every status, including `pending` and `requested` — she never lost access to begin with, so there's nothing to grant back to her. This wasn't originally stated explicitly and is worth recording now that it's been confirmed: the access-control model has exactly one restricted party, not two roles each with their own gate.

---

## 2. Temporary access grant mechanics

- **Duration options (physician-selected at grant time):** 10s (demo) / 10m / 1h / 4h / 24h. The 10s option exists purely so the expiry and blur/modal interaction can be demonstrated live in a walkthrough without waiting out a real window — it's explicitly labeled "(demo)" so it doesn't get mistaken for a real clinical duration.
- **Timer start:** does not start at grant. Starts when the assistant clicks into the result and confirms via a modal ("Start your 1-hour access window now?"). A grant can sit un-started if she doesn't get to it right away.
- **Active state:** live countdown shown next to the item once started.
- **Expiry:** item flips to an "expired" state with a re-request affordance. No cooldown, no special-casing — expired is functionally identical to never-requested, just re-requestable immediately.
- **Expiry mid-read:** if the assistant has the result open when the timer hits zero, content blurs immediately and a modal surfaces explaining access has expired, with a close action.
- **Demo craft note:** a reusable lightbox component renders a fake document with greeked/unreadable placeholder content for any lab or imaging result, used for the blur state before the expiry modal takes over.
- **Reason field:** free text, no validation.

**Rationale:** duration sits with the physician because she's the one accountable for how long protected data stays exposed — it's a clinical/compliance judgment, not an assistant convenience setting. The timer starting on confirmation rather than on grant matters because the assistant is often mid-task elsewhere when a grant comes through; if the clock started immediately, she could lose a meaningful fraction of her window before she even opens the item, which would make the feature feel stingier than intended. Expiry is a hard, unmissable interrupt (blur + modal, not a quiet status change) because letting stale access linger visually — even for a few seconds after the window closes — undercuts the whole point of a *time-limited* grant; the interruption needs to be as legible as the grant itself. The greeked-content lightbox exists so that interrupt has something real to visually blur, rather than reading as a placeholder covering a placeholder. The reason field is trust-based, not validated, because the brief's "honest trust-level handling" criterion is about representing real trust, not manufacturing gatekeeping friction that doesn't exist in an actual small-clinic relationship between an assistant and her supervising physician.

---

## 3. Denial path (both queues, mirrored)

**Decision:** both the note-cosign queue and the access-request queue require written feedback to deny/return — no silent rejection on either side.

- Cosign queue: physician cannot return a Assistant's note without written feedback explaining why.
- Access-request queue: physician cannot deny an access request without written feedback explaining why.

Denial and expiry land the assistant in the same "try again" state; a denial additionally surfaces the written reason.

**Rationale:** these are structurally the same kind of moment — someone with authority telling a colleague "not yet" — even though one is about a note and the other is about data access. Silence-as-denial was flagged early as a specific weak point (Section on edge cases, resolved): an assistant left wondering whether she was denied or just not yet answered is worse than an assistant given a clear, if unwelcome, reason. Requiring written feedback on both paths also means the audit trail (Section 11) captures *why* something was blocked, not just *that* it was — which is the more clinically and legally useful record. Mirroring the pattern across both queues, rather than inventing a separate denial mechanic for each, keeps the system easier to learn and easier to defend as intentional rather than inconsistent.

**Related decision, added during card design work: Release also requires a confirmation dialog**, bringing all three physician response types to a requested item — Grant, Deny, Release — to the same friction level. Grant and Deny already had a pause-before-commit (duration picker, required-feedback field respectively); Release was a single, immediate click. That was inconsistent, and worse for Release specifically, because it's the one response with no way back — a grant expires, a denial can be revisited with another request, but a permanent release cannot be undone. The confirmation dialog doesn't need a text field like Deny's, just an explicit "this is permanent" confirmation step, but it needs to exist.

**Related decision: denial can be dismissed by the assistant, resetting the card's display.** An X on the denial block clears it from view — the card reverts to look exactly like a never-requested `pending` card (no tag, "Request access," not "Request access again"). This is a display-layer reset only: the denial itself remains part of the permanent record in the audit trail and in the Assistant's own request history (§10a) — dismissing only affects what she sees on the Labs & Results tab going forward, giving her a way to clear resolved, no-longer-actionable clutter from her working view without losing the underlying record anywhere it's actually needed.

---

## 4. Cosign / note lifecycle

- **Finish Visit belongs to the physician, gated on submission — not cosign.** Reversed from an earlier Assistant-owned model. The action is disabled until the assistant has submitted a note at least once (`hasSubmittedOnce`); it does not require that note to be cosigned. The physician can finish the visit while a note sits pending cosign, or even while it's returned and awaiting the Assistant's revision.
- **Finishing does not freeze the encounter.** Note cycling (cosign, return with feedback, resubmit) and confidential note editing all remain available after finish. Finish closes the Assistant's physical encounter with the patient — the physician's chart-side review and documentation are treated as separate, ongoing work.
- **The Assistant cannot finish a visit.** She sees a status line reflecting where the note stands ("Note pending cosign — ready to finish" from the physician's perspective; on her own side, a note that cosigning and finishing are independent tracks) rather than any finish control.
- **Cosign, return, and resubmit cycle independently of the encounter's open/closed state, before and after finish, with no limit.** This can repeat as many times as needed.
- **Finished visits move into visit history** and become read-only *as a visit entry*, opening in the same right-side panel used for the live visit — but the note and confidential note within that panel can still be edited/cycled even once the visit itself shows as finished.
- **Version history is built, not deferred.** Every submit or resubmit creates a version entry; a "View revision history" control appears once more than one version exists.
- **No live concurrency/co-editing.** Neither side sees the other's live/unsubmitted draft.
- **No SLA or escalation mechanic.** A note or request can sit pending indefinitely.

**Rationale:** an earlier version of this decision gated Finish on cosign and froze the encounter afterward, on the reasoning that finishing should represent a completed physician review. That turned out to conflate two different things that don't actually depend on each other in real clinical work: the assistant closing out the physical encounter with the patient (she's done, the patient can leave) and the physician's documentation review (which can reasonably continue for hours, independent of whether the room has been vacated). Gating Finish on cosign forced those two into a single sequence that doesn't reflect how the two roles actually operate — the physician shouldn't be blocked from closing out an encounter administratively just because her note review is still in progress, and conversely, the note review shouldn't need to stop just because the encounter closed. Gating on submission instead of cosign restores this as two genuinely parallel tracks (matching the pre-flip model, just with Finish now correctly owned by the physician rather than the assistant) — the only thing Finish now requires is that there's actually something for the physician to have received in the first place. Version history, no live co-editing, and no SLA/escalation are unaffected by this correction and remain reasoned through as before.

---

## 5. Confidential notes

- Fully invisible to the assistant — existence and content both hidden, not just the content.
- No request path exists for confidential notes (unlike labs/imaging).
- No edit trail currently modeled for later amendments to a confidential note — open question, not yet a blocker.

**Rationale:** labs and confidential notes look similar (both start "locked") but represent fundamentally different categories of information, and the gate depth should reflect that difference honestly rather than reusing one lock for both. A lab result is a practice-owned record — the test happened, it's part of the documented visit, and its *existence* is safe to acknowledge even while its value stays protected. A confidential note is the opposite: it's the physician's private clinical judgment, something she chose to write and that has no administrative "safe layer" to expose. Giving it a request path (like labs have) would imply the assistant has some legitimate claim to eventually see it with the right justification — which isn't true, and pretending otherwise would misrepresent the trust boundary the brief asks for. Leaving the edit-trail question open rather than answering it either way in Section 4 or 11 keeps this from being silently guessed at.

---

## 6. Concurrency — Assistant and doctor can be logged in simultaneously

**Reversed from an earlier assumption.** The prototype originally assumed Assistant and doctor were never active at the same time, to justify the Demo Controls role-toggle. That assumption is dropped: concurrent use is the accurate clinical reality and is explicitly supported.

**Demo Controls role-toggle reframed:** it's not simulating "these two people are never on together." It's simulating "these two people are on separate devices at the same time, and this toggle just lets one person preview both screens for demo purposes."

**Rationale:** the original never-simultaneous assumption was a convenience for building the demo, not a real clinical constraint — an assistant and her supervising physician absolutely can and do work the same chart at the same time in an actual small practice. Keeping the assumption would have meant shipping a subtly dishonest model of how the tool works. What makes reversing it safe, without needing to build real-time sync, is that neither side ever sees the other's in-progress/unsubmitted state (per Section 4) — a side's view only updates once the other party has taken a committed action. Concurrency is safe by construction (submitted-state-only visibility), not by assumption (pretending it never happens), which is the more defensible position if a reviewer pressed on it.

---

## 7. Scale / roster

**Decision:** single active patient and single active visit at a time, for both Assistant and doctor. No concurrent multi-patient simulation, no roster status badges.

- Jordan Reyes remains the only interactive patient in the roster; all others show a scoped-toast placeholder on click.
- Architecture (queues, access-request model) is designed to generalize to concurrent patients; the interactive prototype intentionally scopes to one encounter to keep focus on the access-control mechanics being evaluated.

**Rationale:** the brief is testing whether the access-control, gating, and escalation mechanics have real craft — not whether a multi-patient queue can be built in the time available. Every hour spent making concurrent visits interact correctly across two roles is an hour not spent polishing the interactions actually being evaluated (grant countdowns, denial flows, cosign cycles). Scoping to one patient is a considered trade-off stated plainly in the PRD, not a corner cut silently — the difference between "I didn't think about this" and "I chose not to build this, and here's why" is exactly the kind of judgment call worth being explicit about rather than hoping it goes unnoticed.

---

## 8. Schedule page

**Two views:** Today and Full Week, toggled at the top of the page. Both are read-only navigation surfaces into the same underlying visit/patient data — no separate scheduling data model.

- **Full Week:** one column per weekday (Mon–Fri), chronological within a day, with a separate "Completed" section (Finished, No Show, Cancelled) at the bottom.
- **Today:** the same appointments regrouped into five status columns instead — Scheduled (Late included, distinguished by its own pill), Intake, Review, Finished, Other (No Show + Cancelled folded together).
- **Card content is deliberately minimal:** patient name, appointment time, and a status pill (Scheduled's pill is suppressed entirely).

**Rationale (views and card content):** Full Week answers "what does this week look like," where chronological order within a day matches how a front desk actually thinks about a schedule. Today answers a different question — "who needs attention right now" — which is inherently a status question, not a time question, so regrouping by status rather than time for that view isn't just a stylistic choice, it's matching the view to the question it's meant to answer. Minimal card content (no diagnosis, no visit reason, nothing clinical) keeps the schedule from becoming a second, competing surface for information that belongs in the chart — it's a navigation and triage tool, not a chart summary. Suppressing the Scheduled pill specifically means an unlabeled card reads as "nothing to report," which is more honest than labeling the default state as if it were noteworthy.

**Statuses — 7 total, 6 stored + 1 computed:** `scheduled`, `late` (computed), `intake`, `review`, `finished`, `no_show`, `cancelled`.

**Rationale (status set):** Intake collapses three Assistant-owned sub-states (vitals outstanding, note outstanding, note returned) into one status, and Review collapses two physician-owned sub-states (submitted-awaiting-cosign, cosigned-awaiting-finish) into one. The schedule's job is to answer "whose court is the ball in," not to reproduce every granular state already visible inside the chart — a status set that mirrored the full internal state machine would be more precise but less legible at a glance, which works against the schedule's actual purpose. Late is computed rather than stored because "late" isn't a fact about the appointment, it's a relationship between the appointment time and the current moment — storing it as static data would let it go stale and lie.

**Status is derived, not tracked independently.** For Jordan Reyes, status is computed live from `vitalsSubmitted` / `noteStatus` / `visitFinished` / `visitStarted`, the same state driving the rest of the prototype.

**Rationale:** a second, independently-tracked status field is a second source of truth, and second sources of truth drift — the chart says one thing, the schedule says another, and now the system is telling two different stories about the same patient. Deriving status live means the schedule can never disagree with the chart, by construction, which also happens to be a stronger demonstration of engineering discipline than a schedule that merely *looks* synced.

**Opening the visit doubles as check-in.** There is no separate "patient has arrived" step distinct from opening the chart.

**Rationale:** this was an explicit open question, resolved by choosing the simpler model rather than inventing a check-in flow the brief never asked for. A real product might eventually separate "arrived" from "chart opened," but adding that distinction here would be scope the assignment doesn't reward, so it's named as a known limitation (Section 12) instead of quietly built halfway.

**Non-Jordan appointments are seeded, not random**, and **the prototype's clock is pinned to 11:00 AM, Monday, August 10, not live.**

**Rationale:** both choices exist for the same reason — reviewer-facing determinism. A schedule populated with `Math.random()` or judged against the real system clock would look different every time someone opened the file, which makes a walkthrough unreliable and makes it harder to talk through a specific state ("look, this card is Late") when that state might not exist on a second viewing. Pinning the clock and seeding the placeholder data are both explicitly logged as deliberate demo-only divergences from how a real product would behave (Section 12), not silent shortcuts.

---

## 9. Navigation — breadcrumbs reflect origin

**Decision:** the breadcrumb on Patient Detail shows where the user actually came from (Schedule, Cosign Queue/Notes Review, or Patients), not a hardcoded "Patients," and clicking it returns there.

**Rationale:** clinical work is task-driven and interruption-heavy — a physician opens a chart because a request needed her attention, or because she's scanning the schedule, not because she was systematically browsing a patient roster. A breadcrumb that always funnels back to "Patients" regardless of entry point silently discards that context and forces an extra navigation step to get back to what she was actually doing. Since the underlying mechanism was already free — `view` never changes when the patient detail overlay opens, so the origin is already sitting in state — reflecting it correctly cost nothing architecturally and meaningfully improved navigational honesty.

---

## 10. Notification layer

**Decision:** badges + per-item unread state + actor-side toast confirmations. Nothing beyond that.

- **Queue badge counts:** shown at the sidebar nav level, starting at 0, incrementing only on real submitted/requested items.
- **Per-item "new" marker:** clears when that specific item is opened.
- **A queue never lists an item that has nothing behind it** — an empty state is shown explicitly instead.
- **Actor-side toast:** confirms the actor's own action went through; not a notification to the other party.
- **Explicitly not built:** push, email, SMS, or any "the physician was pinged" simulation.

**Rationale:** a client-only prototype with no backend and no real device separation can't honestly demonstrate push, email, or SMS — building a toast that claims "Dr. Osei has been notified" would be asserting an infrastructure capability the architecture doesn't actually have, which is worse than just not building it. Badges and per-item unread state are the layer this prototype *can* truthfully show, so that's where the craft went: counts that start at zero and only move on real events, items that individually track whether they've been seen, and queues that never dangle a clickable row over nothing. Actor-side toasts are feedback for the person acting, not a notification to the other party, because conflating the two would misrepresent what the system actually knows about whether the other person has seen anything.

---

## 10a. Assistant-facing request queue ("My Requests")

**Decision:** reversed from an earlier position that the assistant had no dedicated Access Requests view. She now gets a read-only "My Requests" view at the same route the physician's Access Requests inbox lives at, role-labeled differently — same pattern as Cosign Queue / Notes Review. This decision went through several discarded intermediate designs before landing here (see below) — later readers should treat this section as final, not the first attempt.

- **Two tabs:** Awaiting Response (requested, no doctor action yet) and Resolved (doctor has granted, denied, or permanently released). New responses land in Resolved.
- **Physician gained a third response option:** permanent release, alongside grant and deny, as a direct response to a `requested` item — distinct from the pre-existing "release a never-requested pending item" action, which is unrelated and doesn't touch any of this.
- **Badge tracks outcomes, not incoming requests.** `assistantUnseenResolution` (distinct from the physician's own `viewedRequests` read-state) gains an entry on grant, deny, or release-as-response. Never on the act of requesting, never on expiry, never on an unrelated direct release.
- **Resolution trigger is viewport entry, and only viewport entry.** A Resolved-tab row clears itself from `assistantUnseenResolution` the moment it's observed entering the viewport (IntersectionObserver). Not click, not hover, not opening the page, not navigating away. This was the actual hard problem in this decision — see rationale.
- **Resolution and navigation are fully decoupled.** A row resolves on sight regardless of whether she does anything with it. Granted/released rows optionally link through to Labs & Results to view the actual result — pure convenience, unrelated to the resolve state, which already happened. Denied rows have no link at all; the reason is shown inline, so there's nothing to navigate to.

**Rationale:** the original reasoning against a Assistant-facing view was that her per-lab status was already fully visible on the Labs & Results tab, so a second queue would be redundant. That held for *status*, but missed that a status-only view can't tell her *when something changed* without her re-checking every locked item herself — the tab stays authoritative for what's true right now, this queue is just what changed since she last looked.

Getting the resolution mechanism right took several wrong turns worth recording so they aren't re-tried: hover-to-resolve was considered and rejected because it either fires too eagerly (a cursor passing through on its way elsewhere) or needs an arbitrary dwell timer to compensate, plus it has no equivalent on touch input, which an assistant on a tablet would hit as a dead end. A click-to-resolve model, paired with a separate "Acknowledge" button for denials (since a denial has nothing to click through to), was built out further before being cut — it worked, but the deeper problem was that per-item resolution ceremony doesn't match what this page actually is. Unlike an unsigned note, a resolved access request carries no ongoing obligation once it's answered: nothing to sign, nothing blocking anyone. Building an interaction model as heavy as the note-queue's for a page that's fundamentally just awareness was solving a problem this page doesn't have. Viewport-based resolution is the right weight for that: passive, requires no deliberate act, and still gives a real per-item "she's seen this" guarantee — closing the page with unseen rows still off-screen correctly leaves them flagged, since scrolling past is the one thing that actually correlates with having looked.

---

## 11. Built (previously deferred — now implemented)

- **Version history** for notes — every submit/resubmit is a tracked version, with return timestamp and feedback attached.
- **Audit trail depth** — a real event log records vitals submission, note submit/cosign/return/resubmit, access request/grant/deny/start/expiry, result release, medication changes, confidential note writes, and visit finish, each with actor, action, timestamp, and detail.
- **Medications** — moved from a toast stub to full functionality: Continue/Discontinue with a per-medication event history, and an Add Medication modal.
- **Per-item unread tracking** on Access Requests, matching the Cosign Queue pattern.
- **Visit status legibility** — an explicit status line on the live visit panel; empty states stated plainly rather than implied.
- **Schedule page and origin-aware breadcrumbs** — both new, not resolved deferrals.

**Rationale:** everything in this list was originally deferred with an explicit "will build later" flag rather than silently dropped (see the acknowledged-limitations discipline in Section 12) — the point of keeping that distinction was so that revisiting them later, as happened here, was a planned resolution rather than scope creep discovered by accident. Building out audit depth and version history in particular closes the gap between "the system has an audit trail" and "the audit trail is actually trustworthy" — a shallow, computed-on-the-fly list would have looked similar in a screenshot but would not have held up under a reviewer actually clicking through denial reasons or expiry events looking for real detail.

---

## 12. Acknowledged limitations (won't build for this prototype)

- No SLA/escalation mechanic for stalled notes or requests.
- No live/real-time co-editing sync.
- No multi-patient concurrent visit simulation.
- No push/email/SMS notification simulation.
- No edit trail for confidential note amendments (open question, not yet resolved either way).
- No separate "checked in" state distinct from "chart opened" (Section 8).
- Schedule's simulated clock is pinned, not live (Section 8).

**Rationale:** every item here was a deliberate line drawn, not a corner cut without noticing — each one traces back to a specific trade-off already reasoned through in the section it belongs to (scope focus in Section 7, infrastructure honesty in Section 10, deterministic demo behavior in Section 8). Keeping this list explicit, rather than letting these gaps be discovered by a reviewer poking at the prototype, is itself part of the design discipline being demonstrated: knowing precisely where a build stops and being able to say why is a stronger signal than a build that quietly stops without acknowledgment.

---

## Status

This log reflects the current build in full, including the Schedule page and origin-aware breadcrumbs, with an explicit Rationale for every decision. The interaction-focused prototype (`concordare-flow-prototype.jsx`) is the current reference build and is consistent with this log. The earlier v1–v5 iterations, the deployable repo (`concordare-ehr-prototype.zip`), and the old Cursor scaffold prompt all predate these changes and are stale — do not use them as a build reference.
