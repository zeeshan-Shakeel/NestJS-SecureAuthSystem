import { Controller, Request, Response, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { registerUserSchema, loginUserSchema, RegisterUserDto, loginUserDto, RefreshTokenDto, refreshTokenSchema } from '../schemas/user.schema.js';
import { Public } from './decorators/public.decorator.js';

// Cookie options — shared across all token cookies
const COOKIE_OPTIONS = {
    httpOnly: true,      // JS cannot read this cookie (XSS protection)
    secure: false,       // set to true in production (requires HTTPS)
    sameSite: 'lax' as const,
    path: '/',
};

@Controller('auth')
export class AuthController {
    constructor(private authservice: AuthService) {
    }

    @Get('users')
    getAllUser() {
        return this.authservice.getAllUser();
    }

    @Get('users/:id')
    getUser(@Param('id') id: number) {
        return this.authservice.getUser(id);
    }

    @Delete('users/:id')
    deleteUser(@Param('id') id: number) {
        return this.authservice.deleteUser(id);
    }

    @Put('users/:id')
    updateUser(@Param('id') id: number, @Body() registerUserDto: RegisterUserDto) {
        return this.authservice.updateUser(id, registerUserDto);
    }

    @Public()
    @Post('register')
    async register(
        @Body(new ZodValidationPipe(registerUserSchema)) registerUserDto: RegisterUserDto,
        @Response({ passthrough: true }) res: any,
    ) {
        const result = await this.authservice.register(registerUserDto);

        // NEW: Set tokens as HttpOnly cookies
        res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 1000 });        // 1 hour
        res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        // OLD: was returning tokens in body — now only return user (not tokens)
        // return result;
        return { user: result.user };
    }

    @Public()
    @Post('signIn')
    async signIn(
        @Body(new ZodValidationPipe(loginUserSchema)) loginUserDto: loginUserDto,
        @Response({ passthrough: true }) res: any,
    ) {
        const result = await this.authservice.signIn(loginUserDto);

        // NEW: Set tokens as HttpOnly cookies
        res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 1000 });        // 1 hour
        res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

        // OLD: was returning tokens in body — now only return user
        // return result;
        return { user: result.user };
    }

    @Public()
    @Post('refresh')
    async refreshTokens(
        @Request() req: any,
        @Response({ passthrough: true }) res: any,
    ) {
        // NEW: read refresh token from HttpOnly cookie (not from request body)
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // OLD: was reading from body with Zod validation
        // refreshTokens(@Body(new ZodValidationPipe(refreshTokenSchema)) refreshTokenDto: RefreshTokenDto)

        const result = await this.authservice.refreshTokens({ refreshToken });

        // NEW: Set new rotated tokens as cookies
        res.cookie('accessToken', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 1000 });
        res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return { user: result.user };
    }

    @Public()
    @Post('logout')
    logout(@Response({ passthrough: true }) res: any) {
        // NEW: clear both cookies on logout
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        return { message: 'Logged out successfully' };
    }

    @Get('profile')
    getProfile(@Request() req: any) {
        console.log('User Request', req.user);
        return req.user;
    }
}
