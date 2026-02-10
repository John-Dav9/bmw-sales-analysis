/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function toNumber(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  loadEnv();

  const dbHostRaw = process.env.DB_HOST || 'localhost';
  let server = dbHostRaw;
  let instanceName;
  if (dbHostRaw.includes('\\')) {
    const parts = dbHostRaw.split('\\');
    server = parts[0];
    instanceName = parts[1];
  }

  const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASS || '',
    server,
    port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_NAME || 'AutoSales',
    options: {
      encrypt: String(process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
      trustServerCertificate: String(process.env.DB_TRUST_CERT || 'true').toLowerCase() === 'true',
    },
  };
  if (instanceName) config.options.instanceName = instanceName;

  const csvPath = path.join(__dirname, '..', '..', '..', 'data', 'BMW sales data (2010-2024).csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }

  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
  const header = parseCsvLine(lines[0]);
  const idx = (name) => header.indexOf(name);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    rows.push({
      model: cols[idx('Model')] || null,
      year: toNumber(cols[idx('Year')]),
      region: cols[idx('Region')] || null,
      color: cols[idx('Color')] || null,
      fuel_type: cols[idx('Fuel_Type')] || null,
      transmission: cols[idx('Transmission')] || null,
      engine_size_l: toNumber(cols[idx('Engine_Size_L')]),
      mileage_km: toNumber(cols[idx('Mileage_KM')]),
      price_usd: toNumber(cols[idx('Price_USD')]),
      sales_volume: toNumber(cols[idx('Sales_Volume')]),
      sales_classification: cols[idx('Sales_Classification')] || null,
    });
  }

  const years = new Set();
  const models = new Map();
  const regions = new Set();
  const colors = new Set();

  for (const r of rows) {
    if (r.year != null) years.add(r.year);
    if (r.model) {
      if (!models.has(r.model)) {
        models.set(r.model, {
          make: 'BMW',
          model: r.model,
          fuel_type: r.fuel_type,
          transmission: r.transmission,
          engine_size_l: r.engine_size_l,
        });
      }
    }
    if (r.region) regions.add(r.region);
    if (r.color) colors.add(r.color);
  }

  const pool = await sql.connect(config);
  try {
    await pool.request().query(`
      DELETE FROM fact_sales;
      DELETE FROM fact_listings;
      DELETE FROM dim_model;
      DELETE FROM dim_region;
      DELETE FROM dim_color;
      DELETE FROM dim_year;
    `);

    if (years.size > 0) {
      const t = new sql.Table('dim_year');
      t.create = false;
      t.columns.add('year_key', sql.Int, { nullable: false });
      t.columns.add('year', sql.Int, { nullable: false });
      for (const y of years) t.rows.add(y, y);
      await pool.request().bulk(t);
    }

    if (regions.size > 0) {
      const t = new sql.Table('dim_region');
      t.create = false;
      t.columns.add('region', sql.NVarChar(100), { nullable: false });
      for (const r of regions) t.rows.add(r);
      await pool.request().bulk(t);
    }

    if (colors.size > 0) {
      const t = new sql.Table('dim_color');
      t.create = false;
      t.columns.add('color', sql.NVarChar(50), { nullable: false });
      for (const c of colors) t.rows.add(c);
      await pool.request().bulk(t);
    }

    if (models.size > 0) {
      const t = new sql.Table('dim_model');
      t.create = false;
      t.columns.add('make', sql.NVarChar(50), { nullable: false });
      t.columns.add('model', sql.NVarChar(100), { nullable: false });
      t.columns.add('fuel_type', sql.NVarChar(30), { nullable: true });
      t.columns.add('transmission', sql.NVarChar(30), { nullable: true });
      t.columns.add('engine_size_l', sql.Decimal(4, 2), { nullable: true });
      for (const m of models.values()) {
        t.rows.add(m.make, m.model, m.fuel_type, m.transmission, m.engine_size_l);
      }
      await pool.request().bulk(t);
    }

    const modelRows = await pool.request().query('SELECT model_key, model FROM dim_model');
    const regionRows = await pool.request().query('SELECT region_key, region FROM dim_region');
    const colorRows = await pool.request().query('SELECT color_key, color FROM dim_color');

    const modelMap = new Map(modelRows.recordset.map((r) => [r.model, r.model_key]));
    const regionMap = new Map(regionRows.recordset.map((r) => [r.region, r.region_key]));
    const colorMap = new Map(colorRows.recordset.map((r) => [r.color, r.color_key]));

    if (rows.length > 0) {
      const t = new sql.Table('fact_sales');
      t.create = false;
      t.columns.add('year_key', sql.Int, { nullable: false });
      t.columns.add('model_key', sql.Int, { nullable: false });
      t.columns.add('region_key', sql.Int, { nullable: true });
      t.columns.add('color_key', sql.Int, { nullable: true });
      t.columns.add('fuel_type', sql.NVarChar(30), { nullable: true });
      t.columns.add('transmission', sql.NVarChar(30), { nullable: true });
      t.columns.add('engine_size_l', sql.Decimal(4, 2), { nullable: true });
      t.columns.add('mileage_km', sql.Int, { nullable: true });
      t.columns.add('price_usd', sql.Decimal(18, 2), { nullable: true });
      t.columns.add('sales_volume', sql.Int, { nullable: true });
      t.columns.add('sales_classification', sql.NVarChar(50), { nullable: true });

      for (const r of rows) {
        const modelKey = modelMap.get(r.model);
        if (!modelKey || r.year == null) continue;
        t.rows.add(
          r.year,
          modelKey,
          r.region ? regionMap.get(r.region) ?? null : null,
          r.color ? colorMap.get(r.color) ?? null : null,
          r.fuel_type,
          r.transmission,
          r.engine_size_l,
          r.mileage_km,
          r.price_usd,
          r.sales_volume,
          r.sales_classification
        );
      }
      await pool.request().bulk(t);
    }
  } finally {
    await pool.close();
  }

  console.log('✅ Import terminé (BMW sales).');
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
