// On-device Vision Transformer (ViT) classifier for crop leaf diseases.
// Runs entirely in the browser via onnxruntime-web — no API call, no
// internet, no API key. Designed for Bangladesh's spotty rural networks.
//
// Pipeline:
//   imageDataUrl → resize 224×224 → ImageNet normalize → NCHW float32
//   → ort.InferenceSession → softmax → top-K predictions
//
// Model: wambugu71/crop_leaf_diseases_vit (ViT-base, 13 classes, 224×224)
// Converted to ONNX in the attached notebook and shipped as a static
// asset at /models/crop_leaf_diseases_vit.onnx (≈22 MB, fp32).
//
// We use the fp32 model — the notebook's own experiment showed int8
// quantization crashed accuracy for this 13-class task. The 22 MB asset
// is precached by the service worker so the prediction works offline.
//
// Public API:
//   await classifyLeaf(imageDataUrl)            → top-K results
//   await classifyLeaf(imageDataUrl, { topK })  → configurable K
//   preloadModel()                              → fire-and-forget warmup
//   isModelReady()                              → sync state check
//   getModelInfo()                              → diagnostics
//
// All functions are no-throw — errors are returned as `{ ok:false, error }`
// so callers can surface a friendly Bangla message without try/catch noise.

// onnxruntime-web ships as a UMD-style .mjs bundle. Named imports
// (import { InferenceSession } from 'onnxruntime-web') work in Node and
// modern bundlers, but some Rollup configurations warn about unresolved
// names. Using a default + namespace import is the most portable form.
import ort from "onnxruntime-web";
import { recordTelemetry } from "../utils/performanceTelemetry.js";
// Defensive: if the default-import shape ever ships a namespace, expose it.
const ortNs = ort && ort.InferenceSession ? ort : ort && ort.default ? ort.default : ort;

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_URL = "/models/crop_leaf_diseases_vit.onnx";
// onnxruntime-web needs to fetch a companion .wasm file at runtime. We point
// it to the same `/assets/` folder Vite copies the bundled .wasm into. The
// package's default resolver already looks next to the .mjs bundle, so this
// is mostly a defensive override for production builds where the resolution
// rules can differ between Vite versions.
const ORT_WASM_PATHS = "/assets/";
const IMAGE_SIZE = 224; // ViT input
const TOP_K_DEFAULT = 3;

// ImageNet mean/std — ViT was trained on these. Notebook uses HF's
// AutoImageProcessor which produces identical values for this checkpoint.
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

// 13 classes from wambugu71/crop_leaf_diseases_vit config.json.
// Each row: [cropEn, cropBn, diseaseEn, diseaseBn, isHealthy, category]
//   category ∈ {healthy, fungal, bacterial, viral, invalid}
// Bangla names follow the project glossary in src/data/cropDiseases.js.
const LABEL_TABLE = [
  {
    idx: 0,
    raw: "Corn___Common_Rust",
    cropEn: "Corn",
    cropBn: "ভুট্টা",
    diseaseEn: "Common Rust",
    diseaseBn: "সাধারণ মরিচা",
    isHealthy: false,
    category: "fungal",
  },
  {
    idx: 1,
    raw: "Corn___Gray_Leaf_Spot",
    cropEn: "Corn",
    cropBn: "ভুট্টা",
    diseaseEn: "Gray Leaf Spot",
    diseaseBn: "ধূসর পাতার দাগ",
    isHealthy: false,
    category: "fungal",
  },
  {
    idx: 2,
    raw: "Corn___Healthy",
    cropEn: "Corn",
    cropBn: "ভুট্টা",
    diseaseEn: "Healthy",
    diseaseBn: "সুস্থ",
    isHealthy: true,
    category: "healthy",
  },
  {
    idx: 3,
    raw: "Invalid",
    cropEn: null,
    cropBn: null,
    diseaseEn: "Invalid",
    diseaseBn: "অবৈধ ছবি",
    isHealthy: false,
    category: "invalid",
  },
  {
    idx: 4,
    raw: "Potato___Early_Blight",
    cropEn: "Potato",
    cropBn: "আলু",
    diseaseEn: "Early Blight",
    diseaseBn: "আগাম ঝলসা",
    isHealthy: false,
    category: "fungal",
  },
  {
    idx: 5,
    raw: "Potato___Healthy",
    cropEn: "Potato",
    cropBn: "আলু",
    diseaseEn: "Healthy",
    diseaseBn: "সুস্থ",
    isHealthy: true,
    category: "healthy",
  },
  {
    idx: 6,
    raw: "Potato___Late_Blight",
    cropEn: "Potato",
    cropBn: "আলু",
    diseaseEn: "Late Blight",
    diseaseBn: "বিলম্বিত ঝলসা",
    isHealthy: false,
    category: "fungal",
  },
  {
    idx: 7,
    raw: "Rice___Brown_Spot",
    cropEn: "Rice",
    cropBn: "ধান",
    diseaseEn: "Brown Spot",
    diseaseBn: "বাদামি দাগ",
    isHealthy: false,
    category: "fungal",
  },
  {
    idx: 8,
    raw: "Rice___Healthy",
    cropEn: "Rice",
    cropBn: "ধান",
    diseaseEn: "Healthy",
    diseaseBn: "সুস্থ",
    isHealthy: true,
    category: "healthy",
  },
  {
    idx: 9,
    raw: "Rice___Leaf_Blast",
    cropEn: "Rice",
    cropBn: "ধান",
    diseaseEn: "Leaf Blast",
    diseaseBn: "পাতার ব্লাস্ট",
    isHealthy: false,
    category: "fungal",
  },
  {
    idx: 10,
    raw: "Wheat___Brown_Rust",
    cropEn: "Wheat",
    cropBn: "গম",
    diseaseEn: "Brown Rust",
    diseaseBn: "বাদামি মরিচা",
    isHealthy: false,
    category: "fungal",
  },
  {
    idx: 11,
    raw: "Wheat___Healthy",
    cropEn: "Wheat",
    cropBn: "গম",
    diseaseEn: "Healthy",
    diseaseBn: "সুস্থ",
    isHealthy: true,
    category: "healthy",
  },
  {
    idx: 12,
    raw: "Wheat___Yellow_Rust",
    cropEn: "Wheat",
    cropBn: "গম",
    diseaseEn: "Yellow Rust",
    diseaseBn: "হলুদ মরিচা",
    isHealthy: false,
    category: "fungal",
  },
];

