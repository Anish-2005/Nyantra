import { Block } from './block';
import { sha256 } from './merkleRoot';

async function computeHash(block: Block): Promise<string> {
    const idx = block.block_index;

    const blockString =
        String(idx) +
        String(block.date) +
        String(block.merkle_root) +
        String(block.prev_hash);

    return sha256(blockString);
}

async function createGenesisBlock(): Promise<Block> {
    const genesisBlock: Block = {
        block_index: 0,
        date: new Date().toISOString().split('T')[0],
        beneficiary_id: '',
        utp_number: '',
        transaction_id: '',
        amount: 0,
        merkle_root: '',
        prev_hash: '0',
        cur_hash: ''
    };
    genesisBlock.cur_hash = await computeHash(genesisBlock);
    return genesisBlock;
}

export async function createNewBlock(
    prevBlock: Block,
    merkleRoot: string,
    beneficiary_id: string,
    utp_number: string,
    transaction_id: string,
    amount: number
): Promise<Block> {
    const newBlock: Block = {
        block_index: prevBlock.block_index + 1,
        date: new Date().toISOString().split('T')[0],
        beneficiary_id,
        utp_number,
        transaction_id,
        amount,
        merkle_root: merkleRoot,
        prev_hash: prevBlock.cur_hash,
        cur_hash: ''
    };
    newBlock.cur_hash = await computeHash(newBlock);
    return newBlock;
}

export async function isBlockValid(newBlock: Block, prevBlock: Block): Promise<boolean> {
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

export async function addBlockToChain(newBlock: Block, chain: Block[]): Promise<Block[]> {
    const prevBlock = chain[chain.length - 1];
    if (await isBlockValid(newBlock, prevBlock)) {
        chain.push(newBlock);
    }
    return chain;
}

export async function initializeBlockchain(): Promise<Block[]> {
    const genesisBlock = await createGenesisBlock();
    return [genesisBlock];
}

export async function getLatestBlock(chain: Block[]): Promise<Block> {
    return chain[chain.length - 1];
}
