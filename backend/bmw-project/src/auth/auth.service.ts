// src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';                 // ✅ utilise bcryptjs partout
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/services/users/users.service';
import { User } from 'src/entities/user.entity';

type PublicUser = Omit<User, 'password_hash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  // Vérifie email + mot de passe
  async validateUser(email: string, pass: string): Promise<PublicUser> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.is_active) throw new UnauthorizedException('User is disabled');

    const ok = await bcrypt.compare(pass, user.password_hash || '');
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // retire le hash avant de renvoyer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safe } = user as any;
    return safe;
  }

  // Connexion → token + user
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const access_token = await this.signToken(user);
    return { access_token, user };
  }

  // Inscription → crée l’utilisateur (visitor par défaut), puis renvoie token + user
  async register(dto: { name: string; surname: string; email: string; password: string; role?: 'admin' | 'visitor' }) {
    const exists = await this.users.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already in use');

    // Tu peux laisser le hash au UsersService (si tu l’as implémenté ainsi),
    // ou bien hasher ici et passer password_hash. Ici je laisse hasher par UsersService
    const created = await this.users.create({
      name: dto.name,
      surname: dto.surname,
      email: dto.email,
      role: (dto.role as any) ?? 'visitor',
      // si ton UsersService create() sait hasher quand on lui passe "password"
      // tu peux lui passer dto.password directement
      // sinon : password_hash: await bcrypt.hash(dto.password, 10),
      // et ne pas passer "password".
      // -> dans ta version précédente, tu as ajouté le hash côté UsersService si `password` est fourni
      //    donc on passe bien `password` ici :
      ...( { password: dto.password } as any ),
      is_active: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...user } = created as any;

    const access_token = await this.signToken(user);
    return { access_token, user };
  }

  // Signature du JWT (30 min comme demandé)
  private signToken(user: { id: number; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwt.signAsync(payload, { expiresIn: '30m' });
  }

  async issueToken(user: { id: number; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwt.signAsync(payload, { expiresIn: '30m' });
  }
}
