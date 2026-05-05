import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);
    return this.userRepo.save(user);
  }

  async getUsers() {
    return this.userRepo.find();
  }

  async getUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async removeUser(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { message: 'User deleted' };
  }
}