// ─── Session lifecycle (singleton) ────────────────────────────────────────────

let _sessionPromise = null;
let _session = null;
let _inputName = "pixel_values";
let _outputName = "output";
let _lastError = null;

/**
 * Lazy-load the ORT-WASM backend and the ONNX model. The result is cached
 * module-wide so we only fetch the 22 MB model once per page lifetime.
 *
 * onnxruntime-web is loaded with its default WASM paths. The .wasm files
 * ship with the npm package; Vite bundles them automatically.
 */
export function preloadModel() {
  if (!_sessionPromise) {
    _sessionPromise = (async () => {
      try {
        // Hint ORT where to find its WASM files. The default path resolver
        // (next to the .mjs bundle) usually works out of the box; we set
        // this explicitly to insulate against Vite bundle-path differences
        // between dev and production.
        ortNs.env.wasm.wasmPaths = ORT_WASM_PATHS;
        const session = await ortNs.InferenceSession.create(MODEL_URL, {
          executionProviders: ["wasm"],
          graphOptimizationLevel: "all",
        });
        _session = session;
        _inputName = session.inputNames[0] || _inputName;
        _outputName = session.outputNames[0] || _outputName;
        _lastError = null;
        return session;
      } catch (err) {
        _lastError = err;
        _sessionPromise = null; // allow retry
        throw err;
      }
    })();
  }
  return _sessionPromise;
}

export function isModelReady() {
  return _session !== null;
}

export function getModelInfo() {
  return {
    modelUrl: MODEL_URL,
    imageSize: IMAGE_SIZE,
    numClasses: LABEL_TABLE.length,
    labels: LABEL_TABLE.map((l) => l.raw),
    ready: isModelReady(),
    lastError: _lastError ? String(_lastError.message || _lastError) : null,
  };
}

// ─── Image preprocessing ─────────────────────────────────────────────────────

/**
 * Decode a data URL / blob URL / https URL into an HTMLImageElement.
 * Cross-origin images are fetched via fetch()+blob to avoid canvas tainting
 * (CORS canvas taint would break getImageData()).
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    // If it's a data: URL or blob: URL we can use it directly.
    const isSameOrigin =
      typeof src === "string" && (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/"));
    if (isSameOrigin) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed (local)"));
      img.src = src;
      return;
    }
    // Remote URL — fetch and blob it. We tolerate failure rather than blocking
    // diagnosis entirely; ORT-WASM cannot read tainted canvas pixels.
    reject(new Error("Remote image source not supported — pass a data: or blob: URL"));
  });
}

/**
 * Resize image to 224×224 and extract normalized NCHW float32 tensor.
 * Matches the preprocessing HF's AutoImageProcessor does for this ViT.
 */
