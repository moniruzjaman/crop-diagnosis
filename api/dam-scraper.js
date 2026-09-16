/**
 * DAM (Department of Agricultural Marketing) Scraper API
 *
 * Scrapes live commodity prices from market.dam.gov.bd.
 * The DAM site is a CodeIgniter PHP app with CSRF-protected endpoints.
 *
 * GET /api/dam-scraper?mode=divisions
 * GET /api/dam-scraper?mode=districts&division_id=1
 * GET /api/dam-scraper?mode=subdistricts&district_id=1&district_name=Dhaka
 * GET /api/dam-scraper?mode=ticker
 * GET /api/dam-scraper?mode=commodities
 * GET /api/dam-scraper?mode=prices&commodity_id=602&price_type=4&year=2025
 */

import { handleCORSPreflight, setCORSHeaders } from './_lib/cors.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAM_BASE = 'https://market.dam.gov.bd';
const CACHE_MAX_AGE = 1800; // 30 minutes

const DAM_COMMODITIES = {
  rice: { id: 190, sub: [{ id: 601, name: 'Aman-Super-Fine' }, { id: 602, name: 'Aman-Fine' }, { id: 603, name: 'Aman-Medium' }, { id: 604, name: 'Boro-Super-Fine' }, { id: 605, name: 'Boro-Fine' }, { id: 606, name: 'Boro-Medium' }, { id: 607, name: 'Miniket' }, { id: 608, name: 'Nazirshail' }] },
  wheat: { id: 191, sub: [{ id: 610, name: 'Wheat' }] },
  potato: { id: 193, sub: [{ id: 613, name: 'Potato-Local' }, { id: 614, name: 'Potato-Diamond' }] },
  onion: { id: 621, sub: [{ id: 621, name: 'Onion-Local' }, { id: 622, name: 'Onion-Imported' }] },
  garlic: { id: 623, sub: [{ id: 623, name: 'Garlic-Local' }, { id: 624, name: 'Garlic-Imported' }] },
  chili: { id: 625, sub: [{ id: 625, name: 'Chili-Dry' }, { id: 626, name: 'Chili-Green' }] },
  mustard_oil: { id: 627, sub: [{ id: 627, name: 'Mustard-Oil' }] },
  lentil: { id: 195, sub: [{ id: 617, name: 'Musur-Dal' }] },
  tomato: { id: 196, sub: [{ id: 618, name: 'Tomato' }] },
  brinjal: { id: 197, sub: [{ id: 619, name: 'Brinjal' }] },
  jute: { id: 198, sub: [{ id: 620, name: 'Jute' }] },
};

const UA = 'Mozilla/5.0 (compatible; CABI-Diagnosis/4.0)';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip UTF-8 BOM if present, then parse JSON.
 */
function safeParseJSON(text) {
  const cleaned = text.replace(/^\ufeff/, '');
  return JSON.parse(cleaned);
}

/**
 * Parse HTML <option value="ID|Name">Name</option> entries
 * into [{ id, name }] array.
 */
function parseHtmlOptions(html) {
  const results = [];
  const regex = /<option\s+value="([^"]+)"\s*>([^<]*)<\/option>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const rawValue = match[1];
    const label = match[2].trim();
    // Handle pipe-delimited values like "1|Dhaka"
    const pipeIdx = rawValue.indexOf('|');
    if (pipeIdx !== -1) {
      const id = rawValue.substring(0, pipeIdx);
      const name = rawValue.substring(pipeIdx + 1);
      results.push({ id, name, label });
    } else {
      results.push({ id: rawValue, name: label, label });
    }
  }
  return results;
}

/**
 * Fetch CSRF token from the DAM homepage.
 */
