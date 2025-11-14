import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'fact_listings' })
@Index(['year_key'])
@Index(['model_key'])
export class FactListings {
  @PrimaryGeneratedColumn({ name: 'listing_key', type: 'bigint' })
  listing_key: string;

  @Column({ type: 'int' })
  year_key: number;

  @Column({ type: 'int' })
  model_key: number;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  transmission?: string;

  @Column({ type: 'int', nullable: true })
  mileage?: number | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  fuel_type?: string;

  @Column({
    type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'tax',
    transformer: { to: (v?: number) => v, from: (v: string | null) => (v == null ? null : Number(v)) },
  })
  tax?: number | null;

  @Column({
    type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'mpg',
    transformer: { to: (v?: number) => v, from: (v: string | null) => (v == null ? null : Number(v)) },
  })
  mpg?: number | null;

  @Column({
    type: 'decimal', precision: 4, scale: 2, nullable: true, name: 'engine_size_l',
    transformer: { to: (v?: number) => v, from: (v: string | null) => (v == null ? null : Number(v)) },
  })
  engine_size_l?: number | null;

  @Column({
    type: 'decimal', precision: 18, scale: 2, nullable: true, name: 'price',
    transformer: { to: (v?: number) => v, from: (v: string | null) => (v == null ? null : Number(v)) },
  })
  price?: number | null;

  @Column({ type: 'nvarchar', length: 3, nullable: true })
  currency?: string | null;
}
