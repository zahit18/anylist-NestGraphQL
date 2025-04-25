import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';
import { LoginInput, SignupInput } from './dto/inputs';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    private getJwtToken(userId: string) {
        return this.jwtService.sign({ id: userId })
    }

    async signup(signupInput: SignupInput): Promise<AuthResponse> {
        const user = await this.usersService.create(signupInput)
        const token = this.getJwtToken(user.id)

        return {
            token,
            user
        }
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const { email, password } = loginInput
        const user = await this.usersService.findByEmail(email)

        if (!bcrypt.compareSync(password, user.password)) {
            throw new BadRequestException('Email / Password do not match')
        }

        const token = this.getJwtToken(user.id)

        return {
            token,
            user
        }
    }

async validateUser(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findById(id);
    
    if (!user.isActive) throw new UnauthorizedException(`User is inactive, talk with an admin`);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

revalidateToken(user: User): AuthResponse {

    const token = this.getJwtToken(user.id)

    return {token, user}
}
}
