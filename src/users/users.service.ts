import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  async getUser(id: number): Promise<User> {
    return this.userRepo.findOneByOrFail({ id });
  }

  async getCachedBalance(userId: number): Promise<number> {
    const cacheKey = `user:${userId}:balance`;
    const cached = await this.cache.get<number>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const user = await this.getUser(userId);
    const balance = Number(user.balance);
    await this.cache.set(cacheKey, balance, 60_000);
    return balance;
  }

  async updateBalance(userId: number, balance: number) {
    await this.userRepo.update({ id: userId }, { balance });
    await this.cache.set(`user:${userId}:balance`, balance, 60_000);
  }
}
