import { Module, Global } from '@nestjs/common';
import { TenantMiddleware } from './tenant.middleware';
import { TenantGuard } from './tenant.guard';
import { TenantInterceptor } from './tenant.interceptor';

@Global()
@Module({
  providers: [TenantGuard, TenantInterceptor, TenantMiddleware],
  exports: [TenantGuard, TenantInterceptor, TenantMiddleware],
})
export class TenantModule {}
