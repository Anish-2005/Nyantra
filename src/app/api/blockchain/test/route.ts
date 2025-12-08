import { NextResponse } from 'next/server';
import { getBlockchain, addBlock } from '../blockchainClient';

const transactionExample = {
    beneficiary_id: 'TEST_B002',
    utp_number: 'TEST_UTP002',
    transaction_id: 'TEST_TXN002',
    amount: 10000
};  

export async function GET() {
    try {
        console.log('=== Testing Blockchain Endpoint ===\n');

        // Test 1: Get blockchain
        console.log('1. Testing GET /api/blockchain');
        const getResult = await getBlockchain();
        console.log('Status:', getResult.status);
        console.log('Chain length:', getResult.chain?.length || 0);

        // Test 2: Add block
        console.log('\n2. Testing POST /api/blockchain');
        const addResult = await addBlock([
            transactionExample,
        ]);
        console.log('Status:', addResult.status);
        console.log('Block added:', addResult.block?.block_index);

        // Test 3: Get updated blockchain
        console.log('\n3. Testing GET /api/blockchain (after adding block)');
        const finalResult = await getBlockchain();
        console.log('Status:', finalResult.status);
        console.log('Chain length:', finalResult.chain?.length || 0);
        console.log('Chain integrity:', finalResult.chainIntegrity);

        return NextResponse.json({
            status: 'success',
            message: 'Blockchain tests completed',
            tests: [
                {
                    name: 'Get blockchain',
                    status: getResult.status,
                    chainLength: getResult.chain?.length || 0
                },
                {
                    name: 'Add block',
                    status: addResult.status,
                    blockIndex: addResult.block?.block_index
                },
                {
                    name: 'Get blockchain after add',
                    status: finalResult.status,
                    chainLength: finalResult.chain?.length || 0,
                    chainIntegrity: finalResult.chainIntegrity
                }
            ]
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Test failed'
            },
            { status: 500 }
        );
    }
}
