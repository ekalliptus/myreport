import Papa from 'papaparse';

const SHEET_ID = '1ILpXCrKUqAqquoR_kJei8stZ8d8yGUJxwu5kC3ZQaHI';
const SHEET_GID = '1632724274';

const csvUrl = (sheetId = SHEET_ID, gid = SHEET_GID) => `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
const gvizUrl = (sheetId = SHEET_ID, gid = SHEET_GID, query = '') => `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}&tqx=out:json${query ? `&tq=${encodeURIComponent(query)}` : ''}`;

let cache = { timestamp: 0, data: null };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchSheetData(options = {}) {
  const { sheetId = SHEET_ID, gid = SHEET_GID, prefer = 'csv', query = '' } = options;
  // Use cache if fresh
  if (cache.data && (Date.now() - cache.timestamp) < CACHE_TTL_MS) {
    return cache.data;
  }
  let raw = null;
  let records = [];
  if (prefer === 'csv') {
    try {
      raw = await fetchCSV(sheetId, gid);
      records = normalizeCSV(raw);
    } catch (e) {
      console.warn('CSV fetch failed, falling back to GViz:', e);
      const table = await fetchGViz(sheetId, gid, query);
      records = normalizeGViz(table);
      raw = table;
    }
  } else {
    try {
      const table = await fetchGViz(sheetId, gid, query);
      records = normalizeGViz(table);
      raw = table;
    } catch (e) {
      console.warn('GViz fetch failed, falling back to CSV:', e);
      raw = await fetchCSV(sheetId, gid);
      records = normalizeCSV(raw);
    }
  }
  const normalized = normalizeForPresentation(records);
  const byMonth = aggregateByMonth(normalized);
  const byCategory = aggregateByCategory(normalized);
  const summary = buildSummary(normalized, byMonth);
  const result = { raw, records, normalized, byMonth, byCategory, summary, sheetId, gid };
  cache = { timestamp: Date.now(), data: result };
  return result;
}

async function fetchCSV(sheetId, gid) {
  const url = csvUrl(sheetId, gid);
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) {
    throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: 'greedy' });
  if (parsed.errors && parsed.errors.length) {
    console.warn('PapaParse errors:', parsed.errors);
  }
  return parsed.data;
}

async function fetchGViz(sheetId, gid, query) {
  const url = gvizUrl(sheetId, gid, query);
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) {
    throw new Error(`GViz fetch failed: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  const json = stripGViz(text);
  const obj = JSON.parse(json);
  if (!obj.table) {
    throw new Error('GViz response missing table');
  }
  return obj.table;
}

function stripGViz(text) {
  // GViz wraps JSON in google.visualization.Query.setResponse(...);
  const start = text.indexOf('(');
  const end = text.lastIndexOf(')');
  if (start === -1 || end === -1) {
    throw new Error('Unexpected GViz payload');
  }
  const json = text.slice(start + 1, end);
  return json;
}

function normalizeCSV(rows) {
  return rows.filter(r => r && Object.keys(r).length > 0).map(r => {
    const out = {};
    Object.entries(r).forEach(([k, v]) => {
      const key = String(k).trim();
      out[key] = v;
    });
    return out;
  });
}

function normalizeGViz(table) {
  const cols = (table.cols || []).map(c => c.label || c.id || '');
  const rows = table.rows || [];
  return rows.map(row => {
    const obj = {};
    (row.c || []).forEach((cell, i) => {
      const key = cols[i] || `C${i}`;
      obj[key] = gvizCellValue(cell);
    });
    return obj;
  });
}

function gvizCellValue(cell) {
  if (!cell) return null;
  // Prefer formatted if present
  const v = cell.v ?? null;
  const f = cell.f ?? null;
  if (typeof v === 'string') {
    // Detect Date(YYYY,MM,DD)
    const m = v.match(/^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)$/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]), Number(m[3]));
    }
    return v;
  }
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'label' in v) return v.label;
  // formatted date string
  if (f && typeof f === 'string') {
    const d = new Date(f);
    if (!isNaN(d)) return d;
    return f;
  }
  return v;
}

