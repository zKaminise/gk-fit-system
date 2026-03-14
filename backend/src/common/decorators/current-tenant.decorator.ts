import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Usuário não possui tenant associado');
    }
    return tenantId;
  },
);
