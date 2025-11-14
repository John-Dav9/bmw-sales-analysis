import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'fact_sales' })
@Index(['year_key'])
@Index(['model_key'])
@Index(['region_key'])
@Index(['color_key'])
export class FactSales {
  @PrimaryGeneratedColumn({ name: 'sales_key', type: 'bigint' })
  sales_key: string; 

  @Column({ type: 'int' })
  year_key: number;

  @Column({ type: 'int' })
  model_key: number;

  @Column({ type: 'int', nullable: true })
  region_key?: number | null;

  @Column({ type: 'int', nullable: true })
  color_key?: number | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  fuel_type?: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  transmission?: string;

  @Column({
    type: 'decimal', precision: 4, scale: 2, nullable: true, name: 'engine_size_l',
    transformer: { to: (v?: number) => v, from: (v: string | null) => (v == null ? null : Number(v)) },
  })
  engine_size_l?: number | null;

  @Column({ type: 'int', nullable: true, name: 'mileage_km' })
  mileage_km?: number | null;

  @Column({
    type: 'decimal', precision: 18, scale: 2, nullable: true, name: 'price_usd',
    transformer: { to: (v?: number) => v, from: (v: string | null) => (v == null ? null : Number(v)) },
  })
  price_usd?: number | null;

  @Column({ type: 'int', nullable: true, name: 'sales_volume' })
  sales_volume?: number | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true, name: 'sales_classification' })
  sales_classification?: string | null;
}
