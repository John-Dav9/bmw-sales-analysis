import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalesModule } from './modules/sales/sales.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DimModel } from './entities/dim_model.entity';
import { DimRegion } from './entities/dim_region.entity';
import { DimColor } from './entities/dim_color.entity';
import { DimYear } from './entities/dim_year.entity';
import { FactSales } from './entities/fact_sales.entity';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // Fichier DB (local + Render)
      database: process.env.DB_NAME || 'bmw-sales.db',
      entities: [
        DimModel,
        DimRegion,
        DimColor,
        DimYear,
        FactSales,
      ],
      autoLoadEntities: true,
      // Pour un projet portfolio, on peut laisser true
      // pour générer les tables automatiquement
      synchronize: true,
      logging: false,
    }),
    SalesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
