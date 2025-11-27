import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Loader2, Search, Calendar, Building2, Tag, Layers, Box, DollarSign, Clock, AlertCircle, CheckCircle2, TrendingUp, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Product = {
  _id: string;
  TXN: string;
  company_email: string;
  product_name: string;
  category: string;
  material: string;
  size: string;
  batch_no: string;
  manufacture_date: string;
  rfid: string;
  created_at: string;
  price?: string;
  currentStatus?: string;
  customer_email?: string;
  pickup_requested_at?: string;
  status_updated_at?: string;
  collected_at?: string;
  recycled_at?: string;
};

export default function ProductDetails() {
  const [, params] = useRoute("/product/:rfid");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const urlRfid = params?.rfid;
  const [rfidInput, setRfidInput] = useState(urlRfid || "");
  const [searchRfid, setSearchRfid] = useState(urlRfid || "");

  const { data: productData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ["product_by_rfid", searchRfid],
    queryFn: async () => {
      if (!searchRfid) return null;
      return await api.getProductByRfid(searchRfid);
    },
    enabled: !!searchRfid,
    staleTime: 30000,
    retry: 1,
  });

  const product: Product | null = productData?.product || null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
      duration: 2000,
    });
  };

  const getProductAge = (date: string) => {
    const now = new Date();
    const mfgDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - mfgDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days old`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months old`;
    return `${Math.floor(diffDays / 365)} years old`;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending Pickup":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending Pickup</Badge>;
      case "Collected":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300"><Package className="w-3 h-3 mr-1" />Collected</Badge>;
      case "Processing":
        return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-300"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case "Recycled":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Recycled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleSearch = () => {
    if (!rfidInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter an RFID",
        variant: "destructive",
      });
      return;
    }
    setSearchRfid(rfidInput.trim());
    setLocation(`/product/${rfidInput.trim()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (productLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          data-testid="button-back"
          className="hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* RFID Search Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-primary" />
            Track Product by RFID
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the RFID code to view complete product information and lifecycle
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter RFID (e.g., TMDS0EA0HK)"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="flex-1 font-mono text-base"
            />
            <Button 
              onClick={handleSearch} 
              disabled={!rfidInput.trim()}
              size="lg"
              className="px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {productError && searchRfid && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-destructive mb-2">Product Not Found</h3>
            <p className="text-muted-foreground mb-4">
              No product exists with RFID code:
            </p>
            <code className="font-mono bg-muted px-4 py-2 rounded-md text-sm border">
              {searchRfid}
            </code>
            <p className="text-sm text-muted-foreground mt-4">
              Please verify the RFID code and try again
            </p>
          </CardContent>
        </Card>
      )}

      {/* Product Found */}
      {product && (
        <>
          {/* Product Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight" data-testid="text-product-name">
                  {product.product_name}
                </h1>
                <p className="text-muted-foreground">
                  {product.category} • {product.material}
                </p>
              </div>
              {product.currentStatus && (
                <div className="flex items-center gap-2">
                  {getStatusBadge(product.currentStatus)}
                </div>
              )}
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-all">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" /> RFID
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono font-semibold" data-testid="text-product-code">
                    {product.rfid}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(product.rfid, "RFID")}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-all">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Age
                </div>
                <div className="text-sm font-semibold">{getProductAge(product.manufacture_date)}</div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-all">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Transaction ID
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-semibold truncate" title={product.TXN}>
                    {product.TXN?.substring(0, 12)}...
                  </code>
                  <button 
                    onClick={() => copyToClipboard(product.TXN, "TXN ID")}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>

              {product.price && (
                <div className="p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-all">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Price
                  </div>
                  <div className="text-sm font-semibold">₹{parseFloat(product.price).toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Details */}
            <div className="lg:col-span-1 space-y-4">
              {/* Transaction ID Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-primary" />
                    Transaction Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5 font-medium">Transaction ID</div>
                    <div className="flex items-center gap-2 p-2 bg-background rounded border">
                      <code className="text-xs font-mono flex-1 break-all">{product.TXN}</code>
                      <button 
                        onClick={() => copyToClipboard(product.TXN, "Transaction ID")}
                        className="p-1 hover:bg-muted rounded flex-shrink-0"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5 font-medium">Internal ID</div>
                    <code className="text-xs font-mono text-muted-foreground break-all">{product._id}</code>
                  </div>
                </CardContent>
              </Card>

              {/* Product Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Box className="w-5 h-5" />
                    Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">Category</span>
                    </div>
                    <span className="font-medium text-sm capitalize">{product.category}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm">Material</span>
                    </div>
                    <span className="font-medium text-sm capitalize">{product.material}</span>
                  </div>

                  {product.size && (
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Box className="w-4 h-4" />
                        <span className="text-sm">Size</span>
                      </div>
                      <span className="font-medium text-sm uppercase">{product.size}</span>
                    </div>
                  )}

                  {product.batch_no && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Batch</span>
                      </div>
                      <code className="font-mono text-sm font-medium">{product.batch_no}</code>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manufacturing Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-5 h-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5 font-medium">Manufactured</div>
                    <div className="font-medium">
                      {new Date(product.manufacture_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{getProductAge(product.manufacture_date)}</div>
                  </div>

                  {product.pickup_requested_at && (
                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-1.5 font-medium">Pickup Requested</div>
                      <div className="text-sm">
                        {new Date(product.pickup_requested_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}

                  {product.collected_at && (
                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-1.5 font-medium">Collected</div>
                      <div className="text-sm">
                        {new Date(product.collected_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}

                  {product.recycled_at && (
                    <div className="pt-3 border-t bg-green-500/5 -mx-4 -mb-4 px-4 py-4 rounded-b">
                      <div className="text-xs text-green-700 dark:text-green-400 mb-1.5 font-medium">Recycled</div>
                      <div className="text-sm font-medium text-green-700 dark:text-green-400">
                        {new Date(product.recycled_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manufacturer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="w-5 h-5" />
                    Manufacturer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">Company</div>
                      <div className="font-medium text-sm break-all">{product.company_email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {product.customer_email && (
                <Card className="border-blue-200/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium mb-1 text-sm">Customer</div>
                        <p className="text-sm text-muted-foreground break-all">{product.customer_email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Lifecycle Overview */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Product Lifecycle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Status Timeline */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                          <div className="w-0.5 h-12 bg-muted my-2"></div>
                        </div>
                        <div className="pt-1">
                          <div className="font-medium text-sm">Manufactured</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(product.manufacture_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                          <div className="w-0.5 h-12 bg-muted my-2"></div>
                        </div>
                        <div className="pt-1">
                          <div className="font-medium text-sm">Registered</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(product.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {product.pickup_requested_at && (
                        <>
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5"></div>
                              <div className="w-0.5 h-12 bg-muted my-2"></div>
                            </div>
                            <div className="pt-1">
                              <div className="font-medium text-sm">Pickup Requested</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(product.pickup_requested_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {product.collected_at && (
                        <>
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5"></div>
                              <div className="w-0.5 h-12 bg-muted my-2"></div>
                            </div>
                            <div className="pt-1">
                              <div className="font-medium text-sm">Collected</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(product.collected_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {product.recycled_at && (
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-green-600 mt-1.5"></div>
                          </div>
                          <div className="pt-1">
                            <div className="font-medium text-sm">Recycled</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(product.recycled_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Summary */}
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground mb-1">Current Status</div>
                          <div className="font-medium">{product.currentStatus || "Active"}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground mb-1">Product Age</div>
                          <div className="font-medium">{getProductAge(product.manufacture_date)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}