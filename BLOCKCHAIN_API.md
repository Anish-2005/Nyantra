# Nyantara Blockchain API Documentation

## Overview

The Nyantara blockchain implementation provides an immutable, tamper-proof ledger system for tracking Direct Benefit Transfer (DBT) disbursements under the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989. The blockchain ensures transparency, accountability, and auditability of all financial transactions in the relief fund distribution process.

## Architecture

### Core Components

#### 1. **Block Structure**
```typescript
interface Block {
    block_index: number;        // Sequential block number
    date: string;              // Block creation date (YYYY-MM-DD)
    beneficiary_id: string;    // Beneficiary identifier
    utp_number: string;        // UTP (Unique Transaction Protocol) number
    transaction_id: string;    // Transaction reference ID
    amount: number;            // Disbursement amount
    merkle_root: string;       // Merkle root of transaction data
    prev_hash: string;         // Hash of previous block
    cur_hash: string;          // Current block hash
}
```

#### 2. **Monthly Block Structure**
```typescript
interface MonthlyBlock {
    block_index: number;       // Sequential block number
    date: string;              // Block creation date
    num_disbursements: number; // Number of disbursements in month
    total_amount: number;      // Total amount disbursed
    merkle_root: string;       // Merkle root of monthly data
    prev_hash: string;         // Hash of previous block
    cur_hash: string;          // Current block hash
}
```

## API Endpoints

### Main Blockchain API (`/api/blockchain`)

#### **GET** - Retrieve Blockchain
**Purpose**: Fetches the entire blockchain or initializes it if empty.

**Response**:
```json
{
    "status": "success",
    "message": "Blockchain retrieved successfully",
    "chain": [Block[]]
}
```

**Initialization**: If no blockchain exists, automatically creates a genesis block.

#### **POST** - Add New Block
**Purpose**: Adds a new block containing disbursement transactions to the blockchain.

**Request Body**:
```json
{
    "transactions": [
        {
            "beneficiary_id": "BEN001",
            "utp_number": "UTP202412001",
            "transaction_id": "TXN202412001234",
            "amount": 25000,
            "timestamp": "2024-12-14T10:30:00Z"
        }
    ]
}
```

**Response**:
```json
{
    "status": "success",
    "message": "Block added successfully to blockchain",
    "block": Block,
    "chain": Block[],
    "chainIntegrity": true
}
```

### Monthly Blockchain API (`/api/blockchain/monthly-blockchain`)

#### **GET** - Retrieve Monthly Blockchain
**Purpose**: Fetches the monthly aggregated blockchain data.

#### **POST** - Add Monthly Block
**Purpose**: Creates monthly summary blocks containing aggregated disbursement data.

## Cryptographic Implementation

### Hash Function
- **Algorithm**: SHA-256
- **Purpose**: Creates unique identifiers for blocks and ensures data integrity
- **Implementation**: Node.js crypto module

### Merkle Tree
- **Purpose**: Efficiently verify large datasets with minimal data
- **Structure**: Binary tree where leaf nodes contain transaction data
- **Root**: Single hash representing all transactions in a block

**Merkle Root Calculation**:
```typescript
export async function merkleRoot(leaves: BlockData[]): Promise<string | null> {
    // Convert transactions to leaf hashes
    let currentLevel = await Promise.all(leaves.map(async leaf =>
        await sha256(await encodeData(leaf))
    ));

    // Build tree by hashing pairs
    while (currentLevel.length > 1) {
        const nextLevel: string[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = currentLevel[i + 1] ?? left; // Duplicate if odd number
            nextLevel.push(await sha256(left + right));
        }
        currentLevel = nextLevel;
    }

    return currentLevel[0]; // Root hash
}
```

## Block Creation Process

### 1. **Transaction Collection**
- Gather disbursement transactions for a specific period
- Validate transaction data integrity
- Sort transactions deterministically

### 2. **Merkle Root Generation**
- Create leaf nodes from transaction data
- Build Merkle tree structure
- Calculate root hash

### 3. **Block Assembly**
```typescript
const newBlock = {
    block_index: prevBlock.block_index + 1,
    date: new Date().toISOString().split('T')[0],
    beneficiary_id: firstTransaction.beneficiary_id,
    utp_number: firstTransaction.utp_number,
    transaction_id: firstTransaction.transaction_id,
    amount: firstTransaction.amount,
    merkle_root: calculatedMerkleRoot,
    prev_hash: prevBlock.cur_hash,
    cur_hash: '' // To be calculated
};
```

### 4. **Hash Calculation**
- Combine all block fields (except cur_hash)
- Apply SHA-256 hashing
- Set cur_hash field

### 5. **Chain Integration**
- Validate block against previous block
- Append to blockchain
- Persist to storage

## Security Features

### Chain Integrity Verification
```typescript
async function verifyChainIntegrity(chain: Block[]): Promise<boolean> {
    for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        // Verify sequential indexing
        if (previousBlock.block_index + 1 !== currentBlock.block_index) {
            return false;
        }

        // Verify hash linkage
        if (previousBlock.cur_hash !== currentBlock.prev_hash) {
            return false;
        }

        // Verify current block hash
        const computedHash = await computeHash(currentBlock);
        if (computedHash !== currentBlock.cur_hash) {
            return false;
        }
    }
    return true;
}
```

