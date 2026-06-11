# NPrep Video Player Screen — Build Spec for Claude Code

## Context

This is a screen for NPrep, a nursing exam prep platform for tier 2/3 city students in India. This screen is part of an existing Vite + React prototype (deployed on Vercel via GitHub). Build this as new component(s) that fit into the existing project structure — check the existing routing and component patterns before adding new files, and follow the same conventions (file naming, styling approach, component structure) already used in the QBank screens.

If this is being built standalone (no existing project context available), scaffold a Vite + React app and build this as the primary screen.

**Tone and voice for all microcopy on this screen:** Peer-to-peer, not authority-to-student. Hindi-English mixed phrasing is welcome (e.g., "Chaliye, agla sawaal" / "Yeh topic phir se dekh lete hain"), but all text must render in English script (Hinglish, not Devanagari). Avoid exam-invigilator tone. Avoid over-the-top hype ("AMAZING!", "You're a STAR!") — keep acknowledgments calm and genuine, like a friend who's reviewing with you, not a cheerleader.

---

## Screen 1: Video Player Home

### Layout (top to bottom)

**1. Video player**
- Standard video player with play/pause, 10-second rewind/forward buttons
- Progress bar showing current position
- Top-right of player: two icons —
  - **Language toggle icon**: switches subtitle/audio track between Hinglish and English. Tapping toggles between the two states (Hinglish ↔ English). Show current state visually (e.g., "EN" / "HI" label or icon state change).
  - **Settings icon (gear)**: opens the settings panel (see Screen 2 below)
