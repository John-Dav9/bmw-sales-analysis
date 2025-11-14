import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  // --- Reads ---
  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  // --- Create (hash du mot de passe ici) ---
  async create(data: Partial<User>) {
    const user = this.repo.create({
      email: data.email!,
      name: data.name!,
      surname: data.surname!,
      role: (data.role as any) ?? 'visitor',
      is_active: data.is_active ?? true,
      // si password présent → hash
      password_hash: data.password_hash
        ?? (data as any).password
          ? await bcrypt.hash((data as any).password, 10)
          : undefined,
    });
    return this.repo.save(user);
  }

  // --- Update (optionnel: re-hash si password fourni) ---
  async update(id: number, patch: Partial<User> & { password?: string }) {
    const toSave: Partial<User> = { ...patch };
    if (patch.password) {
      toSave.password_hash = await bcrypt.hash(patch.password, 10);
      delete (toSave as any).password;
    }
    await this.repo.update(id, toSave);
    return this.findOne(id);
  }

  // --- Delete ---
  async remove(id: number) {
    return this.repo.delete(id);
    // (si soft delete: await this.repo.softDelete(id))
  }

  // --- Activer/Désactiver ---
  async setActive(id: number, is_active: boolean) {
    await this.repo.update(id, { is_active });
    return this.findOne(id);
  }

  // --- Seed/ensure admin exists (hash interne) ---
  async ensureAdmin(email: string, plainPassword: string, name: string, surname: string) {
    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.create({
        email,
        name,
        surname,
        role: 'admin' as any,
        password_hash: await bcrypt.hash(plainPassword, 10),
        is_active: true,
      });
      console.log('👑 Nouvel admin créé');
    } else {
      console.log('ℹ️ Admin déjà existant');
    }
    return user;
  }
}
