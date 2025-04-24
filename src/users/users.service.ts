import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { SignupInput } from 'src/auth/dto/inputs/signup-input'
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {

  private logger = new Logger('UsersService')

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10)
      })
      return await this.userRepository.save(newUser)
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async findAll() {
    return [];
  }

  async findByEmail(email: string): Promise<User> {

    try {
      return await this.userRepository.findOneByOrFail({ email })

    } catch (error) {
      // this.handleDBErrors({
      //   code: 'error-001',
      //   detail: `${email} not found`
      // })
      throw new NotFoundException(`${email} not found`)

    }
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  async block(id: string) {
    return `This action removes a #${id} user`;
  }

  private handleDBErrors(error: any): never {

    if (error.code === '23505')
      throw new BadRequestException(error.detail.replace('Key ', ''))

    if (error.code === 'error-001')
      throw new BadRequestException(error.detail.replace('Key ', ''))

    this.logger.error(error)

    throw new InternalServerErrorException('Please check server logs')
  }
}
