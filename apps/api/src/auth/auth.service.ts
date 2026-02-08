import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { RegisterUserDto,loginUserDto } from '../schemas/user.schema.js';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '../schemas/user.schema.js';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private readonly userservice: UserService , private jwtService:JwtService) {
        this.userservice = userservice;
    }
    async register(registerUserDto: RegisterUserDto) {
        const hash = await bcrypt.hash(registerUserDto.password, 10);
        return this.userservice.createUser({ ...registerUserDto, password: hash });
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
   async signIn(loginUserDto:loginUserDto):Promise<{token:string}>{
    console.log("Hy")
    const user=await this.userservice.getUSerByEmail(loginUserDto.email);
    console.log("checking",user)
    const isMatch=user ? await bcrypt.compare(loginUserDto.password,user.password):false;
    if(!isMatch){
        throw new Error("Invalid Username or password");
    }
    const payload={sub:user.id,email:user.email,role:user.role};
    const token=await this.jwtService.signAsync(payload);
    return {token} 
    }
   }