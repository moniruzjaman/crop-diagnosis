/**
 * Crop Prices API Endpoint
 *
 * Returns current crop price data for Bangladesh.
 * Uses deterministic simulation based on DAM/DAE reference prices.
 *
 * In production, this would proxy to:
 *   - DAM (Department of Agricultural Marketing) API
 *   - HCI (Hat Bazar) price service
 *   - BBS retail price data
 *
 * GET /api/crop-prices
 * GET /api/crop-prices?crop=ধান
 * GET /api/crop-prices?crop=ধান&district=dhaka
 * GET /api/crop-prices?compare=ধান,আলু
 * GET /api/crop-prices?mode=profitability
 * GET /api/crop-prices?mode=forecast&crop=ধান
 */

import { handleCORSPreflight, setCORSHeaders } from './_lib/cors.js';

// ─── Inline price engine (server-side, same logic as client) ──────────────────

const BASELINE_PRICES = {
  'ধান':   { peak: 32, off: 42, average: 36, seasonMultipliers: { 'বোরো': 0.85, 'আমন': 0.90, 'আউশ': 0.88 }, priceVolatility: 'low', minSupportPrice: 30 },
  'পাট':   { peak: 45, off: 65, average: 52, seasonMultipliers: { 'খরিপ-১': 0.80, 'খরিপ-২': 0.85 }, priceVolatility: 'medium', minSupportPrice: null },
  'আলু':   { peak: 15, off: 35, average: 22, seasonMultipliers: { 'রবি': 0.65 }, priceVolatility: 'high', minSupportPrice: null },
  'টমেটো': { peak: 20, off: 60, average: 35, seasonMultipliers: { 'রবি': 0.55, 'খরিপ-১': 1.4 }, priceVolatility: 'very_high', minSupportPrice: null },
  'বেগুন': { peak: 25, off: 50, average: 35, seasonMultipliers: { 'রবি': 0.75, 'খরিপ-১': 1.15 }, priceVolatility: 'medium', minSupportPrice: null },
  'সরিষা': { peak: 80, off: 120, average: 95, seasonMultipliers: { 'রবি': 0.80 }, priceVolatility: 'medium', minSupportPrice: null },
  'কলা':   { peak: 40, off: 70, average: 50, seasonMultipliers: { 'সারা বছর': 1.0 }, priceVolatility: 'low', minSupportPrice: null },
  'আম':    { peak: 50, off: 150, average: 70, seasonMultipliers: { 'খরিপ-১': 0.60 }, priceVolatility: 'very_high', minSupportPrice: null },
  'গম':    { peak: 38, off: 48, average: 42, seasonMultipliers: { 'রবি': 0.88 }, priceVolatility: 'low', minSupportPrice: 37 },
  'ভুট্টা': { peak: 22, off: 35, average: 28, seasonMultipliers: { 'রবি': 0.80, 'খরিপ-১': 1.1 }, priceVolatility: 'medium', minSupportPrice: null },
  'পেঁয়াজ': { peak: 25, off: 80, average: 45, seasonMultipliers: { 'রবি': 0.50, 'খরিপ-১': 1.6 }, priceVolatility: 'very_high', minSupportPrice: null },
  'রসুন':   { peak: 80, off: 180, average: 120, seasonMultipliers: { 'রবি': 0.65, 'খরিপ-১': 1.3 }, priceVolatility: 'high', minSupportPrice: null },
  'মরিচ':   { peak: 60, off: 200, average: 120, seasonMultipliers: { 'রবি': 0.50, 'খরিপ-১': 1.5 }, priceVolatility: 'very_high', minSupportPrice: null },
  'মসুর ডাল': { peak: 85, off: 130, average: 105, seasonMultipliers: { 'রবি': 0.82 }, priceVolatility: 'medium', minSupportPrice: null },
  'আখ':     { peak: 150, off: 250, average: 190, seasonMultipliers: { 'খরিপ-১': 0.75, 'খরিপ-২': 0.85 }, priceVolatility: 'medium', minSupportPrice: null },
};

const PRODUCTION_DATA = {
  'ধান':   { costPerBigha: 8000, yieldKgPerBigha: 800, nameEn: 'Rice' },
  'পাট':   { costPerBigha: 6000, yieldKgPerBigha: 500, nameEn: 'Jute' },
  'আলু':   { costPerBigha: 15000, yieldKgPerBigha: 4000, nameEn: 'Potato' },
  'টমেটো': { costPerBigha: 12000, yieldKgPerBigha: 3000, nameEn: 'Tomato' },
  'বেগুন': { costPerBigha: 10000, yieldKgPerBigha: 2500, nameEn: 'Brinjal' },
  'সরিষা': { costPerBigha: 5000, yieldKgPerBigha: 400, nameEn: 'Mustard' },
  'কলা':   { costPerBigha: 12000, yieldKgPerBigha: 600, nameEn: 'Banana' },
  'আম':    { costPerBigha: 5000, yieldKgPerBigha: 2000, nameEn: 'Mango' },
  'গম':    { costPerBigha: 6000, yieldKgPerBigha: 600, nameEn: 'Wheat' },
  'ভুট্টা': { costPerBigha: 10000, yieldKgPerBigha: 1500, nameEn: 'Maize' },
  'পেঁয়াজ': { costPerBigha: 18000, yieldKgPerBigha: 2500, nameEn: 'Onion' },
  'রসুন':   { costPerBigha: 20000, yieldKgPerBigha: 1200, nameEn: 'Garlic' },
  'মরিচ':   { costPerBigha: 15000, yieldKgPerBigha: 800, nameEn: 'Chili' },
  'মসুর ডাল': { costPerBigha: 7000, yieldKgPerBigha: 300, nameEn: 'Lentil' },
  'আখ':     { costPerBigha: 25000, yieldKgPerBigha: 8000, nameEn: 'Sugarcane' },
};

