import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export type UserRole = 'admin' | 'visitor';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180 })
  email!: string;

  @Column({ type: 'varchar', length: 200 })
  password_hash!: string;

  @Column({ type: 'varchar', length: 20, default: 'visitor' })
  role!: UserRole;

  @Column({type: 'varchar', length: 100, nullable: true})
  name?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  surname?: string;

  @Column({ type: 'bit', default: () => '(1)' }) // ✅ SQL Server default 1
  is_active: boolean;
}
