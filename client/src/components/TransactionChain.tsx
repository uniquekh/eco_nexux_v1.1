import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Copy, Link2 } from "lucide-react";
import { useState } from "react";

interface Transaction {
  txId: string;
  previousTxId: string | null;
  status: string;
  actorRole: "company" | "customer" | "admin";
  actorId: string;
  timestamp: string;
  location?: string;
  hash: string;
}

interface TransactionChainProps {
  transactions: Transaction[];
}

export function TransactionChain({ transactions }: TransactionChainProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Transaction Chain (Blockchain-Like)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {transactions.map((tx, index) => (
            <AccordionItem value={tx.txId} key={tx.txId}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {transactions.length - index}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-medium text-sm">{tx.status}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize flex-shrink-0">
                    {tx.actorRole}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Transaction ID</div>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">
                      {tx.txId}
                    </code>
                  </div>
                  {tx.previousTxId && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Previous Transaction</div>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">
                        {tx.previousTxId}
                      </code>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Actor ID</div>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all">
                      {tx.actorId}
                    </code>
                  </div>
                  {tx.location && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Location</div>
                      <div className="text-sm">{tx.location}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                      <span>Computed Hash (SHA256)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => copyHash(tx.hash)}
                        data-testid={`button-copy-hash-${tx.txId}`}
                      >
                        {copiedHash === tx.hash ? (
                          <span className="text-xs">Copied!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded block break-all text-primary">
                      {tx.hash}
                    </code>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
