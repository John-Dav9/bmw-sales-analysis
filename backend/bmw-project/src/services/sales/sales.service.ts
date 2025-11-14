import { Injectable } from '@nestjs/common';
import { GetKpiQueryDto, GetSalesQueryDto } from 'src/dto/get-sales.dto';
import { TopModelsQueryDto, TrendQueryDto } from 'src/dto/insights.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FactSales } from 'src/entities/fact_sales.entity';
import { DimModel } from 'src/entities/dim_model.entity';
import { DimRegion } from 'src/entities/dim_region.entity';
import { DimYear } from 'src/entities/dim_year.entity';
import { DimColor } from 'src/entities/dim_color.entity';
import { async } from 'rxjs';


@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(FactSales)
    private readonly factRepo: Repository<FactSales>,

    @InjectRepository(DimModel)
    private readonly modelRepo: Repository<DimModel>,

    @InjectRepository(DimRegion)
    private readonly regionRepo: Repository<DimRegion>,

    @InjectRepository(DimColor)
    private readonly colorRepo: Repository<DimColor>,

    @InjectRepository(DimYear)
    private readonly yearRepo: Repository<DimYear>, 
  ) {}

  private baseSalesQB(): SelectQueryBuilder<FactSales> {
    return this.factRepo
      .createQueryBuilder('f')
      .leftJoin(DimModel, 'm', 'm.model_key = f.model_key')
      .leftJoin(DimRegion, 'r', 'r.region_key = f.region_key')
      .leftJoin(DimColor, 'c', 'c.color_key = f.color_key')
      .leftJoin(DimYear, 'y', 'y.year_key = f.year_key');
  }
  private baseModelQB(): SelectQueryBuilder<DimModel> {
    return this.modelRepo.createQueryBuilder('m');
  }
  private baseRegionQB(): SelectQueryBuilder<DimRegion> {
    return this.regionRepo.createQueryBuilder('r');
  }
  private baseColorQB(): SelectQueryBuilder<DimColor> {
    return this.colorRepo.createQueryBuilder('c');
  }
  private baseYearQB(): SelectQueryBuilder<DimYear> {
    return this.yearRepo.createQueryBuilder('y');
  }
  

  // Helpers filtres
  private applyFilters(qb: SelectQueryBuilder<FactSales>, q: any) {
    if (q.year) qb.andWhere('f.year_key = :year', { year: q.year });
    if (q.region) qb.andWhere('r.region = :region', { region: q.region });
    if (q.model) qb.andWhere('m.model = :model', { model: q.model });
  }

  private applySort(qb: SelectQueryBuilder<FactSales>, sort?: string) {
    switch (sort) {
      case 'year_asc': qb.addOrderBy('f.year_key', 'ASC'); break;
      case 'year_desc': qb.addOrderBy('f.year_key', 'DESC'); break;
      case 'price_asc': qb.addOrderBy('f.price_usd', 'ASC'); break;
      case 'price_desc': qb.addOrderBy('f.price_usd', 'DESC'); break;
      case 'volume_desc': qb.addOrderBy('f.sales_volume', 'DESC'); break;
      default: qb.addOrderBy('f.year_key', 'DESC'); break;
    }
  }

  // 1) Listing paginé (retourne lignes fact_sales + join)
  async list(q: GetSalesQueryDto) {
    const qb = this.baseSalesQB()
      .select([
        'f.sales_key AS sales_key',
        'y.year AS year',
        'm.make AS make',
        'm.model AS model',
        'r.region AS region',
        'c.color AS color',
        'f.price_usd AS price_usd',
        'f.sales_volume AS sales_volume',
        'f.fuel_type AS fuel_type',
        'f.transmission AS transmission',
        'f.engine_size_l AS engine_size_l'
      ]);

    this.applyFilters(qb, q);
    this.applySort(qb, q.sort);
    qb.take(q.limit ?? 100).skip(q.offset ?? 0);

    const [items, total] = await Promise.all([
      qb.getRawMany(),
      qb.getCount(),
      this.countForList(q)
    ]);

    return { items, total, params: q };
  }
  // Count for listing (with same filters)
    private async countForList(q: GetSalesQueryDto) {
    const qb = this.baseSalesQB().select('COUNT(1)', 'cnt');
    this.applyFilters(qb, q);
    const row = await qb.getRawOne();
    return Number(row.cnt ?? 0);
  }
