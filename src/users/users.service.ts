import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const exists = await this.findByEmail(createUserDto.email);
    if (exists) {
      throw new BadRequestException('Email already exists');
    }
    const newUser = {
      id: this.users.length + 1,
      ...createUserDto,
      provider: createUserDto.provider || 'local',
    };
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  findByEmail(email: string): Promise<User | undefined> {
    const user = this.users.find((user) => user.email === email);
    return Promise.resolve(user);
  }
}
