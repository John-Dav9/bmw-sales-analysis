import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'dim_model' })
@Index(['make', 'model'])
export class DimModel {
  @PrimaryGeneratedColumn({ name: 'model_key' })
  model_key: number;

  @Column({ type: 'nvarchar', length: 50 })
  make: string;

  @Column({ type: 'nvarchar', length: 100 })
  model: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  fuel_type?: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  transmission?: string;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
    name: 'engine_size_l',
    transformer: {
      to: (v?: number) => v,
      from: (v: string | null) => (v == null ? null : Number(v)),
    },
  })
  engine_size_l?: number | null;
}