- Bottom-right of player: fullscreen/expand icon
- **In-player doubt flag**: a small "?" icon, persistently visible in the player (positioned so it doesn't crowd the language/settings icons — consider bottom-left of the player or integrated into the control bar). Tapping it pauses the video and opens a popup:
  - Popup text: "Did you not understand this part of the video?"
  - Captures the current video timestamp automatically (do not show the timestamp to the user — just log it)
  - Two options: "Yes, flag this" (submits silently, shows brief confirmation toast like "Noted — we'll take a look") and "Cancel" (dismisses, resumes video)
  - This is a silent data-collection feature — no immediate resolution is shown to the student beyond the confirmation toast

**2. Title and metadata**
- Video title (e.g., "Cardiovascular System — Part 1")
- "Uploaded on: [date]" — show this, no duration shown here
- Do NOT include a duration field on this row

**3. Action row** (4 items, evenly spaced, icon + label below each)
- **Like** (thumbs up icon)
- **Dislike** (thumbs down icon) — tapping opens an optional text field: "What didn't work for you?" with a "Submit" and "Skip" button. Submitting without text is allowed (Skip = submit with no reason).
- **Add to Save list** (bookmark icon) — tapping saves this video. Saved videos go into the global Saved section under a "Videos" category (see Saved Section spec below). Toggle state: filled bookmark = saved, outline = not saved.
- **Share** (share icon) — standard share sheet trigger (can be a placeholder/console.log for prototype)

Do NOT include a "Mark as Complete" button. Completion is automatic and handled via the completion overlay (see below).

**4. Tabs** — three tabs below the action row: "Topics Covered" | "Resources" | "Self-Notes"

#### Tab: Topics Covered
- A vertical list of chapter/topic entries, each showing:
  - Topic name (e.g., "Introduction", "Renal Physiology", "Acid-Base Balance")
  - Timestamp where this topic begins (e.g., "03:00")
- Tapping an entry seeks the video to that timestamp
- Use placeholder data: 4-5 topics per video with plausible timestamps

#### Tab: Resources
- Two resource rows:
  - **Slides** — icon + label "Slides" + subtitle "[N] frames · auto-captured"
  - **Notes** — icon + label "Notes" + subtitle "PDF · by content team"
- Each row has a bookmark/save icon on the right. Tapping saves the entire resource (whole slide deck, or whole notes PDF) for this video into the global Saved section under "Resources" (organized by subject/topic — see Saved Section spec below)
- Tapping the row itself (not the save icon) opens the resource in a simple viewer (placeholder: can just show a modal with "Slides viewer" / "Notes PDF viewer" placeholder content for the prototype)

#### Tab: Self-Notes
- A text area where the student can type their own notes for this video
- Below the text area, two additional options presented as buttons/cards:
  - **"Capture and upload your notes"** — placeholder button (file upload UI, can be non-functional for prototype, just show the UI)
  - **"Record your own voice"** — placeholder button (show UI for a voice recording control — record/stop/playback icons — but the actual recording/storage does not need to be functional for this prototype; visual placeholder only)
- Self-notes auto-save as the student types (debounced save indicator, e.g., small "Saved" text that appears briefly after typing pauses)
- Include a small label or divider with "OR" between the text area and the two alternative input methods, matching the layout style of: text area on top, then "OR", then the two option buttons side by side below

**5. Report bar** (bottom of screen, sticky/fixed)
- Green background bar
- Text: "Having an issue? Tap to report"
- Tapping opens a simple form/modal (placeholder is fine)

---

## Screen 2: Settings Panel

Opens as a bottom sheet or modal overlay when the settings (gear) icon is tapped.

Include the following controls:

- **Subtitles**: toggle on/off, with a sub-option to pick subtitle language if available (Hinglish/English — can tie to the same state as the player's language toggle, or be independent; use your judgment for cleanest implementation, but keep them visually consistent if both exist)
- **Dark mode**: toggle on/off — this should actually apply a dark theme to the screen if feasible, or at minimum show the toggle UI with state persisted
- **Playback speed**: selectable options — 0.75x, 1x, 1.25x, 1.5x, 2x (default 1x)
- **Seek interval**: adjuster for the rewind/forward buttons — options: 5s, 10s, 15s (default 10s)
- **Video quality**: selectable options — Auto, 480p, 720p, 1080p (default Auto) — placeholder, doesn't need to actually change video source for prototype

Settings panel should close via a clear "Done" button or tapping outside the panel.

---

## Screen 3: Video Completion Overlay

Triggered automatically when video playback reaches ~95% (define this as a constant, e.g., `COMPLETION_THRESHOLD = 0.95`, so it's easy to adjust later).

- Overlay appears on top of the video player
- Calm, peer-tone message acknowledging completion (e.g., "Done with this one. Nice.") — do not over-celebrate
- Auto-transition countdown to the next screen (the post-video quiz, Screen 4): show a small countdown ("Next up in 5... 4... 3...") with a "Skip" or "Continue now" option to bypass the wait
- If the student does nothing, auto-advance to Screen 4 after the countdown

---

## Screen 4: Post-Video Quiz

A short quiz (use 2-4 placeholder MCQ questions related to the video's topic — write plausible nursing-exam-style questions for "Cardiovascular System" as sample content).

### Per-question flow
- Show one question at a time with 4 options (single-select)
- After the student selects an answer, **immediately show analysis** (do not wait until the end of the quiz):
  - Highlight the correct answer and the student's selected answer (if different, show both clearly — correct in one color/style, student's wrong pick in another)
  - Show a 1-3 sentence explanation of why the correct answer is correct, in peer tone (e.g., "Right — the SA node is the natural pacemaker because it has the fastest rate of spontaneous depolarization.")
  - "Next question" button to proceed (or "See result" on the last question)

### Final screen (after all questions answered)
Calculate score as a percentage. Branch on a `PASS_THRESHOLD = 0.66` constant:

- **If score >= 66%**: Calm acknowledgment, e.g., "That went well. Ready to keep going?" — two buttons: "Continue to next video" (primary) and "Watch this again" (secondary, optional)
- **If score < 66%**: Calm, non-judgmental framing, e.g., "A couple of these need another look. Want to go through the video again?" — two buttons: "Watch this again" (primary) and "Continue anyway" (secondary)

In both branches, "Continue anyway" / "Continue to next video" should navigate to a placeholder "next video" state (can just be a console log or a simple "Next video would load here" placeholder screen for the prototype). "Watch this again" should reset Screen 1's video to 0:00 and return to Screen 1.

Both buttons must always be visible and tappable in both branches — never a hard gate. The student can always choose to move on regardless of score.

---

## Saved Section (referenced from this screen, build a minimal version)

A simple screen/route showing three categories as tabs or sections:
- **QBank** — placeholder list (can be empty state: "No saved questions yet")
- **Videos** — shows videos saved via the bookmark action on Screen 1 (use local state, doesn't need persistence beyond the session for prototype)
- **Resources** — shows saved slide decks / notes PDFs, grouped by subject/topic, each entry showing the resource name and "Saved on [date]"

This doesn't need to be polished — it exists so the save actions on Screen 1 have somewhere to go and the flow feels complete.

---

## Technical notes

- Use placeholder/dummy video files or a sample video URL (e.g., a public domain sample MP4) for the player — actual NPrep video content is not needed for this prototype
- Mobile-first layout — design for a ~375-414px width viewport primarily, but should not break on desktop
- State management: React state/context is sufficient, no need for external state libraries unless the existing project already uses one
- Keep components modular: separate components for VideoPlayer, SettingsPanel, ActionRow, TopicsCoveredTab, ResourcesTab, SelfNotesTab, CompletionOverlay, PostVideoQuiz, SavedSection
- All thresholds (`COMPLETION_THRESHOLD`, `PASS_THRESHOLD`, seek interval default) should be defined as named constants at the top of relevant files, not magic numbers inline, so they're easy to tune later

---

## Out of scope for this build (do not implement)

- Live Notes / AI-generated chapter summaries — explicitly deferred, do not build
- Chapter-boundary in-video tests/check-ins — removed from scope, only the post-video quiz (Screen 4) exists
- Actual voice note recording/storage/playback functionality — UI placeholder only
- Real backend/API integration — all data is local/placeholder
- Actual Hinglish↔English audio/subtitle track switching — UI toggle only, doesn't need real alternate tracks
- "Difficult challenges" / adaptive harder question sets — not referenced in any copy on this screen

---

## Open questions for Anant (not for Claude Code to resolve — flag if encountered)

- Final wording for completion and quiz-result microcopy should be reviewed before this goes to the design team — current copy in this spec is placeholder direction, not final.
