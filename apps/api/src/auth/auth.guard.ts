import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        console.log(`[AuthGuard] URL: ${context.switchToHttp().getRequest().url}, Handler: ${context.getHandler().name}, isPublic: ${isPublic}`);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        // NEW: extract token from HttpOnly cookie first, fallback to Authorization header
        const token = this.extractTokenFromCookie(request) || this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token);
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    // NEW: read access token from cookie
    private extractTokenFromCookie(request: Request): string | undefined {
        return request.cookies?.accessToken;
    }

    // OLD: kept as fallback (useful for Postman/API testing)
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
