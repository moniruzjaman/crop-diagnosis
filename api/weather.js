/**
 * Weather Forecast API Endpoint
 *
 * Proxies Open-Meteo forecast + archive API to:
 *   - Avoid exposing API structure to client
 *   - Add caching headers
 *   - Combine current + forecast + historical in one call
 *
 * GET /api/weather?lat=23.685&lon=90.356
 */

import { handleCORSPreflight, setCORSHeaders } from './_lib/cors.js';

const BD_CENTER = { lat: 23.685, lon: 90.356 };
const CACHE_MAX_AGE = 600; // 10 minutes

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "GET, OPTIONS")) return;
  setCORSHeaders(req, res, "GET, OPTIONS");
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lat = parseFloat(req.query.lat) || BD_CENTER.lat;
  const lon = parseFloat(req.query.lon) || BD_CENTER.lon;

  // Validate coordinates (roughly Bangladesh bounds)
  if (lat < 20 || lat > 27 || lon < 88 || lon > 93) {
    return res.status(400).json({ error: 'Coordinates outside Bangladesh range' });
  }

  try {
    // Fetch 7-day forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,relative_humidity_2m_mean` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,uv_index` +
      `&timezone=Asia%2FDhaka&forecast_days=7`;

    const [forecastRes, historicalRes] = await Promise.allSettled([
      fetch(forecastUrl, { signal: AbortSignal.timeout(10000) }),
      fetchHistoricalData(lat, lon),
    ]);

    const result = {};

    if (forecastRes.status === 'fulfilled' && forecastRes.value.ok) {
      result.forecast = await forecastRes.value.json();
    }

    if (historicalRes.status === 'fulfilled' && historicalRes.value) {
      result.historical = historicalRes.value;
    }

    // Set cache headers
    res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);
    res.setHeader('X-Data-Source', 'open-meteo');

    return res.status(200).json(result);
  } catch (err) {
    console.error('Weather API error:', err.message);
    return res.status(502).json({ error: 'Weather data unavailable', detail: err.message });
  }
}

/**
 * Fetch 30-day historical data from Open-Meteo archive.
 */
async function fetchHistoricalData(lat, lon) {
  try {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() - 1);
    const start = new Date(today);
    start.setDate(start.getDate() - 30);

    const fmt = (d) => d.toISOString().split('T')[0];
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
      `&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean` +
      `&timezone=Asia%2FDhaka`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
