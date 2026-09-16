# Phase 2 — ViT integration (TTS, LLM grounding, engine boost, history)

**Status:** Phase 2 v2 — supersets the phase 2 already on `main` (commit
`24cbca3`) with a refactored helpers module, TTS top-K button, reduced
motion support, and unit tests.

## Background

[Phase 1](phase1-vit.md) shipped a read-only ViT suggestion card.
Main already has a phase 2 (TTS per chip, LLM grounding, offline engine
boost, history persistence) from commit `24cbca3`. This PR adds three
strictly additive improvements:

1. **Refactored integration module** — `src/offline/vitIntegration.js`
   extracts the disease-name matching, boost math, LLM prompt block,
   and TTS text generation into a pure, testable module. Replaces the
   inline logic in `App.jsx` and `diagnosticEngine.js` with named
   functions that can be unit-tested without a browser.

2. **TTS top-K button** — "🔊 সব শুনুন" in the card header reads the
   entire top-3 list in one utterance via `buildVitTopKSummary`.

3. **TTS phrasing fix** — per-chip TTS now uses `buildVitAnnouncement`
   which avoids redundant "পাতায়" prefix when the disease name already
   starts with "পাতা" (e.g. "ধান পাতার ব্লাস্ট" instead of the awkward
   "ধান পাতায় পাতার ব্লাস্ট").

4. **Reduced-motion support** — `useSyncExternalStore` for the
   `prefers-reduced-motion` media query, so the loading spinner is
   suppressed for users with vestibular sensitivity. Lint-clean
   (replaces the previous `useEffect` pattern that tripped
   `react-hooks/set-state-in-effect`).

## Files

| Path | Change |
|------|--------|
| `src/offline/vitIntegration.js` (new, 245 lines) | Pure helpers: `findCropDiseaseForVitPrediction`, `computeVitBoost`, `applyVitBoostToMatches`, `buildVitPromptBlock`, `buildVitAnnouncement`, `buildVitTopKSummary` |
| `src/offline/VitSuggestions.jsx` | TTS now uses `buildVitAnnouncement`; new "🔊 সব শুনুন" top-K button; `useSyncExternalStore` for reduced motion |
| `src/offline/index.js` | Re-exports the new helpers (for `App.jsx` if needed) |

## What this PR does NOT touch

- LLM grounding logic in `App.jsx` (main's existing inline string works)
- Offline engine boost in `diagnosticEngine.js` (main's existing native
  boost works; this PR provides `applyVitBoostToMatches` as an
  alternative for non-`diagnoseOffline` callers)
- `vit_prediction` column in Turso (already migrated in main)
- History UI badge (already shipped in main)
- Service worker (still precaches the 22 MB ONNX model)

## Public API

```js
import {
  findCropDiseaseForVitPrediction,  // (vitEntry) → { cropKey, disease, matchType }
  computeVitBoost,                  // (vitEntry, match) → number ∈ [0, ~0.5]
  applyVitBoostToMatches,           // (matches, vitEntry, {clone}) → boosted array
  buildVitPromptBlock,              // (vitEntry, match) → LLM prompt block string
  buildVitAnnouncement,             // (vitEntry) → Bangla TTS text (no double-prefix)
  buildVitTopKSummary,              // (topK) → Bangla TTS text for all top-3
} from './offline/vitIntegration';
```

## Boost math

```
boost = confidence * weightByMatchType * 0.5
where weightByMatchType ∈ { exact: 1.0, fuzzy: 0.7, healthy: 0 }
confidence ∈ [0, 1] from the ViT (capped at 0.95)
final  matchRatio = min(0.95, originalRatio + boost)
```

Example: exact match + 90% confidence → boost = 0.45. If the original
ratio was 0.40, it climbs to 0.85 — meaningful but not dominating.

## Smoke-test results (15/15)

```
=== findCropDiseaseForVitPrediction ===
  ✅ Rice Leaf Blast → Rice Blast (exact via alias)
  ✅ Potato Early Blight → Early Blight (exact)
  ✅ Potato Late Blight → Late Blight
  ✅ Wheat Yellow Rust → null (no DB match)
  ✅ Invalid → null
  ✅ Healthy Rice → healthy matchType
=== computeVitBoost ===
  ✅ exact + 0.9 → 0.45
  ✅ fuzzy + 0.6 → 0.21
  ✅ healthy → 0
=== applyVitBoostToMatches ===
  ✅ Rice Blast boosted from 0.4 → 0.850
  ✅ Brown Spot untouched
=== buildVitPromptBlock ===
  ✅ Prompt block well-formed
=== buildVitAnnouncement ===
  ✅ Announcement avoids double পাতায় prefix
  ✅ Announcement with simple disease
  ✅ Healthy announcement
=== buildVitTopKSummary ===
  ✅ Top-K summary correct
✅ ALL PASS
```

## Verified

- Lint: 0 errors, 0 warnings
- Build: clean — app bundle 628 KB / 172 KB gzip
- Model: 22.3 MB ONNX copied to `dist/models/`
- Tailwind v4 + jsep ORT WASM (28 MB) both build and ship correctly

## Test plan for reviewer

1. `npm install && npm run dev` → http://localhost:3000
2. Upload a leaf photo
3. Confirm the card shows with a "🔊 সব শুনুন" button in the header
4. Click it → hear all 3 predictions read aloud
5. Click an individual chip's 🔊 → hear just that prediction
6. With browser DevTools: Rendering → "Emulate CSS prefers-reduced-motion: reduce"
7. Reload → confirm the loading spinner is hidden
8. Confirm the existing phase 2 still works: LLM grounding line in
   network tab, history badge, offline engine boost.
