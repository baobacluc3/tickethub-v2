import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../../modules/auth/types/jwt-payload';

export interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    // TODO: Trả về request.user (nếu undefined có thể throw UnauthorizedException)
    if(!request.user) {
        throw new UnauthorizedException('User not authenticated')
    }
    return request.user;
  },
);