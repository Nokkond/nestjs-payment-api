export interface ITransactionData {
    action: 'debit' | 'credit';
    amount: number;
}