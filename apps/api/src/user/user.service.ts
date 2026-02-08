import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { RegisterUserDto } from '../schemas/user.schema.js';

@Injectable()
export class UserService {
    constructor(private readonly db: DatabaseService) { }

    async createUser(user: RegisterUserDto) {
        const query = `
            INSERT INTO "User" (email, name, password, role, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;

        const values = [user.email, user.name, user.password, user.role];

        const result = await this.db.query(query, values);
        return result.rows[0];
    }
    async getUser(id: number) {
        const query = `SELECT * FROM "User" WHERE id = $1`;
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }
    async getAllUsers() {
        const query = `Select * from "User"`;
        const result = await this.db.query(query);
        return result.rows;
    }
    async deleteUser(id: number) {
        const query = `DELETE FROM "User" WHERE id = $1 RETURNING name`;
        const result = await this.db.query(query, [id]);
        return `Deleted Successfully `;
    }
    async updateUser(id: number, user: RegisterUserDto) {
        const query = `UPDATE "User" SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *`;
        const result = await this.db.query(query, [user.name, user.email, user.password, user.role, id]);
        return result.rows[0];
    }
    async getUSerByEmail(email:string){
        const query=`Select * from "User" where email=$1`;
        const values=[email];
        const result=await this.db.query(query,values);
        console.log("Email:",result)
        return result.rows[0];
    }
}
