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

// Check for Public Access: It checks if a route is marked as @Public(). If it is, it lets the request pass through immediately.
// Extract the Token: It searches for the accessToken inside your request cookies (or the Authorization header as a backup).
// Verify Identity: It uses your secret key to verify that the token is valid and hasn't been tampered with.
// Provide User Data: If the token is valid, it attaches the user's information (like ID and Role) to the request object (req.user) so your controllers can identify who is making the request.

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