### Tamper Detection
- **Hash Verification**: Any data change invalidates block hash
- **Chain Linkage**: Broken prev_hash/cur_hash chain indicates tampering
- **Merkle Tree**: Efficient verification of transaction integrity

## Access Control

### Weekly Access Key System
- **Purpose**: Restrict blockchain dashboard access to authorized personnel
- **Generation**: Deterministic key based on current week number
- **Format**: 8-character alphanumeric string
- **Validity**: 7 days from unlock time
- **Storage**: LocalStorage with expiration checking

```typescript
const generateWeeklyKey = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );

    const baseString = `${now.getFullYear()}W${weekNumber}NYANTRA`;
    // Hash generation logic...
    return result; // 8-character key
};
```

## Data Persistence

### Storage Mechanism
- **Format**: JSON file storage (`chain.json`, `monthly-chain.json`)
- **Location**: Server-side file system
- **Backup**: Automatic saving after each block addition
- **Recovery**: Chain integrity verification on load

### File Structure
```
src/app/api/blockchain/
├── chain.json              # Main blockchain data
├── monthly-blockchain/
│   └── monthly-chain.json  # Monthly aggregated data
└── storage.ts             # Persistence utilities
```

## Integration Points

### Disbursement System Integration
- **Trigger**: Automatic block creation on successful disbursement
- **Data Source**: Firebase Firestore disbursement records
- **Validation**: Pre-verification of transaction data
- **Error Handling**: Rollback on blockchain addition failure

### Dashboard Integration
- **Real-time Updates**: Live blockchain state monitoring
- **Visualization**: Chain view with block details
- **Audit Trail**: Complete transaction history
- **Export**: Blockchain data export capabilities

## Performance Considerations

### Scalability
- **Merkle Trees**: O(log n) verification complexity
- **Hash Functions**: Fast SHA-256 computation
- **Storage**: Efficient JSON serialization
- **Memory**: Streaming processing for large chains

### Optimization Strategies
- **Lazy Loading**: Load blockchain data on demand
- **Caching**: Cache computed hashes and merkle roots
- **Batch Processing**: Group transactions for efficiency
- **Compression**: Potential future data compression

## Error Handling

### Validation Errors
- **Empty Transactions**: Reject blocks without transaction data
- **Invalid Data**: Schema validation for all block fields
- **Chain Corruption**: Automatic detection and prevention of invalid blocks
- **Hash Mismatches**: Cryptographic verification failures

### Recovery Mechanisms
- **Genesis Block**: Automatic creation if chain is empty
- **Integrity Checks**: Continuous chain validation
- **Backup Creation**: Maintain chain snapshots
- **Rollback Support**: Ability to revert invalid blocks

## Future Enhancements

### Planned Features
- **Multi-signature Blocks**: Enhanced security with multiple approvals
- **Interoperability**: Cross-chain transaction verification
- **Zero-knowledge Proofs**: Privacy-preserving transaction validation
- **Smart Contracts**: Automated disbursement logic
- **Distributed Consensus**: Multi-node blockchain network

### Performance Improvements
- **Database Integration**: Migrate from file-based to database storage
- **Caching Layer**: Redis integration for faster access
- **Compression**: Data compression for storage efficiency
- **Parallel Processing**: Concurrent block validation

## Compliance & Standards

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **Access Logging**: Complete audit trail of blockchain access
- **Privacy**: Minimal data collection in block headers
- **Retention**: Configurable data retention policies

### Regulatory Compliance
- **GDPR**: Data minimization and consent management
- **Audit Requirements**: Immutable transaction records
- **Transparency**: Public verifiability of fund distribution
- **Accountability**: Clear chain of custody for disbursements

## Monitoring & Analytics

### Key Metrics
- **Block Count**: Total number of blocks in chain
- **Transaction Volume**: Total disbursements recorded
- **Chain Integrity**: Percentage of successful validations
- **Performance**: Block creation and validation times

### Alerting
- **Integrity Violations**: Immediate alerts on chain tampering
- **Performance Degradation**: Monitoring of processing times
- **Storage Issues**: Disk space and file system monitoring
- **Access Anomalies**: Unusual access patterns detection

## Conclusion

The Nyantara blockchain API provides a robust, secure, and transparent system for tracking Direct Benefit Transfer disbursements. By implementing cryptographic hashing, Merkle trees, and immutable ledger principles, it ensures that every rupee disbursed under the relief fund can be traced, verified, and audited, promoting accountability and trust in the social welfare system.

The dual-layer approach (transaction-level and monthly aggregation) provides both granular transaction tracking and efficient summary reporting, making it suitable for both detailed audits and high-level oversight of the DBT program implementation.</content>
<parameter name="filePath">c:\Users\ANISH\Documents\PROJECTS\Nyantara\BLOCKCHAIN_API.md