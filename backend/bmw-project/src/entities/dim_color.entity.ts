import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'dim_color' })
@Index(['color'], { unique: true })
export class DimColor {
  @PrimaryGeneratedColumn({ name: 'color_key' })
  color_key: number;

  @Column({ type: 'nvarchar', length: 50 })
  color: string;
}
