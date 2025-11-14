import { CanActivate, ExecutionContext, Injectable, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!roles || roles.length === 0) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user; // injecté par JwtStrategy
    if (roles.includes(user?.role)) return true;
    throw new ForbiddenException('Insufficient role');
  }
}
