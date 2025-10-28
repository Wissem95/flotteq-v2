import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Even if public, try to authenticate the user if token is present
    // This allows @Public routes to still access @CurrentUser() decorator
    try {
      await super.canActivate(context);
    } catch (error) {
      // If public route, allow access even without valid token
      if (isPublic) {
        return true;
      }
      // If not public, re-throw the error
      throw error;
    }

    return true;
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If public route and no user, allow access but don't throw error
    if (isPublic && !user) {
      return null;
    }

    // For protected routes, require valid user
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}