// District price adjustment factors (subset of 64 districts)
const DISTRICT_ADJUSTMENTS = {
  dhaka: 1.05, chittagong: 1.06, rajshahi: 0.97, khulna: 1.02, sylhet: 1.07,
  rangpur: 0.96, barisal: 1.02, mymensingh: 0.98, coxsbazar: 1.08, dinajpur: 0.95,
  bogra: 0.98, jessore: 1.00, comilla: 1.01, tangail: 0.97, gazipur: 1.03,
  narayanganj: 1.04, faridpur: 0.98, pabna: 0.96, kushtia: 0.97, rangamati: 1.10,
};

function simulatePrice(crop, month, districtId) {
  const baseline = BASELINE_PRICES[crop];
  if (!baseline) return null;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const hash = ((dayOfYear * 2654435761) >>> 0) % 1000;
  const variation = (hash / 1000 - 0.5) * 0.20;
  const avg = baseline.average;
  let currentPrice = Math.round(avg * (1 + variation) * 100) / 100;

  // Apply district price adjustment
  const districtAdjust = districtId ? (DISTRICT_ADJUSTMENTS[districtId] || 1.0) : 1.0;
  currentPrice = Math.round(currentPrice * districtAdjust * 100) / 100;

  const lastWeekHash = ((((dayOfYear - 7) * 2654435761) >>> 0) % 1000);
  const lastWeekVariation = (lastWeekHash / 1000 - 0.5) * 0.20;
  const lastWeekPrice = Math.round(avg * (1 + lastWeekVariation) * districtAdjust * 100) / 100;

  const change = currentPrice - lastWeekPrice;
  const changePct = Math.round((change / lastWeekPrice) * 1000) / 10;
  const trend = changePct > 3 ? 'up' : changePct < -3 ? 'down' : 'stable';

  return {
    crop,
    price: currentPrice,
    previousWeekPrice: lastWeekPrice,
    priceChange: Math.round(change * 100) / 100,
    priceChangePercent: changePct,
    trend,
    volatility: baseline.priceVolatility,
    range: { low: baseline.peak, high: baseline.off, average: baseline.average },
    msp: baseline.minSupportPrice,
    district: districtId || null,
    districtAdjustFactor: districtAdjust,
  };
}

export default async function handler(req, res) {
  if (handleCORSPreflight(req, res, "GET, OPTIONS")) return;
  setCORSHeaders(req, res, "GET, OPTIONS");
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const month = new Date().getMonth() + 1;
  const { crop, compare, mode, district } = req.query;

  try {
    // Price forecast mode
    if (mode === 'forecast' && crop) {
      const priceData = simulatePrice(crop, month, district);
      if (!priceData) return res.status(404).json({ error: `No price data for "${crop}"` });

      const basePrice = priceData.price;
      const dailyTrend = priceData.trend === 'up' ? 0.001 :
                         priceData.trend === 'down' ? -0.001 : 0;

      const predictions = [];
      for (let d = 0; d < 30; d++) {
        const drift = dailyTrend * d;
        const noise = (Math.sin(d * 17.3 + crop.charCodeAt(0)) * 0.5) / 100;
        const predictedPrice = basePrice * (1 + drift + noise);
        const confidence = d < 7 ? 'high' : d < 14 ? 'medium' : 'low';

        predictions.push({
          day: d + 1,
          date: new Date(Date.now() + d * 86400000).toISOString().split('T')[0],
          price: Math.round(predictedPrice * 100) / 100,
          confidence,
        });
      }

      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 min cache
      return res.status(200).json({
        crop,
        district: district || null,
        forecast: predictions,
        source: 'DAM/DAE Reference (Simulated)',
      });
    }

    // Single crop price
    if (crop) {
      const price = simulatePrice(crop, month, district);
      if (!price) return res.status(404).json({ error: `No price data for "${crop}"` });

      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json(price);
    }

    // Compare specific crops
    if (compare) {
      const crops = compare.split(',').map(c => c.trim()).filter(Boolean);
      const prices = crops.map(c => simulatePrice(c, month, district)).filter(Boolean);

      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ comparison: prices, month, district: district || null });
    }

    // Profitability mode
    if (mode === 'profitability') {
      const results = Object.entries(PRODUCTION_DATA).map(([crop, data]) => {
        const priceData = simulatePrice(crop, month, district);
        if (!priceData) return null;

        const grossRevenue = priceData.price * data.yieldKgPerBigha;
        const netProfit = grossRevenue - data.costPerBigha;
        const roi = Math.round((netProfit / data.costPerBigha) * 100);

        return {
          crop,
          nameEn: data.nameEn,
          price: priceData.price,
          costPerBigha: data.costPerBigha,
          yieldKgPerBigha: data.yieldKgPerBigha,
          grossRevenue: Math.round(grossRevenue),
          netProfit: Math.round(netProfit),
          roi,
          trend: priceData.trend,
        };
      }).filter(Boolean).sort((a, b) => b.roi - a.roi);

      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ profitability: results, month, district: district || null });
    }

    // Default: all crop prices
    const allPrices = Object.keys(BASELINE_PRICES).map(c => simulatePrice(c, month, district)).filter(Boolean);

    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({
      prices: allPrices,
      month,
      district: district || null,
      source: 'DAM/DAE Reference (Simulated)',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('Crop prices API error:', err.message);
    return res.status(500).json({ error: 'Price data unavailable' });
  }
}
