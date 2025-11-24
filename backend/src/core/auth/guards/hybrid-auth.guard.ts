import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

/**
 * Hybrid Auth Guard that accepts both tenant JWT and partner JWT tokens
 * Tries 'jwt' strategy first, then falls back to 'partner-jwt' strategy
 */
@Injectable()
export class HybridAuthGuard extends AuthGuard(['jwt', 'partner-jwt']) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If both strategies failed, throw unauthorized
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