async function getCsrfToken() {
  try {
    const res = await fetch(`${DAM_BASE}/?L=E`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const match = html.match(/name="csrf_webspice_tkn"\s+value="([^"]+)"/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
}

/**
 * Make a POST request to a DAM endpoint with CSRF token.
 */
async function damPost(endpoint, bodyParams, csrfToken) {
  const params = new URLSearchParams({ ...bodyParams, csrf_webspice_tkn: csrfToken || '' });
  const res = await fetch(`${DAM_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': `${DAM_BASE}/?L=E`,
    },
    body: params.toString(),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  return safeParseJSON(text);
}

/**
 * Build a graceful fallback response when DAM is unreachable.
 */
function fallbackResponse(error) {
  return {
    source: 'unavailable',
    error: 'DAM server unreachable',
    fallback: true,
    detail: error instanceof Error ? error.message : String(error),
  };
}

/**
 * Parse the homepage price ticker HTML.
 * Looks for commodity price entries in the DAM homepage markup.
 */
function parseTicker(html) {
  const prices = [];

  // The DAM homepage ticker typically has structures like:
  // <div class="item">Commodity Name ৳XX-৳YY  ▲/▼ N%</div>
  // or table rows with commodity, price range, and change
  // We try multiple patterns to be resilient to site changes.

  // Pattern 1: ticker items with commodity name and price info
  const tickerRegex = /<div[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = tickerRegex.exec(html)) !== null) {
    const content = match[1].replace(/<[^>]+>/g, ' ').trim();
    if (!content || content.length < 3) continue;

    // Try to extract price-like numbers
    const priceMatch = content.match(/([\d,.]+)\s*[-–]\s*([\d,.]+)/);
    const changeMatch = content.match(/[▲▼↑↓]\s*([\d.]+)%?/);

    if (priceMatch) {
      const namePart = content.split(/[\d]/)[0].trim();
      if (namePart) {
        prices.push({
          commodity: namePart,
          priceLow: priceMatch[1].replace(/,/g, ''),
          priceHigh: priceMatch[2].replace(/,/g, ''),
          change: changeMatch ? changeMatch[1] : null,
          changeDirection: content.includes('▲') || content.includes('↑') ? 'up' :
                           content.includes('▼') || content.includes('↓') ? 'down' : 'stable',
        });
      }
    }
  }

  // Pattern 2: table-based price display
  if (prices.length === 0) {
    const tableRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    while ((match = tableRowRegex.exec(html)) !== null) {
      const row = match[1];
      const cells = [];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      if (cells.length >= 2) {
        const priceMatch = cells.find(c => /[\d,.]+/.test(c));
        if (priceMatch && cells[0]) {
          prices.push({
            commodity: cells[0],
            rawCells: cells,
          });
        }
      }
    }
  }

  // Pattern 3: broad scan for commodity-price pairs in text content
  if (prices.length === 0) {
    // Strip tags and look for known commodity names with nearby prices
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const commodityNames = Object.values(DAM_COMMODITIES).flatMap(c =>
      c.sub.map(s => s.name.replace(/-/g, ' '))
    );

    for (const name of commodityNames) {
      const idx = text.toLowerCase().indexOf(name.toLowerCase());
      if (idx !== -1) {
        const context = text.substring(idx, idx + 100);
        const priceMatch = context.match(/([\d,.]+)\s*[-–]\s*([\d,.]+)/);
        if (priceMatch) {
          prices.push({
            commodity: name,
            priceLow: priceMatch[1].replace(/,/g, ''),
            priceHigh: priceMatch[2].replace(/,/g, ''),
          });
        }
      }
    }
  }

  return prices;
}

// ─── Mode handlers ────────────────────────────────────────────────────────────

/**
 * Fetch all 7 divisions from DAM.
 */
async function handleDivisions() {
  try {
    const res = await fetch(`${DAM_BASE}/get_division_list_eng`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    const divisions = parseHtmlOptions(html);

    if (divisions.length === 0) {
      return { source: 'dam', divisions: [], warning: 'No divisions parsed from HTML' };
    }
    return { source: 'dam', divisions };
  } catch (err) {
    return fallbackResponse(err);
  }
}

/**
 * Fetch districts for a given division.
 */
async function handleDistricts(divisionId) {
  try {
    const csrf = await getCsrfToken();
    const data = await damPost('get_district_by_division', { division_id: String(divisionId) }, csrf);
    return { source: 'dam', division_id: divisionId, districts: data };
  } catch (err) {
    return fallbackResponse(err);
  }
}

/**
 * Fetch subdistricts for a given district.
 */
async function handleSubdistricts(districtId, districtName) {
  try {
    const csrf = await getCsrfToken();
    const param = `${districtId}|${districtName || ''}`;
    const data = await damPost('get_subdistrict_by_district', { 'district_id[]': param }, csrf);
    return { source: 'dam', district_id: districtId, district_name: districtName, subdistricts: data };
  } catch (err) {
    return fallbackResponse(err);
  }
}

/**
 * Scrape the homepage price ticker for current national prices.
 */
async function handleTicker() {
  try {
    const res = await fetch(`${DAM_BASE}/?L=E`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    const prices = parseTicker(html);

    return {
      source: prices.length > 0 ? 'dam' : 'dam-empty',
      prices,
      count: prices.length,
      scrapedAt: new Date().toISOString(),
    };
  } catch (err) {
    return fallbackResponse(err);
  }
}

/**
 * Return the hardcoded commodity list.
 */
function handleCommodities() {
  return {
    source: 'hardcoded',
    commodities: DAM_COMMODITIES,
    count: Object.keys(DAM_COMMODITIES).length,
  };
}

/**
 * Fetch graphical price report for a specific commodity.
 */
async function handlePrices(commodityId, priceType, year) {
  try {
    const csrf = await getCsrfToken();
    const data = await damPost('price_graphical_report', {
      Commodity_id: String(commodityId),
      PriceType_id: String(priceType || 4),
      year: String(year || new Date().getFullYear()),
    }, csrf);

    return {
      source: 'dam',
      commodity_id: commodityId,
      price_type: priceType || 4,
      year: year || new Date().getFullYear(),
      prices: data,
    };
  } catch (err) {
    return fallbackResponse(err);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, 'GET, OPTIONS')) return;
  setCORSHeaders(req, res, 'GET, OPTIONS');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, division_id, district_id, district_name, commodity_id, price_type, year } = req.query;

  try {
    let result;

    switch (mode) {
      case 'divisions':
        result = await handleDivisions();
        break;

      case 'districts': {
        if (!division_id) {
          return res.status(400).json({ error: 'Missing required param: division_id' });
        }
        result = await handleDistricts(division_id);
        break;
      }

      case 'subdistricts': {
        if (!district_id) {
          return res.status(400).json({ error: 'Missing required param: district_id' });
        }
        result = await handleSubdistricts(district_id, district_name || '');
        break;
      }

      case 'ticker':
        result = await handleTicker();
        break;

      case 'commodities':
        result = handleCommodities();
        break;

      case 'prices': {
        if (!commodity_id) {
          return res.status(400).json({ error: 'Missing required param: commodity_id' });
        }
        result = await handlePrices(commodity_id, price_type, year);
        break;
      }

      default:
        return res.status(400).json({
          error: 'Invalid or missing mode parameter',
          validModes: ['divisions', 'districts', 'subdistricts', 'ticker', 'commodities', 'prices'],
        });
    }

    // Set cache header for successful responses
    if (result.source !== 'unavailable') {
      res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('DAM scraper API error:', err.message);
    // Always return valid JSON, never throw
    return res.status(200).json(fallbackResponse(err));
  }
}
