// src/common/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/common/decorators/current-user.decorator';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { JwtPayload } from 'src/modules/auth/types/jwt-payload';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. TODO: Kiểm tra metadata IS_PUBLIC_KEY bằng reflector.getAllAndOverride
    const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(),context.getClass()]
    )
    
    //    Nếu true -> return true ngay
if(isPublic) {
        return true;
    }
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // 2. TODO: Tách Bearer token từ request.headers.authorization
    const authorization = request.headers.authorization;
    if(!authorization || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedException('unauthorized')
    }
    const token = authorization.split(' ')[1];
    if (!token) {
  throw new UnauthorizedException('Unauthorized');
}


    


    try {
      // 3. TODO: Verify token bằng await this.jwtService.verifyAsync<JwtPayload>(token)
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      //    Gán request.user = { id: payload.sub, email: payload.email, role: payload.role }
      request.user = {id:payload.sub, email:payload.email, role : payload.role}
      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}