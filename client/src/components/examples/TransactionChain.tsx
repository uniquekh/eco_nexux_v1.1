import { TransactionChain } from "../TransactionChain";

export default function TransactionChainExample() {
  const mockTransactions = [
    {
      txId: "tx_001_2024_001",
      previousTxId: null,
      status: "Manufactured",
      actorRole: "company" as const,
      actorId: "company_green_eco_ltd",
      timestamp: "2024-01-15T10:30:00Z",
      location: "Factory A, Building 2",
      hash: "a7f3c9e2b1d4f8e6c5a9b3d7e1f2c8a4b6d9e3f1c7a5b8d2e6f4c1a9b7d3e5f8"
    },
    {
      txId: "tx_001_2024_002",
      previousTxId: "tx_001_2024_001",
      status: "Sold",
      actorRole: "company" as const,
      actorId: "company_green_eco_ltd",
      timestamp: "2024-02-20T14:45:00Z",
      hash: "b3e1f9c7a5d2e8f4c6a1b9d7e3f5c2a8b4d6e9f1c3a7b5d8e2f6c4a9b1d7e3f5"
    },
    {
      txId: "tx_001_2024_003",
      previousTxId: "tx_001_2024_002",
      status: "Returned",
      actorRole: "customer" as const,
      actorId: "user_sarah_johnson",
      timestamp: "2024-08-10T16:20:00Z",
      location: "Customer App Registration",
      hash: "c5d7e3f1a9b2d8e6f4c2a7b5d9e1f3c8a4b6d2e9f7c1a5b3d8e6f2c4a1b9d7e3"
    },
    {
      txId: "tx_001_2024_004",
      previousTxId: "tx_001_2024_003",
      status: "Collected",
      actorRole: "admin" as const,
      actorId: "admin_pickup_agent_042",
      timestamp: "2024-08-12T09:15:00Z",
      location: "123 Oak Street, Downtown",
      hash: "d8f2c6a4b9e1d7f3c5a2b8d6e9f1c3a7b5d2e8f4c6a1b9d7e3f5c2a8b4d6e9f1"
    }
  ];

  return (
    <div className="p-6 max-w-4xl">
      <TransactionChain transactions={mockTransactions} />
    </div>
  );
}
