/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
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
  const regions = new Set();
  const colors = new Set();
  const models = new Map(); // model -> { make, model, fuel_type, transmission, engine_size_l }

  for (const r of rows) {
    if (r.year != null) years.add(r.year);
    if (r.region) regions.add(r.region);
    if (r.color) colors.add(r.color);
    if (r.model && !models.has(r.model)) {
      models.set(r.model, {
        make: 'BMW',
        model: r.model,
        fuel_type: r.fuel_type,
        transmission: r.transmission,
        engine_size_l: r.engine_size_l,
      });
    }
  }

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'postgres',
    ssl: String(process.env.DB_SSL || 'false').toLowerCase() === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const reset = String(process.env.RESET_DB || 'false').toLowerCase() === 'true';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (reset) {
      console.log('Resetting tables...');
      await client.query('DELETE FROM fact_sales');
      await client.query('DELETE FROM fact_listings');
      await client.query('DELETE FROM dim_model');
      await client.query('DELETE FROM dim_region');
      await client.query('DELETE FROM dim_color');
      await client.query('DELETE FROM dim_year');
    }

    if (years.size) {
      const yearRows = Array.from(years.values()).map((y) => [y, y]);
      for (const chunk of chunkArray(yearRows, 500)) {
        const values = [];
        const params = [];
        chunk.forEach((row, i) => {
          const base = i * 2;
          params.push(`($${base + 1}, $${base + 2})`);
          values.push(row[0], row[1]);
        });
        await client.query(
          `INSERT INTO dim_year (year_key, year) VALUES ${params.join(',')}
           ON CONFLICT (year_key) DO NOTHING`,
          values
        );
      }
      console.log(`dim_year: upserted ${years.size}`);
    }

    if (regions.size) {
      const regRows = Array.from(regions.values()).map((r) => [r]);
      for (const chunk of chunkArray(regRows, 500)) {
        const values = [];
        const params = [];
        chunk.forEach((row, i) => {
          params.push(`($${i + 1})`);
          values.push(row[0]);
        });
        await client.query(
          `INSERT INTO dim_region (region) VALUES ${params.join(',')}
           ON CONFLICT (region) DO NOTHING`,
          values
        );
      }
      console.log(`dim_region: upserted ${regions.size}`);
    }

    if (colors.size) {
      const colorRows = Array.from(colors.values()).map((c) => [c]);
      for (const chunk of chunkArray(colorRows, 500)) {
        const values = [];
        const params = [];
        chunk.forEach((row, i) => {
          params.push(`($${i + 1})`);
          values.push(row[0]);
        });
        await client.query(
          `INSERT INTO dim_color (color) VALUES ${params.join(',')}
           ON CONFLICT (color) DO NOTHING`,
          values
        );
      }
      console.log(`dim_color: upserted ${colors.size}`);
    }

    // Load existing model map to avoid duplicates
    const existingModels = await client.query(
      `SELECT model_key, model FROM dim_model WHERE make = 'BMW'`
    );
    const modelMap = new Map(existingModels.rows.map((r) => [r.model, r.model_key]));

    const missingModels = Array.from(models.values()).filter((m) => !modelMap.has(m.model));
    if (missingModels.length) {
      for (const chunk of chunkArray(missingModels, 200)) {
        const values = [];
        const params = [];
        chunk.forEach((m, i) => {
          const base = i * 5;
          params.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
          values.push(m.make, m.model, m.fuel_type, m.transmission, m.engine_size_l);
        });
        await client.query(
          `INSERT INTO dim_model (make, model, fuel_type, transmission, engine_size_l)
           VALUES ${params.join(',')}`,
          values
        );
      }
      console.log(`dim_model: inserted ${missingModels.length}`);
    }

    // Refresh model map
    const modelRows = await client.query(
      `SELECT model_key, model FROM dim_model WHERE make = 'BMW'`
    );
    modelMap.clear();
    for (const r of modelRows.rows) modelMap.set(r.model, r.model_key);

    const regionRows = await client.query('SELECT region_key, region FROM dim_region');
    const regionMap = new Map(regionRows.rows.map((r) => [r.region, r.region_key]));
    const colorRows = await client.query('SELECT color_key, color FROM dim_color');
    const colorMap = new Map(colorRows.rows.map((r) => [r.color, r.color_key]));

    // Insert fact_sales
    const factRows = [];
    for (const r of rows) {
      const modelKey = r.model ? modelMap.get(r.model) : null;
      if (!modelKey || r.year == null) continue;
      factRows.push([
        r.year, // year_key
        modelKey,
        r.region ? (regionMap.get(r.region) ?? null) : null,
        r.color ? (colorMap.get(r.color) ?? null) : null,
        r.fuel_type,
        r.transmission,
        r.engine_size_l,
        r.mileage_km,
        r.price_usd,
        r.sales_volume,
        r.sales_classification,
      ]);
    }

    for (const chunk of chunkArray(factRows, 500)) {
      const values = [];
      const params = [];
      chunk.forEach((row, i) => {
        const base = i * 11;
        params.push(
          `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, ` +
          `$${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11})`
        );
        values.push(...row);
      });
      await client.query(
        `INSERT INTO fact_sales
          (year_key, model_key, region_key, color_key, fuel_type, transmission, engine_size_l, mileage_km, price_usd, sales_volume, sales_classification)
         VALUES ${params.join(',')}`,
        values
      );
    }
    console.log(`fact_sales: inserted ${factRows.length}`);

    await client.query('COMMIT');
    console.log('✅ Import terminé (Postgres).');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
