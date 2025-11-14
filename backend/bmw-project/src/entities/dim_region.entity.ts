import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'dim_region' })
@Index(['region'], { unique: true })
export class DimRegion {
  @PrimaryGeneratedColumn({ name: 'region_key' })
  region_key: number;

  @Column({ type: 'nvarchar', length: 100 })
  region: string;
}
