import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    stats: {
      beneficiaries: 45000,
      disbursed: 250,
      avgTime: 72,
      satisfaction: 94
    },
    applications: [
      { id: 'NY-1001', name: 'Rekha Devi', status: 'approved', amount: '₹40,000' },
      { id: 'NY-1002', name: 'Ramesh Kumar', status: 'pending', amount: '₹25,000' },
      { id: 'NY-1003', name: 'Anita Singh', status: 'rejected', amount: '₹0' }
    ],
    transactions: [
      { title: 'DBT transfer to Rekha Devi', date: '2025-09-28', amount: '₹40,000', status: 'success' },
      { title: 'DBT transfer to Ramesh Kumar', date: '2025-09-26', amount: '₹25,000', status: 'pending' }
    ]
  };

  return NextResponse.json(data);
}