function normalizeForPresentation(records) {
  const dateKey = pickColumn(records, ['Date', 'Tanggal', 'Tgl']);
  const categoryKey = pickColumn(records, ['Category', 'Kategori', 'Ktg']);
  const valueKey = pickColumn(records, ['Amount', 'Jumlah', 'Total', 'Nilai', 'Value']);
  return records.map(r => {
    const dateRaw = r[dateKey];
    const categoryRaw = r[categoryKey];
    const valueRaw = r[valueKey];
    const date = coerceDate(dateRaw);
    const category = categoryRaw != null ? String(categoryRaw) : 'Unknown';
    const value = coerceNumber(valueRaw);
    return { date, category, value, raw: r };
  }).filter(x => x.date instanceof Date && !isNaN(x.date) && typeof x.value === 'number');
}

function pickColumn(records, candidates) {
  if (!records.length) return candidates[0];
  const keys = Object.keys(records[0] || {}).map(k => k.toLowerCase());
  const found = candidates.map(c => c.toLowerCase()).find(c => keys.includes(c));
  if (found) {
    const idx = keys.indexOf(found);
    return Object.keys(records[0])[idx];
  }
  // try partial includes
  for (const c of candidates) {
    const lc = c.toLowerCase();
    const match = Object.keys(records[0]).find(k => k.toLowerCase().includes(lc));
    if (match) return match;
  }
  // fallback to first numeric or date-like column
  const sample = records[0];
  const numericKey = Object.keys(sample).find(k => typeof sample[k] === 'number');
  if (numericKey) return numericKey;
  return Object.keys(sample)[0];
}

function coerceDate(val) {
  if (val instanceof Date) return val;
  if (typeof val === 'string') {
    // handle dd/mm/yyyy and yyyy-mm-dd
    const iso = new Date(val);
    if (!isNaN(iso)) return iso;
    const m = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      const d = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const y = Number(m[3]);
      return new Date(y < 100 ? 2000 + y : y, mo, d);
    }
  }
  if (typeof val === 'number') {
    // Google Sheets serial number (days since 1899-12-30)
    const base = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(base.getTime() + val * 24 * 60 * 60 * 1000);
    return d;
  }
  return new Date(NaN);
}

function coerceNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9,\.\-]/g, '').replace(',', '.');
    const num = Number(cleaned);
    if (!isNaN(num)) return num;
  }
  return 0;
}

function monthKey(d) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}

function aggregateByMonth(items) {
  const map = new Map();
  for (const it of items) {
    const key = monthKey(it.date);
    const prev = map.get(key) || 0;
    map.set(key, prev + it.value);
  }
  return Array.from(map.entries()).map(([month, total]) => ({ month, total }));
}

function aggregateByCategory(items) {
  const map = new Map();
  for (const it of items) {
    const key = it.category || 'Unknown';
    const prev = map.get(key) || 0;
    map.set(key, prev + it.value);
  }
  return Array.from(map.entries()).map(([category, total]) => ({ category, total }));
}

function buildSummary(items, byMonth) {
  const total = items.reduce((a, b) => a + b.value, 0);
  const latest = byMonth.slice().sort((a, b) => a.month.localeCompare(b.month)).pop();
  const prevMonthEntry = byMonth.slice().sort((a, b) => a.month.localeCompare(b.month)).slice(-2, -1)[0];
  const currentMonthTotal = latest ? latest.total : 0;
  const previousMonthTotal = prevMonthEntry ? prevMonthEntry.total : 0;
  const monthChange = previousMonthTotal ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) : null;
  return {
    total,
    currentMonthTotal,
    previousMonthTotal,
    monthChange,
    itemCount: items.length,
  };
}

export function formatIDCurrency(value) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
  } catch {
    return String(value ?? 0);
  }
}

export const SHEETS_CONFIG = { SHEET_ID, SHEET_GID, csvUrl, gvizUrl };

// Helper to extract sheetId and gid from a full Google Sheets URL
export function parseSheetsUrl(url) {
  try {
    const u = new URL(url);
    const idMatch = u.pathname.match(/\/spreadsheets\/d\/([^\/]+)/);
    const sheetId = idMatch ? idMatch[1] : SHEET_ID;
    const gid = u.searchParams.get('gid') || SHEET_GID;
    return { sheetId, gid };
  } catch {
    return { sheetId: SHEET_ID, gid: SHEET_GID };
  }
}