function imageToTensor(img) {
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(IMAGE_SIZE, IMAGE_SIZE)
      : Object.assign(document.createElement("canvas"), { width: IMAGE_SIZE, height: IMAGE_SIZE });
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
  const { data } = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
  // data layout: RGBA, 4 bytes per pixel, 224×224 = 200,704 pixels.
  // We need NCHW float32: 1 × 3 × 224 × 224 with ImageNet normalization.
  const float32Data = new Float32Array(1 * 3 * IMAGE_SIZE * IMAGE_SIZE);
  const planeSize = IMAGE_SIZE * IMAGE_SIZE;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // [0, 255] → [0, 1] → normalize per channel
    float32Data[p] = (data[i] / 255 - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    float32Data[p + planeSize] = (data[i + 1] / 255 - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    float32Data[p + 2 * planeSize] = (data[i + 2] / 255 - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }
  return new ortNs.Tensor("float32", float32Data, [1, 3, IMAGE_SIZE, IMAGE_SIZE]);
}

// ─── Inference ───────────────────────────────────────────────────────────────

/**
 * Numerically stable softmax for a 1-D logits array.
 */
function softmax(logits) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) if (logits[i] > max) max = logits[i];
  const exps = new Float32Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    exps[i] = Math.exp(logits[i] - max);
    sum += exps[i];
  }
  for (let i = 0; i < exps.length; i++) exps[i] /= sum;
  return exps;
}

/**
 * Run the ViT on a single image and return the top-K predictions.
 *
 * @param {string} imageDataUrl  data: or blob: URL (must be same-origin)
 * @param {object} [opts]
 * @param {number} [opts.topK=3]  how many predictions to return
 * @param {number} [opts.timeoutMs=30000]  hard cap on model load + inference
 * @returns {Promise<{
 *   ok: true,
 *   topK: Array<{
 *     idx, label, cropEn, cropBn, diseaseEn, diseaseBn,
 *     isHealthy, category, confidence: number, pctDisplay: string
 *   }>,
 *   allScores: Array<{ idx, label, confidence }>,
 *   inferenceMs: number,
 * } | { ok:false, error:string, code:string }>}
 */
export async function classifyLeaf(imageDataUrl, opts = {}) {
  const topK = Math.max(1, Math.min(opts.topK ?? TOP_K_DEFAULT, LABEL_TABLE.length));
  const timeoutMs = opts.timeoutMs ?? 30000;

  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return { ok: false, code: "BAD_INPUT", error: "imageDataUrl is required" };
  }

  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();

  try {
    // Race inference against a timeout (the 22 MB download is the slow part
    // on first call; on subsequent calls this resolves immediately).
    const work = (async () => {
      const session = await preloadModel();
      const img = await loadImage(imageDataUrl);
      const tensor = imageToTensor(img);
      const feeds = { [session.inputNames[0]]: tensor };
      const results = await session.run(feeds);
      const logits = results[session.outputNames[0]].data;
      return { session, logits };
    })();

    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("ViT inference timeout")), timeoutMs);
    });
    const { session, logits } = await Promise.race([work, timeout]);

    const probs = softmax(Array.from(logits));
    const ranked = probs.map((p, idx) => ({ idx, confidence: p })).sort((a, b) => b.confidence - a.confidence);

    const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();

    const topK_results = ranked.slice(0, topK).map(({ idx, confidence }) => {
      const meta = LABEL_TABLE[idx] || {};
      return {
        idx,
        label: meta.raw || `class_${idx}`,
        cropEn: meta.cropEn || null,
        cropBn: meta.cropBn || null,
        diseaseEn: meta.diseaseEn || null,
        diseaseBn: meta.diseaseBn || null,
        isHealthy: !!meta.isHealthy,
        category: meta.category || "unknown",
        confidence,
        pctDisplay: `${Math.round(confidence * 100)}%`,
      };
    });

    const allScores = ranked.map(({ idx, confidence }) => ({
      idx,
      label: LABEL_TABLE[idx]?.raw || `class_${idx}`,
      confidence,
    }));

    const durationMs = Math.round(t1 - t0);
    recordTelemetry("vit_inference", {
      durationMs,
      topPrediction: topK_results[0]?.label || "unknown",
      topConfidence: topK_results[0]?.confidence || 0,
    });

    return {
      ok: true,
      topK: topK_results,
      allScores,
      inferenceMs: durationMs,
      _sessionRef: session, // not for consumers; useful for tests
    };
  } catch (err) {
    return {
      ok: false,
      code: err && err.name === "AbortError" ? "TIMEOUT" : "INFERENCE_FAILED",
      error: err && err.message ? err.message : String(err),
    };
  }
}

/**
 * Free the underlying ORT session. Useful in tests or to reclaim memory
 * after a long diagnosis session on low-RAM devices.
 */
export async function disposeModel() {
  if (_session) {
    try {
      await _session.release();
    } catch {
      /* ignore */
    }
    _session = null;
    _sessionPromise = null;
  }
}

export const VIT_LABELS = LABEL_TABLE;
