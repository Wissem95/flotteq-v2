import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentPartner = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const partner = request.user;

    return data ? partner?.[data] : partner;
  },
);
