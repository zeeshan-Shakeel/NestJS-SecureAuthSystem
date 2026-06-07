import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { RegisterUserDto } from '../schemas/user.schema.js';
import { PrismaService } from '../database/prisma.service.js';
@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(user: RegisterUserDto) {
        try {
            const result = await this.prisma.user.create({
                data: user,
            });
            return result;
        } catch (error: any) {
            if (error.code === 'P2002') { // Unique constraint violation code for Postgres
                throw new ConflictException('Email already exists');
            }
            throw error;
        }
    }
    async getUser(id: number) {
        const result = await this.prisma.user.findFirst({where:{id}});
        return result;
    }
    async getAllUsers() {
        const result = await this.prisma.user.findMany();
        return result;
    }
    async deleteUser(id: number) {
        const result = await this.prisma.user.delete({where:{id}});
        return `Deleted Successfully `;
    }
    async updateUser(id: number, user: RegisterUserDto) {
        const result = await this.prisma.user.update({where:{id},data:user});
        return result;
    }
    async getUSerByEmail(email: string) {
        const result = await this.prisma.user.findFirst({where:{email}});
        // console.log("Email:", result)
        return result;
    }
    async updateRefreshToken(id: number, refreshToken: string) {
        const result = await this.prisma.user.update({where:{id},data:{refreshToken}});

    }
}
