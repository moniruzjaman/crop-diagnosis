# Phase 1 — On-device ViT leaf-disease classifier

## What this ships

A **read-only, on-device computer-vision suggestion card** that appears
right after a farmer uploads a leaf photo. The card surfaces the top-3
predictions from a Vision Transformer (ViT) running entirely in the
browser — no API call, no internet, no API key.

The farmer taps a prediction to pre-fill the diagnose form (crop + disease
hint). They still run the full CABI 5-step protocol to verify. The
classifier never auto-submits.

## Why Phase 1 is read-only

- Proves value without any change to the existing diagnosis logic
- Lets us measure inference speed and accuracy on real farmer photos
  before wiring it into the LLM or rule-based engine
- Zero risk to the LLM waterfall (Gemini → OpenRouter → Groq) and zero
  risk to the offline rule engine

## Model

| Property        | Value |
|-----------------|-------|
| Source          | `wambugu71/crop_leaf_diseases_vit` (HuggingFace) |
| Architecture    | ViT (12 layers, 192 hidden, 13 classes) |
| Input           | 224×224 RGB, ImageNet mean/std normalized |
| Output          | 13 logits → softmax → top-3 |
| Format          | ONNX fp32 (22.3 MB) |
| Conversion      | See `notebooks/crop_leaf_diseases_vit_to_onnx.ipynb` |
| Hosting         | `public/models/crop_leaf_diseases_vit.onnx` (precached by SW) |
| Runtime         | `onnxruntime-web` (WASM, SIMD when available) |

### 13 classes (with Bangla names)

| Idx | Class (raw)                  | Bangla              | Category |
|-----|------------------------------|---------------------|----------|
| 0   | Corn___Common_Rust           | ভুট্টা — সাধারণ মরিচা | fungal   |
| 1   | Corn___Gray_Leaf_Spot        | ভুট্টা — ধূসর পাতার দাগ | fungal |
| 2   | Corn___Healthy               | ভুট্টা — সুস্থ       | healthy  |
| 3   | Invalid                      | অবৈধ ছবি            | invalid  |
| 4   | Potato___Early_Blight        | আলু — আগাম ঝলসা     | fungal   |
| 5   | Potato___Healthy             | আলু — সুস্থ          | healthy  |
| 6   | Potato___Late_Blight         | আলু — বিলম্বিত ঝলসা | fungal   |
| 7   | Rice___Brown_Spot            | ধান — বাদামি দাগ     | fungal   |
| 8   | Rice___Healthy               | ধান — সুস্থ          | healthy  |
| 9   | Rice___Leaf_Blast            | ধান — পাতার ব্লাস্ট  | fungal   |
| 10  | Wheat___Brown_Rust           | গম — বাদামি মরিচা    | fungal   |
| 11  | Wheat___Healthy              | গম — সুস্থ           | healthy  |
| 12  | Wheat___Yellow_Rust          | গম — হলুদ মরিচা     | fungal   |

> Note: class 3 ("Invalid") means the input was not a recognizable leaf
> (background, full plant, blur). The UI shows a friendly Bangla message
> instead of disease chips.

## Files

| Path | Purpose |
|------|---------|
| `public/models/crop_leaf_diseases_vit.onnx` | Model file (22.3 MB) |
| `src/offline/vitClassifier.js` | Lazy-load + inference API |
| `src/offline/VitSuggestions.jsx` | Read-only UI card |
| `src/offline/index.js` | Re-exports for the rest of the app |
| `src/App.jsx` | Wires `<VitSuggestions>` into the diagnose flow |
| `public/sw.js` | Precaches the ONNX model for offline use |
| `vite.config.js` | `assetsInclude` for ORT .wasm files |

## Public API (from `src/offline/vitClassifier.js`)

```js
import {
  classifyLeaf,        // (dataUrl, { topK, timeoutMs }) → result
  preloadModel,        // fire-and-forget warmup
  isModelReady,        // sync state check
  getModelInfo,        // diagnostics
  disposeModel,        // free ORT session
  VIT_LABELS,          // 13-row label table
} from './offline/vitClassifier';
```

`classifyLeaf` returns either:
- `{ ok: true, topK, allScores, inferenceMs }` on success
- `{ ok: false, code, error }` on failure — never throws

## Performance notes

- First call: 5-15 seconds (22 MB download + WASM init) on a mid-range
  Android over 3G. Subsequent calls: 60-150 ms for inference.
- Model is loaded **once per page lifetime** (singleton), then cached
  by the service worker for offline reuse.
- 22 MB is precached by the SW so the prediction works on the very first
  diagnosis attempt — no network required.

## What Phase 1 does NOT do (intentional)

- No integration with the LLM waterfall prompt
- No integration with the offline rule engine
- No `POST /api/classify-leaf` server endpoint
- No analytics on ViT prediction acceptance
- No TTS readout of the prediction

All of these are scoped to Phase 2+ and gated on Phase 1 success
metrics (inference speed on real devices, prediction acceptance rate).

## Re-converting the model (if needed)

The original notebook is at `notebooks/crop_leaf_diseases_vit_to_onnx.ipynb`.
It produces `crop_leaf_diseases_vit.onnx` (~22 MB, fp32, opset 17).
Drop the output into `public/models/` and bump the SW cache version.
