import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SalesModule } from './modules/sales/sales.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DimModel } from './entities/dim_model.entity';
import { DimRegion } from './entities/dim_region.entity';
import { DimColor } from './entities/dim_color.entity';
import { DimYear } from './entities/dim_year.entity';
import { FactSales } from './entities/fact_sales.entity';
import { FactListings } from './entities/fact_listings.entity';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';

const entities = [
  DimModel,
  DimRegion,
  DimColor,
  DimYear,
  FactSales,
  FactListings,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const rawDbType = (config.get<string>('DB_TYPE') ?? '').toLowerCase().trim();
        const dbHost = config.get<string>('DB_HOST') ?? '';
        const dbUser = config.get<string>('DB_USER') ?? '';
        const dbSsl = (config.get<string>('DB_SSL') ?? 'false').toLowerCase() === 'true';
        const synchronize = (config.get<string>('DB_SYNC') ?? 'false').toLowerCase() === 'true';

        let dbType = rawDbType;
        if (!dbType) {
          // If connection details are provided, assume Postgres by default.
          dbType = (dbHost || dbUser) ? 'postgres' : 'sqlite';
        }
        if (dbType === 'postgresql') dbType = 'postgres';

        // Helpful startup log (no secrets)
        console.log(`[DB] type=${dbType} host=${dbHost || 'n/a'} user=${dbUser ? 'set' : 'n/a'} ssl=${dbSsl}`);

        if (dbType === 'postgres' || dbType === 'postgresql') {
          return {
            type: 'postgres' as const,
            host: dbHost || 'localhost',
            port: Number(config.get<string>('DB_PORT') ?? 5432),
            username: dbUser || 'postgres',
            password: config.get<string>('DB_PASS') ?? '',
            database: config.get<string>('DB_NAME') ?? 'postgres',
            entities,
            autoLoadEntities: true,
            synchronize,
            logging: false,
            ...(dbSsl ? { ssl: { rejectUnauthorized: false } } : {}),
          };
        }

        if (dbType === 'mssql') {
          return {
            type: 'mssql' as const,
            host: config.get<string>('DB_HOST') ?? 'localhost',
            port: Number(config.get<string>('DB_PORT') ?? 1433),
            username: config.get<string>('DB_USER') ?? 'sa',
            password: config.get<string>('DB_PASS') ?? '',
            database: config.get<string>('DB_NAME') ?? 'AutoSales',
            schema: config.get<string>('DB_SCHEMA') ?? 'dbo',
            entities,
            autoLoadEntities: true,
            synchronize,
            logging: false,
            options: {
              encrypt: (config.get<string>('DB_ENCRYPT') ?? 'false').toLowerCase() === 'true',
              trustServerCertificate: (config.get<string>('DB_TRUST_CERT') ?? 'true').toLowerCase() === 'true',
            },
          };
        }

        return {
          type: 'sqlite' as const,
          database: config.get<string>('DB_NAME') || 'bmw-sales.db',
          entities,
          autoLoadEntities: true,
          synchronize,
          logging: false,
        };
      },
    }),
    SalesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
