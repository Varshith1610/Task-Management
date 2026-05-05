import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: body.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(body.password, 12);
    const user = this.userRepo.create({ ...body, password: hashed });
    await this.userRepo.save(user);

    const { password, ...result } = user;
    return {
      user: result,
      token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }

  async login(body: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: body.email },
      select: ['id', 'email', 'name', 'password'],
    });
    console.log(user, 'user');

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password, ...result } = user;
    return {
      user: result,
      token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }
}
