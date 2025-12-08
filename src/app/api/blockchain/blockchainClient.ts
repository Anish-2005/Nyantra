const API_URL = 'http://localhost:3000/api/blockchain';

// Get blockchain
export async function getBlockchain() {
    const response = await fetch(API_URL);
    return response.json();
}

// Add block to blockchain
export async function addBlock(transactions: any[]) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
    });
    return response.json();
}

// Get monthly blockchain
export async function getMonthlyBlockchain() {
    const response = await fetch(`${API_URL}/monthly-blockchain`);
    return response.json();
}

// Add block to monthly blockchain
export async function addMonthlyBlock(transactions: any[]) {
    const response = await fetch(`${API_URL}/monthly-blockchain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
    });
    return response.json();
}