// 2) KPI (total revenue, total units, avg price - avec filtres optionnels)
async kpi(q: GetKpiQueryDto) {
  const qb = this.baseSalesQB()
    .select([
      // Revenu = somme du prix * volume (en float pour éviter les troncatures)
      'SUM(CAST(f.sales_volume AS float) * CAST(f.price_usd AS float)) AS revenue',
      // Unités = somme du volume
      'SUM(f.sales_volume) AS units',
      // Prix moyen pondéré = SUM(price*volume) / NULLIF(SUM(volume), 0)
      'CASE WHEN SUM(f.sales_volume) = 0 THEN 0 ' +
      '     ELSE SUM(CAST(f.sales_volume AS float) * CAST(f.price_usd AS float)) / SUM(CAST(f.sales_volume AS float)) ' +
      'END AS avg_price'
    ]);

  this.applyFilters(qb, q);
  const row = await qb.getRawOne();

  // ⚠️ alias utilisés dans le SELECT ci-dessus: revenue, units, avg_price
  const revenue  = Number(row?.revenue  ?? 0);
  const units    = Number(row?.units    ?? 0);
  const avgPrice = Number(row?.avg_price ?? 0);

  return { revenue, units, avgPrice, params: q };
}


  // 3) Top modèles (par volume, avec année/région optionnelles)
  async topModels(q: TopModelsQueryDto) {
    const qb = this.baseSalesQB()
      .select([
        'm.model AS model',
        'm.make AS make',
        'SUM(f.sales_volume) AS units',
        'AVG(CAST(f.price_usd AS float)) AS avg_price'
      ])
      .groupBy('m.model')
      .addGroupBy('m.make')
      .orderBy('units', 'DESC')
      .limit(q.top ?? 10);

    this.applyFilters(qb, q);
    return qb.getRawMany();
  }

// 4) Trend (série par année : units & avg_price pondéré)
async trend(q: TrendQueryDto) {
  const qb = this.baseSalesQB()
    .select([
      'y.year AS year',
      'SUM(f.sales_volume) AS units',
      'CASE WHEN SUM(f.sales_volume) = 0 THEN 0 ' +
      '     ELSE SUM(CAST(f.sales_volume AS float) * CAST(f.price_usd AS float)) / SUM(CAST(f.sales_volume AS float)) ' +
      'END AS avg_price'
    ])
    .groupBy('y.year')
    .orderBy('y.year', 'ASC');

  if (q.fromYear) qb.andWhere('f.year_key >= :fy', { fy: q.fromYear });
  if (q.toYear)   qb.andWhere('f.year_key <= :ty', { ty: q.toYear });
  if (q.region)   qb.andWhere('r.region = :region', { region: q.region });
  if (q.model)    qb.andWhere('m.model  = :model',  { model: q.model  });

  return qb.getRawMany();
}

// 5) Distinct values for filters (years, regions, models, colors)
async distinctValues() {
  const [years, regions, models, colors] = await Promise.all([
    this.baseSalesQB().select('DISTINCT y.year', 'year').getRawMany(),
      this.baseSalesQB().select('DISTINCT r.region', 'region').getRawMany(),
      this.baseSalesQB().select('DISTINCT m.model', 'model').getRawMany(),
      this.baseSalesQB().select('DISTINCT c.color', 'color').getRawMany()
    ]);

  return { years, regions, models, colors };
}

async topRegions(top = 10, q?: { year?: number }) {
  const qb = this.baseSalesQB()
    .select(['r.region AS region', 'SUM(f.sales_volume) AS units'])
    .groupBy('r.region')
    .orderBy('units', 'DESC')
    .limit(top);
  if (q?.year) qb.andWhere('f.year_key = :y', { y: q.year });
  return qb.getRawMany();
}

  async fuelByYear() {
    return this.baseSalesQB()
      .select(['y.year AS year', 'f.fuel_type AS fuel', 'SUM(f.sales_volume) AS units'])
      .groupBy('y.year')
      .addGroupBy('f.fuel_type')
      .orderBy('y.year', 'ASC')
      .getRawMany();
  }

  async priceVsEngine() {
    return this.baseSalesQB()
      .select([
        'f.engine_size_l AS engine',
        'AVG(CAST(f.price_usd AS float)) AS avg_price',
        'AVG(CAST(f.sales_volume AS float)) AS avg_units'
      ])
      .where('f.engine_size_l IS NOT NULL')
      .groupBy('f.engine_size_l')
      .orderBy('engine', 'ASC')
      .getRawMany();
  }
}

