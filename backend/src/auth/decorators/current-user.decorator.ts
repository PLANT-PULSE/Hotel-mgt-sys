import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | string => {
    const { user } = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return data ? user[data] : user;
  },
);
