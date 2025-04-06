import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
    private usersService: UsersService,
  ) {}

  async process(userId: number, dto: CreateTransactionDto) {
    const currentBalance = await this.usersService.getCachedBalance(userId);

    const newBalance =
      dto.action === 'debit'
        ? currentBalance - dto.amount
        : currentBalance + dto.amount;

    if (newBalance < 0) {
      throw new BadRequestException('Not enough balance');
    }

    await this.txRepo.save({
      user_id: userId,
      action: dto.action,
      amount: dto.amount,
    });

    await this.usersService.updateBalance(userId, newBalance);
    return { newBalance };
  }
}
