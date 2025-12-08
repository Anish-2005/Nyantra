import { NextResponse } from 'next/server';
import { getMonthlyBlockchain, addMonthlyBlock } from '../../blockchainClient';

const data = [
    { id: 'TEST_TXN001', amount: 7500 },
    { id: 'TEST_TXN002', amount: 4000 },
    { id: 'TEST_TXN003', amount: 2000 }
]
export async function GET() {
    try {
        console.log('=== Testing Monthly Blockchain Endpoint ===\n');

        // Test 1: Get monthly blockchain
        console.log('1. Testing GET /api/blockchain/monthly-blockchain');
        const getResult = await getMonthlyBlockchain();
        console.log('Status:', getResult.status);
        console.log('Chain length:', getResult.chain?.length || 0);

        // Test 2: Add block
        console.log('\n2. Testing POST /api/blockchain/monthly-blockchain');
        const addResult = await addMonthlyBlock(data);
        console.log('Status:', addResult.status);
        console.log('Block added:', addResult.block?.block_index);

        // Test 3: Get updated monthly blockchain
        console.log('\n3. Testing GET /api/blockchain/monthly-blockchain (after adding block)');
        const finalResult = await getMonthlyBlockchain();
        console.log('Status:', finalResult.status);
        console.log('Chain length:', finalResult.chain?.length || 0);
        console.log('Chain integrity:', finalResult.chainIntegrity);

        return NextResponse.json({
            status: 'success',
            message: 'Monthly blockchain tests completed',
            tests: [
                {
                    name: 'Get monthly blockchain',
                    status: getResult.status,
                    chainLength: getResult.chain?.length || 0
                },
                {
                    name: 'Add monthly block',
                    status: addResult.status,
                    blockIndex: addResult.block?.block_index,
                    numDisbursements: addResult.block?.num_disbursements,
                    totalAmount: addResult.block?.total_amount
                },
                {
                    name: 'Get monthly blockchain after add',
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
