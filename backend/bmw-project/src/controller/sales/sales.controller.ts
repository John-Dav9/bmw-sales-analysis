import { Controller, Get, Query } from '@nestjs/common';
import { TopModelsQueryDto, TrendQueryDto } from 'src/dto/insights.dto';
import { SalesService } from 'src/services/sales/sales.service';
import { GetKpiQueryDto, GetSalesQueryDto } from 'src/dto/get-sales.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // Liste paginée de lignes (agrégées au besoin)
  @Get()
  async list(@Query() q: GetSalesQueryDto) {
    return this.salesService.list(q);
  }

  // KPI synthétiques (CA, volume, prix moyen, marge si dispo)
  @Get('kpi')
  async kpi(@Query() q: GetKpiQueryDto) {
    return this.salesService.kpi(q);
  }

  // Top modèles (par volume/CA)
  @Get('insights/top-models')
  async topModels(@Query() q: TopModelsQueryDto) {
    return this.salesService.topModels(q);
  }

  // Tendance multi-année (séries annuelles)
  @Get('insights/trend')
  async trend(@Query() q: TrendQueryDto) {
    return this.salesService.trend(q);
  }

  @Get('insights/top-regions')
  async topRegions(@Query('top') top?: number, @Query('year') year?: number) {
    return this.salesService.topRegions(top ?? 10, { year });
  }

  @Get('insights/fuel-by-year')
  async fuelByYear(@Query() q: TrendQueryDto) {
    return this.salesService.fuelByYear();
  }

  @Get('insights/price-vs-engine')
  async priceVsEngine(@Query() q: TrendQueryDto) {
    return this.salesService.priceVsEngine();
  }


}
