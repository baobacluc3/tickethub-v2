// src/common/guards/roles.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from 'src/common/decorators/current-user.decorator';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/modules/users/user-role.enum';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. TODO: Đọc requiredRoles = reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [handler, class])
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()])

        //    Nếu không có hoặc rỗng -> return true
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // 2. TODO: Lấy user = context.switchToHttp().getRequest<RequestWithUser>().user
        const user = context.switchToHttp().getRequest<RequestWithUser>().user;
        //    Nếu !user hoặc !requiredRoles.includes(user.role) -> throw new ForbiddenException('Forbidden')
        if (!user) {
            throw new ForbiddenException('Forbidden');
        }
        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Forbidden')
        }

        return true;
    }
}