import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from 'src/users/users.service';
import { LoginInput, SignupInput } from './dto/inputs';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService
    ){}

    async signup(signupInput: SignupInput): Promise<AuthResponse> {
        const user = await this.usersService.create(signupInput)
        const token = 'avc'

        return {
            token,
            user
        }
    }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const {email, password} = loginInput
        const user = await this.usersService.findByEmail(email)

        if(!bcrypt.compareSync(password, user.password)) {
            throw new BadRequestException('Email / Password do not match')
        }

        const token = 'abc123'

        return {
            token,
            user
        }
    }
}
