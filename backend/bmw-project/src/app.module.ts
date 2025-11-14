import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalesController } from './controller/sales/sales.controller';
import { SalesService } from './services/sales/sales.service';
import { SalesModule } from './modules/sales/sales.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DimModel } from './entities/dim_model.entity';
import { DimRegion } from './entities/dim_region.entity';
import { DimColor } from './entities/dim_color.entity';
import { DimYear } from './entities/dim_year.entity';
import { FactSales } from './entities/fact_sales.entity';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsersAdminController } from './users/users.admin.controller';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({

      type: 'mssql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 1433,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      options: { encrypt: process.env.DB_ENCRYPT === 'true', trustServerCertificate: true },
      entities: [
        DimModel, 
        DimRegion,
        DimColor, 
        DimYear, 
        FactSales
      ],
      autoLoadEntities: true,
      synchronize: false, // IMPORTANT: laisser false en prod
      logging: false
    }),
    SalesModule,  UsersModule, AuthModule,
  ],
    controllers: [AppController],
    providers: [AppService],
  })
  export class AppModule {}
