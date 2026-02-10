import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterUserDto, loginUserDto, RefreshTokenDto } from '../schemas/user.schema.js';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../schemas/user.schema.js';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private readonly userservice: UserService, private jwtService: JwtService) {
    }
    async register(registerUserDto: RegisterUserDto) {
        const hash = await bcrypt.hash(registerUserDto.password, 10);
        const newUser = await this.userservice.createUser({ ...registerUserDto, password: hash });
        const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
        const token = await this.jwtService.signAsync(payload);
        const { password, ...newUserData } = newUser;
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        const hasRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userservice.updateRefreshToken(newUser.id, hasRefreshToken);
        return { accessToken: token, refreshToken: refreshToken, user: newUserData };
    }

    async getUser(id: number) {
        return this.userservice.getUser(id);
    }

    async getAllUser() {
        return this.userservice.getAllUsers();
    }
    async updateUser(id: number, user: RegisterUserDto) {
        return this.userservice.updateUser(id, user);
    }
    async deleteUser(id: number) {
        return this.userservice.deleteUser(id);
    }
    async signIn(loginUserDto: loginUserDto): Promise<{ accessToken: string, refreshToken: string, user: UserResponseDto }> {
        console.log("Hy")
        const user = await this.userservice.getUSerByEmail(loginUserDto.email);
        console.log("checking", user)
        const isMatch = user ? await bcrypt.compare(loginUserDto.password, user.password) : false;
        if (!isMatch) {
            throw new Error("Invalid Username or password");
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = await this.jwtService.signAsync(payload);
        const { password, ...newUserData } = user;
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        const hasRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.userservice.updateRefreshToken(user.id, hasRefreshToken);
        return { accessToken: token, refreshToken: refreshToken, user: newUserData };
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        try {
            const { refreshToken } = refreshTokenDto;
            // Verify the token
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.userservice.getUser(payload.sub);

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Access Denied');
            }

            // Compare the token with the hashed one in the DB
            const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!refreshTokenMatches) {
                throw new UnauthorizedException('Access Denied');
            }

            // Rotation: Generate new tokens
            const newPayload = { sub: user.id, email: user.email, role: user.role };
            const accessToken = await this.jwtService.signAsync(newPayload);
            const newRefreshToken = await this.jwtService.signAsync(newPayload, { expiresIn: '7d' });

            // Hash and save the new refresh token
            const hasRefreshToken = await bcrypt.hash(newRefreshToken, 10);
            await this.userservice.updateRefreshToken(user.id, hasRefreshToken);

            // Strip sensitive data for response
            const { password, refreshToken: oldRt, ...userData } = user;

            return {
                accessToken,
                refreshToken: newRefreshToken,
                user: userData
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid Refresh Token');
        }
    }
}