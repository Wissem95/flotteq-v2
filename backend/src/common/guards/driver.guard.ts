import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class DriverGuard implements CanActivate {
  private readonly logger = new Logger(DriverGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Vérifier que l'user est DRIVER
    const isDriver = user.role === UserRole.DRIVER;

    if (!isDriver) {
      this.logger.warn(
        `Access denied to driver endpoint for user ${user.id} (role ${user.role})`,
      );
      throw new ForbiddenException(
        'This endpoint is restricted to drivers',
      );
    }

    return true;
  }
}
