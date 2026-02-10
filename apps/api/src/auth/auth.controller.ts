import { Controller, Request, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { registerUserSchema, loginUserSchema, RegisterUserDto, loginUserDto, RefreshTokenDto, refreshTokenSchema } from '../schemas/user.schema.js';
import { Public } from './decorators/public.decorator.js';

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
    register(@Body(new ZodValidationPipe(registerUserSchema)) registerUserDto: RegisterUserDto) {
        return this.authservice.register(registerUserDto)
    }

    @Public()
    @Post('signIn')
    signIn(@Body(new ZodValidationPipe(loginUserSchema)) loginUserDto: loginUserDto) {
        return this.authservice.signIn(loginUserDto);
    }

    @Public()
    @Post('refresh')
    refreshTokens(@Body(new ZodValidationPipe(refreshTokenSchema)) refreshTokenDto: RefreshTokenDto) {
        return this.authservice.refreshTokens(refreshTokenDto);
    }

    @Get('profile')
    getProfile(@Request() req) {
        console.log("User Request", req.user)
        return req.user;
    }
}
