import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { ChargeDto } from './dto/charge.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,

    @InjectRepository(Transaction)
    private transactionsRepo: Repository<Transaction>,

    private dataSource: DataSource,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getBalance(userId: number) {
    const cached = await this.cacheManager.get<number>(`user:${userId}:balance`);
    if (cached !== undefined && cached !== null) {
      return { balance: cached, source: 'cache' };
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.cacheManager.set(`user:${userId}:balance`, user.balance, 60);

    return { balance: user.balance, source: 'db' };
  }

  async charge(userId: number, dto: ChargeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new NotFoundException('User not found');

      if (user.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const tx = this.transactionsRepo.create({
        user_id: user.id,
        action: 'debit',
        amount: dto.amount,
        ts: new Date(),
      });

      await queryRunner.manager.save(tx);

      user.balance -= dto.amount;
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      await this.cacheManager.set(`user:${userId}:balance`, user.balance, 60);

      return {
        newBalance: user.balance,
        message: 'Balance updated',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async refill(userId: number, dto: ChargeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new NotFoundException('User not found');

      const tx = this.transactionsRepo.create({
        user_id: user.id,
        action: 'credit',
        amount: dto.amount,
        ts: new Date(),
      });

      await queryRunner.manager.save(tx);

      user.balance += dto.amount;
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      await this.cacheManager.set(`user:${userId}:balance`, user.balance, 60);

      return {
        newBalance: user.balance,
        message: 'Balance refilled',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const history = await this.transactionsRepo.find({
      where: { user_id: userId },
      order: { ts: 'DESC' },
    });

    return history;
  }
}