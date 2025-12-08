export interface Block {
    block_index: number;
    date: string;
    beneficiary_id: string;
    utp_number: string;
    transaction_id: string;
    amount: number;
    merkle_root: string;
    prev_hash: string;
    cur_hash: string;
}

export interface MonthlyBlock {
    block_index: number;
    date: string;
    num_disbursements: number;
    total_amount: number;
    merkle_root: string;
    prev_hash: string;
    cur_hash: string;
}
