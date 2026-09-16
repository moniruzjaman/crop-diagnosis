// Offline bundles loader for merged image indexes
import localforage from "localforage";

const OFFLINE_MANIFEST = "/offline-sources/manifest.json";
const OFFLINE_STORE_KEY = "offline_image_bundles_v1";

// Loads manifest and all listed bundle index.json files. Returns a flat array
// of normalized entries. Does not attempt to download images themselves.
export async function loadOfflineBundles(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = await localforage.getItem(OFFLINE_STORE_KEY);
    if (cached) return cached;
  }

  let manifest = null;
  try {
    const res = await fetch(OFFLINE_MANIFEST, { cache: "no-cache" });
    manifest = res.ok ? await res.json() : { bundles: [] };
  } catch (e) {
    console.warn("[offlineLoader] failed to fetch manifest", e.message);
    manifest = { bundles: [] };
  }

  const entries = [];
  for (const bundle of manifest.bundles || []) {
    const idxPath = bundle.indexPath || `${bundle.path}/index.json`;
    try {
      const r = await fetch(idxPath, { cache: "no-cache" });
      if (!r.ok) {
        console.warn("[offlineLoader] bundle index not found", idxPath);
        continue;
      }
      const arr = await r.json();
      for (const e of arr) {
        entries.push({
          id: e.id || `${bundle.name}:${e.image || e.url}`,
          page: e.page || null,
          image: e.image || null,
          url: e.url || (bundle.path ? `${bundle.path}/${e.image}` : null),
          category: e.category || null,
          textPreview: (e.textPreview || "").replace(/\s+/g, " ").trim(),
          keywords: (e.keywords || []).join(" ").toLowerCase(),
          source: bundle.name || e.source || "offline-bundle",
          license: e.license || bundle.license || null,
          tags: e.tags || [],
        });
      }
    } catch (err) {
      console.warn("[offlineLoader] failed to load bundle", bundle.name, err.message);
    }
  }

  await localforage.setItem(OFFLINE_STORE_KEY, entries);
  return entries;
}
