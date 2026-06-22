# NPrep QBank Prototype — Claude Code Instructions

## LOCKED SETTINGS — DO NOT CHANGE

The following two settings in `src/App.jsx` are intentionally fixed and must never be modified:

### 1. Default screen = `'home'`
```js
const [screen, setScreen] = useState('home')
```
- The `/nprep` route must always open to the QBank home screen (subjects list, session card, AIR 15 banner).
- Do NOT change this to `'solve'`, `'subject'`, or any other value.

### 2. Profile / QueryTracker button — REMOVED
- The `showTracker` state, `<QueryTracker>` render, and `tracker-tab-btn` button must NOT be added back to `NprepPrototype`.
- This was deliberately removed. Do not restore it.

## Other rules
- The `/nprep` route renders `<NprepPrototype />` directly — do NOT wrap it in `<RaiseAQueryLayout>` or any other layout component.
- The "Having trouble? Report" link in `src/screens/Solve.jsx` must remain as a small red text link — do NOT replace it with a prominent styled button.
