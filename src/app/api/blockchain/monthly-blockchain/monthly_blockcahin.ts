import { Block, MonthlyBlock } from '../block';
import { sha256 } from '../merkleRoot';

async function computeHash(block: MonthlyBlock): Promise<string> {
    const idx = block.block_index;

    const blockString =
        String(idx) +
        String(block.date) +
        String(block.merkle_root) +
        String(block.prev_hash);

    return sha256(blockString);
}


async function createGenesisBlock(): Promise<MonthlyBlock> {
    const genesisBlock: MonthlyBlock = {
        block_index: 0,
        date: new Date().toISOString().split('T')[0],
        num_disbursements: 0,
        total_amount: 0,
        merkle_root: '',
        prev_hash: '0',
        cur_hash: ''
    };
    genesisBlock.cur_hash = await computeHash(genesisBlock);
    return genesisBlock;
}

export async function createNewBlock(prevBlock: MonthlyBlock, merkleRoot: string, numDisbursements: number, totalAmount: number): Promise<MonthlyBlock> {
    const newBlock: MonthlyBlock = {
        block_index: prevBlock.block_index + 1,
        date: new Date().toISOString().split('T')[0],
        num_disbursements: numDisbursements,
        total_amount: totalAmount,
        merkle_root: merkleRoot,
        prev_hash: prevBlock.cur_hash,
        cur_hash: ''
    };
    newBlock.cur_hash = await computeHash(newBlock);
    return newBlock;
}   

export async function isBlockValid(newBlock: MonthlyBlock, prevBlock: MonthlyBlock): Promise<boolean> {
    if (prevBlock.block_index + 1 !== newBlock.block_index) {
        return false;
    }
    if (prevBlock.cur_hash !== newBlock.prev_hash) {
        return false;
    }
    const computedHash = await computeHash(newBlock);
    if (computedHash !== newBlock.cur_hash) {
        return false;
    }
    return true;
}

export async function addBlockToChain(newBlock: MonthlyBlock, chain: MonthlyBlock[]): Promise<MonthlyBlock[]> {
    const prevBlock = chain[chain.length - 1];
    if (await isBlockValid(newBlock, prevBlock)) {
        chain.push(newBlock);
    }
    return chain;
}

export async function initializeBlockchain(): Promise<MonthlyBlock[]> {
    const genesisBlock = await createGenesisBlock();
    return [genesisBlock];
}

export async function getLatestBlock(chain: MonthlyBlock[]): Promise<MonthlyBlock> {
    return chain[chain.length - 1];
}
