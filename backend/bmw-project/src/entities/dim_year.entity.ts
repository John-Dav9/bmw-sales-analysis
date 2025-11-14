import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'dim_year' })
export class DimYear {
  @PrimaryColumn({ type: 'int', name: 'year_key' })
  year_key: number;

  @Column({ type: 'int', unique: true })
  year: number;
}
