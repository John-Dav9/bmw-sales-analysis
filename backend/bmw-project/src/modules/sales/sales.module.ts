import { Module } from '@nestjs/common';
import { SalesController } from 'src/controller/sales/sales.controller';
import { SalesService } from 'src/services/sales/sales.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactSales } from 'src/entities/fact_sales.entity';
import { FactListings } from 'src/entities/fact_listings.entity';
import { DimModel } from 'src/entities/dim_model.entity';
import { DimRegion } from 'src/entities/dim_region.entity';
import { DimColor } from 'src/entities/dim_color.entity';
import { DimYear } from 'src/entities/dim_year.entity';



@Module({
  imports: [TypeOrmModule.forFeature([
      FactSales, 
      FactListings, 
      DimModel, 
      DimRegion,
      DimColor, 
      DimYear
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}





