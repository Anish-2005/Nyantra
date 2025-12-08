import { NextResponse } from 'next/server';
import { loadChain, saveChain } from './storage';
import { merkleRoot } from './merkleRoot';
import { Block } from './block';
import { createNewBlock, isBlockValid, addBlockToChain, initializeBlockchain, getLatestBlock } from './blockchain';
import path from 'path';

interface BlockchainResponse {
    status: 'success' | 'error';
    message: string;
    isValid?: boolean;
    block?: Block;
    chain?: Block[];
    chainIntegrity?: boolean;
}

const FILE = path.join(process.cwd(), "src/app/api/blockchain/chain.json");

async function verifyChainIntegrity(chain: Block[]): Promise<boolean> {
    if (chain.length === 0) return true;

    for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        if (!(await isBlockValid(currentBlock, previousBlock))) {
            return false;
        }
    }

    return true;
}

export async function GET(): Promise<NextResponse<BlockchainResponse>> {
    try {
        const chainData = await loadChain(FILE);
        const chain = (Array.isArray(chainData) ? chainData : []) as Block[];

        if (chain.length === 0) {
            const initialChain = await initializeBlockchain();
            await saveChain(FILE, initialChain);
            return NextResponse.json({
                status: 'success',
                message: 'Blockchain initialized with genesis block',
                chain: initialChain
            });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Blockchain retrieved successfully',
            chain
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to retrieve blockchain'
            },
            { status: 500 }
        );
    }
}

// POST: Add new data to blockchain
export async function POST(request: Request): Promise<NextResponse<BlockchainResponse>> {
    try {
        const body = await request.json();
        const { transactions } = body;

        if (!transactions || transactions.length === 0) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Transactions required to create block'
                },
                { status: 400 }
            );
        }

        const chainData = await loadChain(FILE);
        let chain = (Array.isArray(chainData) ? chainData : []) as Block[];

        // Initialize blockchain if empty
        if (chain.length === 0) {
            chain = await initializeBlockchain();
        }

        // Verify chain integrity before adding
        const isIntact = await verifyChainIntegrity(chain);
        if (!isIntact) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Blockchain has been tampered with. Cannot add new block.',
                    chainIntegrity: false
                },
                { status: 400 }
            );
        }

        // Calculate merkle root from transactions
        const root = await merkleRoot(transactions);
        if (!root) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Failed to calculate merkle root'
                },
                { status: 400 }
            );
        }

        // Get latest block
        const latestBlock = await getLatestBlock(chain);

        // Extract transaction details from first transaction
        const firstTx = transactions[0];
        const beneficiary_id = firstTx.beneficiary_id || '';
        const utp_number = firstTx.utp_number || '';
        const transaction_id = firstTx.transaction_id || firstTx.id || '';
        const amount = firstTx.amount || 0;

        // Create new block
        const newBlock = await createNewBlock(
            latestBlock,
            root,
            beneficiary_id,
            utp_number,
            transaction_id,
            amount
        );

        // Add block to chain
        chain = await addBlockToChain(newBlock, chain);

        // Save updated chain
        await saveChain(FILE, chain);

        return NextResponse.json({
            status: 'success',
            message: 'Block added successfully to blockchain',
            block: newBlock,
            chain,
            chainIntegrity: true
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
