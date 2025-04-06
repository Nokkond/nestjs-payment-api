import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let usersService: Partial<UsersService>;
  let txRepo: Partial<Repository<Transaction>>;

  beforeEach(async () => {
    usersService = {
      getCachedBalance: jest.fn().mockResolvedValue(150),
      updateBalance: jest.fn(),
    };

    txRepo = {
      save: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: UsersService, useValue: usersService },
        { provide: getRepositoryToken(Transaction), useValue: txRepo },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should debit correctly', async () => {
    const result = await service.process(1, {
      action: 'debit',
      amount: 50,
    });
    expect(result.newBalance).toBe(100);
  });

  it('should throw if not enough balance', async () => {
    await expect(
      service.process(1, { action: 'debit', amount: 200 }),
    ).rejects.toThrow('Not enough balance');
  });
});
