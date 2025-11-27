// // import { useQuery, useMutation } from "@tanstack/react-query";
// // import { apiRequest, queryClient } from "@/lib/queryClient";
// // import { StatsCard } from "@/components/StatsCard";
// // import { PickupRequestCard } from "@/components/PickupRequestCard";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Badge } from "@/components/ui/badge";
// // import { Building2, TruckIcon, Package, Recycle, CheckCircle2, AlertCircle, Loader2, Clock, ArrowRight } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { useState } from "react";

// // type Company = {
// //   id: number;
// //   email: string;
// //   companyName: string;
// //   registrationNumber: string;
// //   verified: boolean;
// // };

// // type Product = {
// //   _id: string;
// //   TXN?: string;
// //   company_email: string;
// //   product_name: string;
// //   category: string;
// //   material: string;
// //   size: string;
// //   batch_no: string;
// //   manufacture_date: string;
// //   rfid: string;
// //   created_at: string;
// //   price?: number;
// //   added_at?: string;
// //   currentStatus?: string;
// //   customer_email?: string;
// //   pickup_requested_at?: string;
// //   collected_at?: string;
// //   processing_started_at?: string;
// //   recycled_at?: string;
// // };

// // type PickupRequest = {
// //   id: number;
// //   requestId: string;
// //   productIds: string[];
// //   products?: Product[];
// //   customerName: string;
// //   customerEmail: string;
// //   location: string;
// //   preferredDate?: string;
// //   status: string;
// //   assignedAgentName?: string;
// // };

// // type Stats = {
// //   pendingVerifications: number;
// //   activePickups: number;
// //   inventoryCount: number;
// //   batchesSent: number;
// // };

// // export default function AdminDashboard() {
// //   const { toast } = useToast();
// //   const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
// //   const [loadingRecyclingProducts, setLoadingRecyclingProducts] = useState<Set<string>>(new Set());

// //   const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
// //     queryKey: ['/api/admin/companies'],
// //   });

// //   const { data: pickups = [], isLoading: pickupsLoading } = useQuery<PickupRequest[]>({
// //     queryKey: ['/api/pickups'],
// //   });

// //   const { data: pendingPickupProducts = [], isLoading: pendingProductsLoading } = useQuery<Product[]>({
// //     queryKey: ['pending_pickup_products'],
// //     queryFn: async () => {
// //       const res = await fetch("https://api-hack-virid.vercel.app/all_products");
// //       if (!res.ok) throw new Error("Failed to load products");
// //       const data = await res.json();
// //       return data.products.filter((p: Product) => p.currentStatus === "Pending Pickup");
// //     },
// //   });

// //   const { data: inventoryProducts = [], isLoading: inventoryLoading } = useQuery<Product[]>({
// //     queryKey: ['inventory_products'],
// //     queryFn: async () => {
// //       const res = await fetch("https://api-hack-virid.vercel.app/all_products");
// //       if (!res.ok) throw new Error("Failed to load products");
// //       const data = await res.json();
// //       return data.products.filter((p: Product) => 
// //         p.currentStatus === "Collected" || p.currentStatus === "Processing"
// //       );
// //     },
// //   });

// //   const { data: batchProducts = [], isLoading: batchesLoading } = useQuery<Product[]>({
// //     queryKey: ['batch_products'],
// //     queryFn: async () => {
// //       const res = await fetch("https://api-hack-virid.vercel.app/all_products");
// //       if (!res.ok) throw new Error("Failed to load products");
// //       const data = await res.json();
// //       return data.products.filter((p: Product) => p.currentStatus === "Recycled");
// //     },
// //   });

// //   // Calculate stats from all products
// //   const stats = {
// //     pendingVerifications: companies.filter(c => !c.verified).length,
// //     activePickups: pendingPickupProducts.length,
// //     inventoryCount: inventoryProducts.length,
// //     batchesSent: batchProducts.length,
// //   };

// //   const verifyCompanyMutation = useMutation({
// //     mutationFn: async ({ id, verified }: { id: number; verified: boolean }) => {
// //       const res = await apiRequest("PATCH", `/api/admin/companies/${id}/verify`, { verified });
// //       return await res.json();
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['/api/admin/companies'] });
// //       toast({
// //         title: "Success",
// //         description: "Company verification updated",
// //       });
// //     },
// //     onError: (error: any) => {
// //       toast({
// //         title: "Error",
// //         description: error.message || "Failed to update verification",
// //         variant: "destructive",
// //       });
// //     },
// //   });

// //   const collectProductsMutation = useMutation({
// //     mutationFn: async (products: Product[]) => {
// //       const updatePromises = products.map(product =>
// //         fetch("https://api-hack-virid.vercel.app/update_product_status", {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             rfid: product.rfid,
// //             status: "Collected",
// //             email: product.customer_email || "admin@system.com",
// //           }),
// //         })
// //       );
// //       await Promise.all(updatePromises);
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ['pending_pickup_products'] });
// //       queryClient.invalidateQueries({ queryKey: ['inventory_products'] });
// //       setSelectedProducts([]);
// //       toast({
// //         title: "Success",
// //         description: "Products marked as collected",
// //       });
// //     },
// //     onError: (error: any) => {
// //       toast({
// //         title: "Error",
// //         description: error.message || "Failed to collect products",
// //         variant: "destructive",
// //       });
// //     },
// //   });

// //   const batchProcessMutation = useMutation({
// //     mutationFn: async ({ products, status }: { products: Product[]; status: string }) => {
// //       const updatePromises = products.map(product =>
// //         fetch("https://api-hack-virid.vercel.app/update_product_status", {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             rfid: product.rfid,
// //             status: status,
// //             email: product.customer_email || "admin@system.com",
// //           }),
// //         })
// //       );
// //       await Promise.all(updatePromises);
// //     },
// //     onSuccess: (_, variables) => {
// //       queryClient.invalidateQueries({ queryKey: ['inventory_products'] });
// //       setSelectedProducts([]);
// //       toast({
// //         title: "Success",
// //         description: `Products moved to ${variables.status} status`,
// //       });
// //     },
// //     onError: (error: any) => {
// //       toast({
// //         title: "Error",
// //         description: error.message || "Failed to process batch",
// //         variant: "destructive",
// //       });
// //     },
// //   });

// //   const handleSendToRecycling = async (product: Product) => {
// //     setLoadingRecyclingProducts(prev => new Set(prev).add(product.rfid));
// //     try {
// //       const res = await fetch("https://api-hack-virid.vercel.app/update_product_status", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           rfid: product.rfid,
// //           status: "Recycled",
// //           email: product.customer_email || "admin@system.com",
// //         }),
// //       });
// //       if (!res.ok) throw new Error("Failed to send product to recycling");
      
// //       queryClient.invalidateQueries({ queryKey: ['inventory_products'] });
// //       queryClient.invalidateQueries({ queryKey: ['batch_products'] });
// //       toast({
// //         title: "Success",
// //         description: "Product sent to recycling unit",
// //       });
// //     } catch (error: any) {
// //       toast({
// //         title: "Error",
// //         description: error.message || "Failed to send to recycling",
// //         variant: "destructive",
// //       });
// //     } finally {
// //       setLoadingRecyclingProducts(prev => {
// //         const newSet = new Set(prev);
// //         newSet.delete(product.rfid);
// //         return newSet;
// //       });
// //     }
// //   };

// //   const handleCollectSelected = () => {
// //     const productsToCollect = pendingPickupProducts.filter(p => 
// //       selectedProducts.includes(p.rfid)
// //     );
// //     if (productsToCollect.length === 0) {
// //       toast({
// //         title: "Error",
// //         description: "Please select products to collect",
// //         variant: "destructive",
// //       });
// //       return;
// //     }
// //     collectProductsMutation.mutate(productsToCollect);
// //   };

// //   const handleBatchProcess = (status: string) => {
// //     const productsToProcess = inventoryProducts.filter(p => 
// //       selectedProducts.includes(p.rfid)
// //     );
// //     if (productsToProcess.length === 0) {
// //       toast({
// //         title: "Error",
// //         description: "Please select products to process",
// //         variant: "destructive",
// //       });
// //       return;
// //     }
// //     batchProcessMutation.mutate({ products: productsToProcess, status });
// //   };

// //   const toggleProductSelection = (rfid: string) => {
// //     setSelectedProducts(prev =>
// //       prev.includes(rfid)
// //         ? prev.filter(id => id !== rfid)
// //         : [...prev, rfid]
// //     );
// //   };

// //   const getStatusBadge = (status?: string) => {
// //     switch (status) {
// //       case "Pending Pickup":
// //         return (
// //           <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300">
// //             <Clock className="w-3 h-3 mr-1" />
// //             Pending Pickup
// //           </Badge>
// //         );
// //       case "Collected":
// //         return (
// //           <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300">
// //             <TruckIcon className="w-3 h-3 mr-1" />
// //             Collected
// //           </Badge>
// //         );
// //       case "Processing":
// //         return (
// //           <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300">
// //             <Loader2 className="w-3 h-3 mr-1 animate-spin" />
// //             Processing
// //           </Badge>
// //         );
// //       case "Recycled":
// //         return (
// //           <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-300">
// //             <CheckCircle2 className="w-3 h-3 mr-1" />
// //             Recycled
// //           </Badge>
// //         );
// //       default:
// //         return <Badge variant="secondary">{status}</Badge>;
// //     }
// //   };

// //   if (pendingProductsLoading || inventoryLoading || batchesLoading || companiesLoading) {
// //     return (
// //       <div className="flex items-center justify-center h-64">
// //         <Loader2 className="w-8 h-8 animate-spin text-primary" />
// //       </div>
// //     );
// //   }

// //   const pendingCompanies = companies.filter(c => !c.verified);

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin Dashboard</h1>
// //         <p className="text-muted-foreground mt-1">
// //           Manage companies, pickups, and inventory Recycled
// //         </p>
// //       </div>

// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //         <StatsCard
// //           title="Pending Verifications"
// //           value={stats.pendingVerifications.toString()}
// //           icon={AlertCircle}
// //         />
// //         <StatsCard
// //           title="Pending Pickups"
// //           value={stats.activePickups.toString()}
// //           icon={Clock}
// //         />
// //         <StatsCard
// //           title="In Inventory"
// //           value={stats.inventoryCount.toString()}
// //           icon={Package}
// //         />
// //         <StatsCard
// //           title="Recycled"
// //           value={stats.batchesSent.toString()}
// //           icon={Recycle}
// //         />
// //       </div>

// //       <Tabs defaultValue="companies" className="w-full">
// //         <TabsList className="grid w-full grid-cols-4">
// //           <TabsTrigger value="companies" data-testid="tab-companies">
// //             <Building2 className="w-4 h-4 mr-2" />
// //             Companies
// //           </TabsTrigger>
// //           <TabsTrigger value="pickups" data-testid="tab-pickups">
// //             <Clock className="w-4 h-4 mr-2" />
// //             Pending Pickups
// //             {stats.activePickups > 0 && (
// //               <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-700">
// //                 {stats.activePickups}
// //               </Badge>
// //             )}
// //           </TabsTrigger>
// //           <TabsTrigger value="inventory" data-testid="tab-inventory">
// //             <Package className="w-4 h-4 mr-2" />
// //             Inventory
// //             {stats.inventoryCount > 0 && (
// //               <Badge variant="secondary" className="ml-2">
// //                 {stats.inventoryCount}
// //               </Badge>
// //             )}
// //           </TabsTrigger>
// //           <TabsTrigger value="batches" data-testid="tab-batches">
// //             <Recycle className="w-4 h-4 mr-2" />
// //             Recycled
// //             {stats.batchesSent > 0 && (
// //               <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-700">
// //                 {stats.batchesSent}
// //               </Badge>
// //             )}
// //           </TabsTrigger>
// //         </TabsList>

// //         <TabsContent value="companies" className="space-y-4">
// //           <Card>
// //             <CardHeader>
// //               <CardTitle>Pending Company Verifications</CardTitle>
// //               <CardDescription>
// //                 Review and approve company registrations
// //               </CardDescription>
// //             </CardHeader>
// //             <CardContent className="space-y-3">
// //               {pendingCompanies.length === 0 ? (
// //                 <p className="text-muted-foreground text-center py-4">
// //                   No pending verifications
// //                 </p>
// //               ) : (
// //                 pendingCompanies.map((company, index) => (
// //                   <div 
// //                     key={company.id} 
// //                     className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
// //                   >
// //                     <div>
// //                       <div className="font-medium">{company.companyName}</div>
// //                       <div className="text-sm text-muted-foreground">{company.registrationNumber}</div>
// //                       <div className="text-sm text-muted-foreground">{company.email}</div>
// //                     </div>
// //                     <div className="flex gap-2">
// //                       <Button 
// //                         size="sm" 
// //                         variant="outline"
// //                         onClick={() => verifyCompanyMutation.mutate({ id: company.id, verified: false })}
// //                         disabled={verifyCompanyMutation.isPending}
// //                         data-testid={`button-reject-${index}`}
// //                       >
// //                         Reject
// //                       </Button>
// //                       <Button 
// //                         size="sm"
// //                         onClick={() => verifyCompanyMutation.mutate({ id: company.id, verified: true })}
// //                         disabled={verifyCompanyMutation.isPending}
// //                         data-testid={`button-approve-${index}`}
// //                       >
// //                         {verifyCompanyMutation.isPending ? (
// //                           <Loader2 className="w-4 h-4 mr-1 animate-spin" />
// //                         ) : (
// //                           <CheckCircle2 className="w-4 h-4 mr-1" />
// //                         )}
// //                         Approve
// //                       </Button>
// //                     </div>
// //                   </div>
// //                 ))
// //               )}
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="pickups" className="space-y-4">
// //           <Card>
// //             <CardHeader>
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <CardTitle>Pending Pickup Requests</CardTitle>
// //                   <CardDescription>
// //                     Products waiting to be collected from customers
// //                   </CardDescription>
// //                 </div>
// //                 {selectedProducts.length > 0 && (
// //                   <Button 
// //                     onClick={handleCollectSelected}
// //                     disabled={collectProductsMutation.isPending}
// //                   >
// //                     {collectProductsMutation.isPending ? (
// //                       <>
// //                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
// //                         Collecting...
// //                       </>
// //                     ) : (
// //                       <>
// //                         <CheckCircle2 className="w-4 h-4 mr-2" />
// //                         Mark {selectedProducts.length} as Collected
// //                       </>
// //                     )}
// //                   </Button>
// //                 )}
// //               </div>
// //             </CardHeader>
// //             <CardContent>
// //               {pendingProductsLoading ? (
// //                 <div className="flex items-center justify-center py-12">
// //                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
// //                 </div>
// //               ) : pendingPickupProducts.length === 0 ? (
// //                 <div className="text-center py-12 text-muted-foreground">
// //                   <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
// //                   <p>No pending pickup requests</p>
// //                 </div>
// //               ) : (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                   {pendingPickupProducts.map((product) => (
// //                     <Card 
// //                       key={product._id}
// //                       className={`overflow-visible cursor-pointer transition-all ${
// //                         selectedProducts.includes(product.rfid)
// //                           ? 'border-primary border-2 shadow-md'
// //                           : 'hover:shadow-md'
// //                       }`}
// //                       onClick={() => toggleProductSelection(product.rfid)}
// //                     >
// //                       <CardContent className="p-4 space-y-3">
// //                         <div className="flex items-start justify-between">
// //                           <div className="flex-1 min-w-0">
// //                             <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
// //                             <code className="text-xs text-muted-foreground font-mono block truncate">
// //                               {product.rfid}
// //                             </code>
// //                           </div>
// //                           <div className="ml-2">
// //                             {getStatusBadge(product.currentStatus)}
// //                           </div>
// //                         </div>
                        
// //                         <div className="flex gap-2 flex-wrap">
// //                           <Badge variant="outline" className="capitalize">
// //                             {product.material}
// //                           </Badge>
// //                           <Badge variant="outline" className="capitalize">
// //                             {product.category}
// //                           </Badge>
// //                         </div>
                        
// //                         {product.customer_email && (
// //                           <p className="text-xs text-muted-foreground">
// //                             Customer: {product.customer_email}
// //                           </p>
// //                         )}
                        
// //                         {product.pickup_requested_at && (
// //                           <p className="text-xs text-muted-foreground flex items-center gap-1">
// //                             <Clock className="w-3 h-3" />
// //                             Requested: {new Date(product.pickup_requested_at).toLocaleDateString()}
// //                           </p>
// //                         )}
                        
// //                         {selectedProducts.includes(product.rfid) && (
// //                           <div className="flex items-center gap-2 pt-2">
// //                             <CheckCircle2 className="w-4 h-4 text-primary" />
// //                             <span className="text-sm text-primary font-medium">Selected</span>
// //                           </div>
// //                         )}
// //                       </CardContent>
// //                     </Card>
// //                   ))}
// //                 </div>
// //               )}
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="inventory" className="space-y-4">
// //           <Card>
// //             <CardHeader>
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <CardTitle>Inventory Management</CardTitle>
// //                   <CardDescription>
// //                     Products collected and ready for processing
// //                   </CardDescription>
// //                 </div>
// //                 {selectedProducts.length > 0 && (
// //                   <div className="flex gap-2">
// //                     <Button 
// //                       variant="outline"
// //                       onClick={() => handleBatchProcess("Processing")}
// //                       disabled={batchProcessMutation.isPending}
// //                     >
// //                       {batchProcessMutation.isPending ? (
// //                         <>
// //                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
// //                           Processing...
// //                         </>
// //                       ) : (
// //                         <>
// //                           <ArrowRight className="w-4 h-4 mr-2" />
// //                           Start Processing ({selectedProducts.length})
// //                         </>
// //                       )}
// //                     </Button>
// //                   </div>
// //                 )}
// //               </div>
// //             </CardHeader>
// //             <CardContent>
// //               {inventoryLoading ? (
// //                 <div className="flex items-center justify-center py-12">
// //                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
// //                 </div>
// //               ) : inventoryProducts.length === 0 ? (
// //                 <div className="text-center py-12 text-muted-foreground">
// //                   <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
// //                   <p>No products in inventory</p>
// //                   <p className="text-sm mt-2">Collected products will appear here</p>
// //                 </div>
// //               ) : (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                   {inventoryProducts.map((product) => (
// //                     <Card 
// //                       key={product._id}
// //                       className="overflow-visible hover:shadow-md transition-all"
// //                     >
// //                       <CardContent className="p-4 space-y-3">
// //                         <div className="flex items-start justify-between">
// //                           <div className="flex-1 min-w-0">
// //                             <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
// //                             <code className="text-xs text-muted-foreground font-mono block truncate">
// //                               {product.rfid}
// //                             </code>
// //                           </div>
// //                           <div className="ml-2">
// //                             {getStatusBadge(product.currentStatus)}
// //                           </div>
// //                         </div>
                        
// //                         <div className="flex gap-2 flex-wrap">
// //                           <Badge variant="outline" className="capitalize">
// //                             {product.material}
// //                           </Badge>
// //                           <Badge variant="outline" className="capitalize">
// //                             {product.category}
// //                           </Badge>
// //                         </div>
                        
// //                         {product.batch_no && (
// //                           <p className="text-xs text-muted-foreground">
// //                             Batch: {product.batch_no}
// //                           </p>
// //                         )}
                        
// //                         {product.collected_at && (
// //                           <p className="text-xs text-muted-foreground flex items-center gap-1">
// //                             <TruckIcon className="w-3 h-3" />
// //                             Collected: {new Date(product.collected_at).toLocaleDateString()}
// //                           </p>
// //                         )}
                        
// //                         <Button 
// //                           size="sm"
// //                           onClick={() => handleSendToRecycling(product)}
// //                           disabled={loadingRecyclingProducts.has(product.rfid)}
// //                           className="w-full"
// //                         >
// //                           {loadingRecyclingProducts.has(product.rfid) ? (
// //                             <>
// //                               <Loader2 className="w-3 h-3 mr-2 animate-spin" />
// //                               Sending...
// //                             </>
// //                           ) : (
// //                             <>
// //                               <Recycle className="w-3 h-3 mr-2" />
// //                               Send to Recycling Unit
// //                             </>
// //                           )}
// //                         </Button>
// //                       </CardContent>
// //                     </Card>
// //                   ))}
// //                 </div>
// //               )}
// //             </CardContent>
// //           </Card>
// //         </TabsContent>

// //         <TabsContent value="batches" className="space-y-4">
// //           <Card>
// //             <CardHeader>
// //               <CardTitle>Recycling Batches</CardTitle>
// //               <CardDescription>
// //                 Products sent to recycling unit
// //               </CardDescription>
// //             </CardHeader>
// //             <CardContent>
// //               {batchesLoading ? (
// //                 <div className="flex items-center justify-center py-12">
// //                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
// //                 </div>
// //               ) : batchProducts.length === 0 ? (
// //                 <div className="text-center py-12 text-muted-foreground">
// //                   <Recycle className="w-16 h-16 mx-auto mb-4 opacity-50" />
// //                   <p>No products in recycling batches</p>
// //                   <p className="text-sm mt-2">Products sent for recycling will appear here</p>
// //                 </div>
// //               ) : (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                   {batchProducts.map((product) => (
// //                     <Card 
// //                       key={product._id}
// //                       className="overflow-visible hover:shadow-md transition-all"
// //                     >
// //                       <CardContent className="p-4 space-y-3">
// //                         <div className="flex items-start justify-between">
// //                           <div className="flex-1 min-w-0">
// //                             <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
// //                             <code className="text-xs text-muted-foreground font-mono block truncate">
// //                               {product.rfid}
// //                             </code>
// //                           </div>
// //                           <div className="ml-2">
// //                             {getStatusBadge(product.currentStatus)}
// //                           </div>
// //                         </div>
                        
// //                         <div className="flex gap-2 flex-wrap">
// //                           <Badge variant="outline" className="capitalize">
// //                             {product.material}
// //                           </Badge>
// //                           <Badge variant="outline" className="capitalize">
// //                             {product.category}
// //                           </Badge>
// //                         </div>
                        
// //                         {product.batch_no && (
// //                           <p className="text-xs text-muted-foreground">
// //                             Batch: {product.batch_no}
// //                           </p>
// //                         )}
                        
// //                         {product.collected_at && (
// //                           <p className="text-xs text-muted-foreground flex items-center gap-1">
// //                             <TruckIcon className="w-3 h-3" />
// //                             Collected: {new Date(product.collected_at).toLocaleDateString()}
// //                           </p>
// //                         )}
                        
// //                         {product.recycled_at && (
// //                           <p className="text-xs text-muted-foreground flex items-center gap-1">
// //                             <CheckCircle2 className="w-3 h-3" />
// //                             Recycled: {new Date(product.recycled_at).toLocaleDateString()}
// //                           </p>
// //                         )}
                        
// //                         {product.customer_email && (
// //                           <p className="text-xs text-muted-foreground">
// //                             Customer: {product.customer_email}
// //                           </p>
// //                         )}
// //                       </CardContent>
// //                     </Card>
// //                   ))}
// //                 </div>
// //               )}
// //             </CardContent>
// //           </Card>
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   );
// // }

// import { useQuery, useMutation } from "@tanstack/react-query";
// import { StatsCard } from "@/components/StatsCard";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { Building2, Truck, Package, Recycle, CheckCircle2, AlertCircle, Loader2, Clock, ArrowRight, XCircle, Shield } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useState } from "react";

// const API_BASE_URL = "https://eco-login.vercel.app";
// const PRODUCTS_API = "https://api-hack-virid.vercel.app";

// type Company = {
//   id: string;
//   email: string;
//   name: string;
//   company_name: string;
//   registration_number: string;
//   verified: boolean;
//   created_at?: string;
// };

// type Product = {
//   _id: string;
//   TXN?: string;
//   company_email: string;
//   product_name: string;
//   category: string;
//   material: string;
//   size: string;
//   batch_no: string;
//   manufacture_date: string;
//   rfid: string;
//   created_at: string;
//   price?: number;
//   added_at?: string;
//   currentStatus?: string;
//   customer_email?: string;
//   pickup_requested_at?: string;
//   collected_at?: string;
//   processing_started_at?: string;
//   recycled_at?: string;
// };

// export default function AdminDashboard() {
//   const { toast } = useToast();
//   const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
//   const [loadingRecyclingProducts, setLoadingRecyclingProducts] = useState<Set<string>>(new Set());

//   // Fetch all companies from your Flask API
//   const { data: companiesResponse, isLoading: companiesLoading, refetch: refetchCompanies } = useQuery({
//     queryKey: ['all-companies'],
//     queryFn: async () => {
//       const res = await fetch(`${API_BASE_URL}/api/admin/companies`);
//       if (!res.ok) throw new Error("Failed to load companies");
//       return await res.json();
//     },
//   });

//   const companies: Company[] = companiesResponse?.companies || [];

//   // Fetch pending companies from your Flask API
//   const { data: pendingCompaniesResponse, isLoading: pendingLoading } = useQuery({
//     queryKey: ['pending-companies'],
//     queryFn: async () => {
//       const res = await fetch(`${API_BASE_URL}/api/admin/companies/pending`);
//       if (!res.ok) throw new Error("Failed to load pending companies");
//       return await res.json();
//     },
//   });

//   const pendingCompanies: Company[] = pendingCompaniesResponse?.companies || [];

//   const { data: pendingPickupProducts = [], isLoading: pendingProductsLoading } = useQuery<Product[]>({
//     queryKey: ['pending_pickup_products'],
//     queryFn: async () => {
//       const res = await fetch(`${PRODUCTS_API}/all_products`);
//       if (!res.ok) throw new Error("Failed to load products");
//       const data = await res.json();
//       return data.products.filter((p: Product) => p.currentStatus === "Pending Pickup");
//     },
//   });

//   const { data: inventoryProducts = [], isLoading: inventoryLoading } = useQuery<Product[]>({
//     queryKey: ['inventory_products'],
//     queryFn: async () => {
//       const res = await fetch(`${PRODUCTS_API}/all_products`);
//       if (!res.ok) throw new Error("Failed to load products");
//       const data = await res.json();
//       return data.products.filter((p: Product) => 
//         p.currentStatus === "Collected" || p.currentStatus === "Processing"
//       );
//     },
//   });

//   const { data: batchProducts = [], isLoading: batchesLoading } = useQuery<Product[]>({
//     queryKey: ['batch_products'],
//     queryFn: async () => {
//       const res = await fetch(`${PRODUCTS_API}/all_products`);
//       if (!res.ok) throw new Error("Failed to load products");
//       const data = await res.json();
//       return data.products.filter((p: Product) => p.currentStatus === "Recycled");
//     },
//   });

//   // Calculate stats
//   const stats = {
//     pendingVerifications: pendingCompanies.length,
//     activePickups: pendingPickupProducts.length,
//     inventoryCount: inventoryProducts.length,
//     batchesSent: batchProducts.length,
//   };

//   // Verify company mutation
//   const verifyCompanyMutation = useMutation({
//     mutationFn: async (companyId: string) => {
//       const res = await fetch(`${API_BASE_URL}/api/admin/companies/verify`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ companyId }),
//       });
//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.error || "Failed to verify company");
//       }
//       return await res.json();
//     },
//     onSuccess: (data) => {
//       refetchCompanies();
//       toast({
//         title: "Success",
//         description: data.message || "Company verified successfully",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to verify company",
//         variant: "destructive",
//       });
//     },
//   });

//   // Reject company mutation
//   const rejectCompanyMutation = useMutation({
//     mutationFn: async (companyId: string) => {
//       const res = await fetch(`${API_BASE_URL}/api/admin/companies/reject`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ companyId }),
//       });
//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.error || "Failed to reject company");
//       }
//       return await res.json();
//     },
//     onSuccess: (data) => {
//       refetchCompanies();
//       toast({
//         title: "Success",
//         description: data.message || "Company rejected successfully",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to reject company",
//         variant: "destructive",
//       });
//     },
//   });

//   const collectProductsMutation = useMutation({
//     mutationFn: async (products: Product[]) => {
//       const updatePromises = products.map(product =>
//         fetch(`${PRODUCTS_API}/update_product_status`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             rfid: product.rfid,
//             status: "Collected",
//             email: product.customer_email || "admin@system.com",
//           }),
//         })
//       );
//       await Promise.all(updatePromises);
//     },
//     onSuccess: () => {
//       setSelectedProducts([]);
//       toast({
//         title: "Success",
//         description: "Products marked as collected",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to collect products",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleSendToRecycling = async (product: Product) => {
//     setLoadingRecyclingProducts(prev => new Set(prev).add(product.rfid));
//     try {
//       const res = await fetch(`${PRODUCTS_API}/update_product_status`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           rfid: product.rfid,
//           status: "Recycled",
//           email: product.customer_email || "admin@system.com",
//         }),
//       });
//       if (!res.ok) throw new Error("Failed to send product to recycling");
      
//       toast({
//         title: "Success",
//         description: "Product sent to recycling unit",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to send to recycling",
//         variant: "destructive",
//       });
//     } finally {
//       setLoadingRecyclingProducts(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(product.rfid);
//         return newSet;
//       });
//     }
//   };

//   const handleCollectSelected = () => {
//     const productsToCollect = pendingPickupProducts.filter(p => 
//       selectedProducts.includes(p.rfid)
//     );
//     if (productsToCollect.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please select products to collect",
//         variant: "destructive",
//       });
//       return;
//     }
//     collectProductsMutation.mutate(productsToCollect);
//   };

//   const toggleProductSelection = (rfid: string) => {
//     setSelectedProducts(prev =>
//       prev.includes(rfid)
//         ? prev.filter(id => id !== rfid)
//         : [...prev, rfid]
//     );
//   };

//   const getStatusBadge = (status?: string) => {
//     switch (status) {
//       case "Pending Pickup":
//         return (
//           <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300">
//             <Clock className="w-3 h-3 mr-1" />
//             Pending Pickup
//           </Badge>
//         );
//       case "Collected":
//         return (
//           <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300">
//             <TruckIcon className="w-3 h-3 mr-1" />
//             Collected
//           </Badge>
//         );
//       case "Processing":
//         return (
//           <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300">
//             <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//             Processing
//           </Badge>
//         );
//       case "Recycled":
//         return (
//           <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-300">
//             <CheckCircle2 className="w-3 h-3 mr-1" />
//             Recycled
//           </Badge>
//         );
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   if (companiesLoading || pendingLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//         <p className="text-muted-foreground mt-1">
//           Manage companies, pickups, and inventory
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatsCard
//           title="Pending Verifications"
//           value={stats.pendingVerifications.toString()}
//           icon={AlertCircle}
//         />
//         <StatsCard
//           title="Pending Pickups"
//           value={stats.activePickups.toString()}
//           icon={Clock}
//         />
//         <StatsCard
//           title="In Inventory"
//           value={stats.inventoryCount.toString()}
//           icon={Package}
//         />
//         <StatsCard
//           title="Recycled"
//           value={stats.batchesSent.toString()}
//           icon={Recycle}
//         />
//       </div>

//       <Tabs defaultValue="companies" className="w-full">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="companies">
//             <Building2 className="w-4 h-4 mr-2" />
//             Companies
//             {stats.pendingVerifications > 0 && (
//               <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-700">
//                 {stats.pendingVerifications}
//               </Badge>
//             )}
//           </TabsTrigger>
//           <TabsTrigger value="pickups">
//             <Clock className="w-4 h-4 mr-2" />
//             Pending Pickups
//             {stats.activePickups > 0 && (
//               <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-700">
//                 {stats.activePickups}
//               </Badge>
//             )}
//           </TabsTrigger>
//           <TabsTrigger value="inventory">
//             <Package className="w-4 h-4 mr-2" />
//             Inventory
//             {stats.inventoryCount > 0 && (
//               <Badge variant="secondary" className="ml-2">
//                 {stats.inventoryCount}
//               </Badge>
//             )}
//           </TabsTrigger>
//           <TabsTrigger value="batches">
//             <Recycle className="w-4 h-4 mr-2" />
//             Recycled
//             {stats.batchesSent > 0 && (
//               <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-700">
//                 {stats.batchesSent}
//               </Badge>
//             )}
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="companies" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Pending Company Verifications</CardTitle>
//               <CardDescription>
//                 Review and approve company registrations
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {pendingCompanies.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                   <p>No pending verifications</p>
//                 </div>
//               ) : (
//                 pendingCompanies.map((company) => (
//                   <div 
//                     key={company.id} 
//                     className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex-1">
//                       <div className="font-semibold text-lg">{company.company_name}</div>
//                       <div className="text-sm text-muted-foreground mt-1">
//                         <span className="font-medium">Contact:</span> {company.name}
//                       </div>
//                       <div className="text-sm text-muted-foreground">
//                         <span className="font-medium">Email:</span> {company.email}
//                       </div>
//                       <div className="text-sm text-muted-foreground">
//                         <span className="font-medium">Registration #:</span> {company.registration_number}
//                       </div>
//                       {company.created_at && (
//                         <div className="text-xs text-muted-foreground mt-1">
//                           Applied: {new Date(company.created_at).toLocaleDateString()}
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex gap-2 ml-4">
//                       <Button 
//                         size="sm" 
//                         variant="outline"
//                         onClick={() => rejectCompanyMutation.mutate(company.id)}
//                         disabled={rejectCompanyMutation.isPending || verifyCompanyMutation.isPending}
//                         className="border-red-300 text-red-600 hover:bg-red-50"
//                       >
//                         {rejectCompanyMutation.isPending ? (
//                           <Loader2 className="w-4 h-4 mr-1 animate-spin" />
//                         ) : (
//                           <XCircle className="w-4 h-4 mr-1" />
//                         )}
//                         Reject
//                       </Button>
//                       <Button 
//                         size="sm"
//                         onClick={() => verifyCompanyMutation.mutate(company.id)}
//                         disabled={verifyCompanyMutation.isPending || rejectCompanyMutation.isPending}
//                       >
//                         {verifyCompanyMutation.isPending ? (
//                           <Loader2 className="w-4 h-4 mr-1 animate-spin" />
//                         ) : (
//                           <CheckCircle2 className="w-4 h-4 mr-1" />
//                         )}
//                         Approve
//                       </Button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>All Companies</CardTitle>
//               <CardDescription>
//                 View all registered companies
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 {companies.filter(c => c.verified).map((company) => (
//                   <div 
//                     key={company.id}
//                     className="flex items-center justify-between p-4 border rounded-lg"
//                   >
//                     <div className="flex-1">
//                       <div className="font-semibold">{company.company_name}</div>
//                       <div className="text-sm text-muted-foreground">{company.email}</div>
//                     </div>
//                     <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-300">
//                       <CheckCircle2 className="w-3 h-3 mr-1" />
//                       Verified
//                     </Badge>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="pickups" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Pending Pickup Requests</CardTitle>
//                   <CardDescription>
//                     Products waiting to be collected from customers
//                   </CardDescription>
//                 </div>
//                 {selectedProducts.length > 0 && (
//                   <Button 
//                     onClick={handleCollectSelected}
//                     disabled={collectProductsMutation.isPending}
//                   >
//                     {collectProductsMutation.isPending ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Collecting...
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle2 className="w-4 h-4 mr-2" />
//                         Mark {selectedProducts.length} as Collected
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </CardHeader>
//             <CardContent>
//               {pendingProductsLoading ? (
//                 <div className="flex items-center justify-center py-12">
//                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
//                 </div>
//               ) : pendingPickupProducts.length === 0 ? (
//                 <div className="text-center py-12 text-muted-foreground">
//                   <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                   <p>No pending pickup requests</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {pendingPickupProducts.map((product) => (
//                     <Card 
//                       key={product._id}
//                       className={`overflow-visible cursor-pointer transition-all ${
//                         selectedProducts.includes(product.rfid)
//                           ? 'border-primary border-2 shadow-md'
//                           : 'hover:shadow-md'
//                       }`}
//                       onClick={() => toggleProductSelection(product.rfid)}
//                     >
//                       <CardContent className="p-4 space-y-3">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1 min-w-0">
//                             <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
//                             <code className="text-xs text-muted-foreground font-mono block truncate">
//                               {product.rfid}
//                             </code>
//                           </div>
//                           <div className="ml-2">
//                             {getStatusBadge(product.currentStatus)}
//                           </div>
//                         </div>
                        
//                         <div className="flex gap-2 flex-wrap">
//                           <Badge variant="outline" className="capitalize">
//                             {product.material}
//                           </Badge>
//                           <Badge variant="outline" className="capitalize">
//                             {product.category}
//                           </Badge>
//                         </div>
                        
//                         {product.customer_email && (
//                           <p className="text-xs text-muted-foreground">
//                             Customer: {product.customer_email}
//                           </p>
//                         )}
                        
//                         {selectedProducts.includes(product.rfid) && (
//                           <div className="flex items-center gap-2 pt-2">
//                             <CheckCircle2 className="w-4 h-4 text-primary" />
//                             <span className="text-sm text-primary font-medium">Selected</span>
//                           </div>
//                         )}
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="inventory" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Inventory Management</CardTitle>
//               <CardDescription>
//                 Products collected and ready for processing
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {inventoryLoading ? (
//                 <div className="flex items-center justify-center py-12">
//                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
//                 </div>
//               ) : inventoryProducts.length === 0 ? (
//                 <div className="text-center py-12 text-muted-foreground">
//                   <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                   <p>No products in inventory</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {inventoryProducts.map((product) => (
//                     <Card key={product._id} className="overflow-visible hover:shadow-md transition-all">
//                       <CardContent className="p-4 space-y-3">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1 min-w-0">
//                             <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
//                             <code className="text-xs text-muted-foreground font-mono block truncate">
//                               {product.rfid}
//                             </code>
//                           </div>
//                           <div className="ml-2">
//                             {getStatusBadge(product.currentStatus)}
//                           </div>
//                         </div>
                        
//                         <Button 
//                           size="sm"
//                           onClick={() => handleSendToRecycling(product)}
//                           disabled={loadingRecyclingProducts.has(product.rfid)}
//                           className="w-full"
//                         >
//                           {loadingRecyclingProducts.has(product.rfid) ? (
//                             <>
//                               <Loader2 className="w-3 h-3 mr-2 animate-spin" />
//                               Sending...
//                             </>
//                           ) : (
//                             <>
//                               <Recycle className="w-3 h-3 mr-2" />
//                               Send to Recycling
//                             </>
//                           )}
//                         </Button>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="batches" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recycled Products</CardTitle>
//               <CardDescription>
//                 Products successfully recycled
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {batchesLoading ? (
//                 <div className="flex items-center justify-center py-12">
//                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
//                 </div>
//               ) : batchProducts.length === 0 ? (
//                 <div className="text-center py-12 text-muted-foreground">
//                   <Recycle className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                   <p>No recycled products yet</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {batchProducts.map((product) => (
//                     <Card key={product._id} className="overflow-visible">
//                       <CardContent className="p-4 space-y-3">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1 min-w-0">
//                             <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
//                             <code className="text-xs text-muted-foreground font-mono block truncate">
//                               {product.rfid}
//                             </code>
//                           </div>
//                           <div className="ml-2">
//                             {getStatusBadge(product.currentStatus)}
//                           </div>
//                         </div>
                        
//                         {product.recycled_at && (
//                           <p className="text-xs text-muted-foreground">
//                             Recycled: {new Date(product.recycled_at).toLocaleDateString()}
//                           </p>
//                         )}
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { StatsCard } from "@/components/StatsCard";
import "../styles/dashboard-animations.css";
import { PickupRequestCard } from "@/components/PickupRequestCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Truck, Package, Recycle, CheckCircle2, AlertCircle, Loader2, Clock, ArrowRight, Shield, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// ==================== HARDCODED DELETE FUNCTION ====================
const deleteProductHardcoded = async (rfid: string, adminEmail: string = "admin@system.com") => {
  const FASTAPI_BASE = "https://api-hack-virid.vercel.app";
  
  try {
    const response = await fetch(
      `${FASTAPI_BASE}/delete_product/${encodeURIComponent(rfid)}?company_email=${encodeURIComponent(adminEmail)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete product");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete product");
  }
};

type Company = {
  id: string;
  email: string;
  name: string;
  company_name: string;
  registration_number: string;
  verified: boolean;
  created_at?: string;
};

type Product = {
  _id: string;
  TXN?: string;
  company_email: string;
  product_name: string;
  category: string;
  material: string;
  size: string;
  batch_no: string;
  manufacture_date: string;
  rfid: string;
  created_at: string;
  price?: number;
  added_at?: string;
  currentStatus?: string;
  customer_email?: string;
  pickup_requested_at?: string;
  collected_at?: string;
  processing_started_at?: string;
  recycled_at?: string;
};

type PickupRequest = {
  id: number;
  requestId: string;
  productIds: string[];
  products?: Product[];
  customerName: string;
  customerEmail: string;
  location: string;
  preferredDate?: string;
  status: string;
  assignedAgentName?: string;
};

type Stats = {
  pendingVerifications: number;
  activePickups: number;
  inventoryCount: number;
  batchesSent: number;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loadingRecyclingProducts, setLoadingRecyclingProducts] = useState<Set<string>>(new Set());
  const [processingCompanyId, setProcessingCompanyId] = useState<string | null>(null);

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (rfid: string) => {
      return deleteProductHardcoded(rfid);
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted ✅",
        description: "Product has been removed from the system",
      });
      queryClient.invalidateQueries({ queryKey: ['pending_pickup_products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_products'] });
      queryClient.invalidateQueries({ queryKey: ['batch_products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed ❌",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProduct = (rfid: string) => {
    deleteMutation.mutate(rfid);
  };

  const { data: companies = [], isLoading: companiesLoading, error: companiesError } = useQuery<Company[]>({
    queryKey: ['admin_companies'],
    queryFn: async () => {
      try {
        console.log("Fetching companies from Flask API...");
        const result = await api.getAllCompanies();
        console.log("Companies API response:", result);
        
        if (result.success && result.companies) {
          console.log("Companies fetched successfully:", result.companies);
          return result.companies;
        } else {
          console.error("Unexpected API response:", result);
          return [];
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }
    },
  });
  
  console.log("Companies state:", { companies, companiesLoading, companiesError });

  const { data: pickups = [], isLoading: pickupsLoading } = useQuery<PickupRequest[]>({
    queryKey: ['admin_pickups'],
    queryFn: async () => {
      const result = await api.getAllPickups();
      console.log("Pickups fetched:", result);
      return result.pickups || [];
    },
  });

  const { data: pendingPickupProducts = [], isLoading: pendingProductsLoading } = useQuery<Product[]>({
    queryKey: ['pending_pickup_products'],
    queryFn: async () => {
      const data = await api.getAllProducts();
      return data.products.filter((p: Product) => p.currentStatus === "Pending Pickup");
    },
  });

  const { data: inventoryProducts = [], isLoading: inventoryLoading } = useQuery<Product[]>({
    queryKey: ['inventory_products'],
    queryFn: async () => {
      const data = await api.getAllProducts();
      return data.products.filter((p: Product) => 
        p.currentStatus === "Collected" || p.currentStatus === "Processing"
      );
    },
  });

  const { data: batchProducts = [], isLoading: batchesLoading } = useQuery<Product[]>({
    queryKey: ['batch_products'],
    queryFn: async () => {
      const data = await api.getAllProducts();
      return data.products.filter((p: Product) => p.currentStatus === "Recycled");
    },
  });

  // Calculate stats from all products
  const stats = {
    pendingVerifications: companies.filter(c => !c.verified).length,
    activePickups: pendingPickupProducts.length,
    inventoryCount: inventoryProducts.length,
    batchesSent: batchProducts.length,
  };

  // Separate mutation for approving companies
  const approveCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      console.log("Approving company:", companyId);
      return await api.verifyCompany(companyId);
    },
    onMutate: async (companyId) => {
      console.log("Setting processing company ID for approve:", companyId);
      setProcessingCompanyId(companyId);
    },
    onSuccess: () => {
      setProcessingCompanyId(null);
      queryClient.invalidateQueries({ queryKey: ['admin_companies'] });
      toast({
        title: "Success",
        description: "Company approved successfully",
      });
    },
    onError: (error: any) => {
      setProcessingCompanyId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to approve company",
        variant: "destructive",
      });
    },
  });

  // Separate mutation for rejecting companies
  const rejectCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      console.log("Rejecting company:", companyId);
      return await api.rejectCompany(companyId);
    },
    onMutate: async (companyId) => {
      console.log("Setting processing company ID for reject:", companyId);
      setProcessingCompanyId(companyId);
    },
    onSuccess: () => {
      setProcessingCompanyId(null);
      queryClient.invalidateQueries({ queryKey: ['admin_companies'] });
      toast({
        title: "Success",
        description: "Company rejected successfully",
      });
    },
    onError: (error: any) => {
      setProcessingCompanyId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to reject company",
        variant: "destructive",
      });
    },
  });

  const collectProductsMutation = useMutation({
    mutationFn: async (products: Product[]) => {
      const updatePromises = products.map(product =>
        api.updateProductStatus({
          rfid: product.rfid,
          status: "Collected",
          email: product.customer_email || "admin@system.com",
        })
      );
      const results = await Promise.all(updatePromises);
      
      // Check if all requests were successful
      const allSuccessful = results.every(res => res.status === "success");
      if (!allSuccessful) {
        throw new Error("Some products failed to update");
      }
      
      return results;
    },
    onSuccess: async () => {
      // Invalidate and refetch all related queries immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pending_pickup_products'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory_products'] }),
        queryClient.refetchQueries({ queryKey: ['pending_pickup_products'] }),
        queryClient.refetchQueries({ queryKey: ['inventory_products'] }),
      ]);
      
      setSelectedProducts([]);
      toast({
        title: "Success",
        description: "Products marked as collected and moved to inventory",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to collect products",
        variant: "destructive",
      });
    },
  });

  const batchProcessMutation = useMutation({
    mutationFn: async ({ products, status }: { products: Product[]; status: string }) => {
      const updatePromises = products.map(product =>
        api.updateProductStatus({
          rfid: product.rfid,
          status: status,
          email: product.customer_email || "admin@system.com",
        })
      );
      const results = await Promise.all(updatePromises);
      
      // Check if all requests were successful
      const allSuccessful = results.every(res => res.status === "success");
      if (!allSuccessful) {
        throw new Error("Some products failed to update");
      }
      
      return results;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch inventory immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory_products'] }),
        queryClient.refetchQueries({ queryKey: ['inventory_products'] }),
      ]);
      
      setSelectedProducts([]);
      toast({
        title: "Success",
        description: `Products moved to ${variables.status} status`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process batch",
        variant: "destructive",
      });
    },
  });

  const handleSendToRecycling = async (product: Product) => {
    setLoadingRecyclingProducts(prev => new Set(prev).add(product.rfid));
    try {
      const result = await api.updateProductStatus({
        rfid: product.rfid,
        status: "Recycled",
        email: product.customer_email || "admin@system.com",
      });
      if (result.status !== "success") throw new Error("Failed to send product to recycling");
      
      // Immediately refetch both inventory and batch products
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory_products'] }),
        queryClient.invalidateQueries({ queryKey: ['batch_products'] }),
        queryClient.refetchQueries({ queryKey: ['inventory_products'] }),
        queryClient.refetchQueries({ queryKey: ['batch_products'] }),
      ]);
      
      toast({
        title: "Success",
        description: "Product sent to recycling unit",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send to recycling",
        variant: "destructive",
      });
    } finally {
      setLoadingRecyclingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.rfid);
        return newSet;
      });
    }
  };

  const handleCollectSelected = () => {
    const productsToCollect = pendingPickupProducts.filter(p => 
      selectedProducts.includes(p.rfid)
    );
    if (productsToCollect.length === 0) {
      toast({
        title: "Error",
        description: "Please select products to collect",
        variant: "destructive",
      });
      return;
    }
    collectProductsMutation.mutate(productsToCollect);
  };

  const handleBatchProcess = (status: string) => {
    const productsToProcess = inventoryProducts.filter(p => 
      selectedProducts.includes(p.rfid)
    );
    if (productsToProcess.length === 0) {
      toast({
        title: "Error",
        description: "Please select products to process",
        variant: "destructive",
      });
      return;
    }
    batchProcessMutation.mutate({ products: productsToProcess, status });
  };

  const toggleProductSelection = (rfid: string) => {
    setSelectedProducts(prev =>
      prev.includes(rfid)
        ? prev.filter(id => id !== rfid)
        : [...prev, rfid]
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Pending Pickup":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending Pickup
          </Badge>
        );
      case "Collected":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300">
            <Truck className="w-3 h-3 mr-1" />
            Collected
          </Badge>
        );
      case "Processing":
        return (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "Recycled":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Recycled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (pendingProductsLoading || inventoryLoading || batchesLoading || companiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCompanies = companies.filter(c => !c.verified);

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Wave Hero Section */}
      <div className="relative -mx-6 -mt-6 mb-8 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path 
              d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" 
              fill="currentColor"
              className="text-background animate-pulse"
              style={{ animationDuration: '4s' }}
            />
          </svg>
        </div>

        {/* Header Content */}
        <div className="relative z-10 px-6 pt-8 pb-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white" data-testid="text-page-title">
                Admin Dashboard
              </h1>
              <p className="text-white/90 mt-1 text-lg">
                Manage companies, pickups, and inventory
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Verifications"
          value={stats.pendingVerifications.toString()}
          icon={AlertCircle}
        />
        <StatsCard
          title="Pending Pickups"
          value={stats.activePickups.toString()}
          icon={Clock}
        />
        <StatsCard
          title="In Inventory"
          value={stats.inventoryCount.toString()}
          icon={Package}
        />
        <StatsCard
          title="Recycled"
          value={stats.batchesSent.toString()}
          icon={Recycle}
        />
      </div>

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="companies" data-testid="tab-companies">
            <Building2 className="w-4 h-4 mr-2" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="pickups" data-testid="tab-pickups">
            <Clock className="w-4 h-4 mr-2" />
            Pending Pickups
            {stats.activePickups > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-700">
                {stats.activePickups}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">
            <Package className="w-4 h-4 mr-2" />
            Inventory
            {stats.inventoryCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.inventoryCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="batches" data-testid="tab-batches">
            <Recycle className="w-4 h-4 mr-2" />
            Recycled
            {stats.batchesSent > 0 && (
              <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-700">
                {stats.batchesSent}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Company Verifications</CardTitle>
              <CardDescription>
                Review and approve company registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingCompanies.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No pending verifications
                </p>
              ) : (
                pendingCompanies.map((company, index) => {
                  const isThisCompanyProcessing = processingCompanyId === company.id;
                  
                  return (
                    <div 
                      key={company.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="font-medium">{company.company_name}</div>
                        <div className="text-sm text-muted-foreground">{company.registration_number}</div>
                        <div className="text-sm text-muted-foreground">{company.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectCompanyMutation.mutate(company.id)}
                          disabled={processingCompanyId !== null}
                          data-testid={`button-reject-${index}`}
                        >
                          {isThisCompanyProcessing && rejectCompanyMutation.isPending && (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          )}
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => approveCompanyMutation.mutate(company.id)}
                          disabled={processingCompanyId !== null}
                          data-testid={`button-approve-${index}`}
                        >
                          {isThisCompanyProcessing && approveCompanyMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pickups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Pickup Requests</CardTitle>
                  <CardDescription>
                    Products waiting to be collected from customers
                  </CardDescription>
                </div>
                {selectedProducts.length > 0 && (
                  <Button 
                    onClick={handleCollectSelected}
                    disabled={collectProductsMutation.isPending}
                  >
                    {collectProductsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Collecting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark {selectedProducts.length} as Collected
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pendingProductsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : pendingPickupProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending pickup requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingPickupProducts.map((product) => (
                    <Card 
                      key={product._id}
                      className={`overflow-visible cursor-pointer transition-all ${
                        selectedProducts.includes(product.rfid)
                          ? 'border-primary border-2 shadow-md'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleProductSelection(product.rfid)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
                            <code className="text-xs text-muted-foreground font-mono block truncate">
                              {product.rfid}
                            </code>
                          </div>
                          <div className="ml-2">
                            {getStatusBadge(product.currentStatus)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize">
                            {product.material}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </div>
                        
                        {product.customer_email && (
                          <p className="text-xs text-muted-foreground">
                            Customer: {product.customer_email}
                          </p>
                        )}
                        
                        {product.pickup_requested_at && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Requested: {new Date(product.pickup_requested_at).toLocaleDateString()}
                          </p>
                        )}
                        
                        {selectedProducts.includes(product.rfid) && (
                          <div className="flex items-center gap-2 pt-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span className="text-sm text-primary font-medium">Selected</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Products collected and ready for processing
                  </CardDescription>
                </div>
                {selectedProducts.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleBatchProcess("Processing")}
                      disabled={batchProcessMutation.isPending}
                    >
                      {batchProcessMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Start Processing ({selectedProducts.length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : inventoryProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No products in inventory</p>
                  <p className="text-sm mt-2">Collected products will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventoryProducts.map((product) => (
                    <Card 
                      key={product._id}
                      className="overflow-visible hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
                            <code className="text-xs text-muted-foreground font-mono block truncate">
                              {product.rfid}
                            </code>
                          </div>
                          <div className="ml-2">
                            {getStatusBadge(product.currentStatus)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize">
                            {product.material}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </div>
                        
                        {product.batch_no && (
                          <p className="text-xs text-muted-foreground">
                            Batch: {product.batch_no}
                          </p>
                        )}
                        
                        {product.collected_at && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Collected: {new Date(product.collected_at).toLocaleDateString()}
                          </p>
                        )}
                        
                        <Button 
                          size="sm"
                          onClick={() => handleSendToRecycling(product)}
                          disabled={loadingRecyclingProducts.has(product.rfid)}
                          className="w-full"
                        >
                          {loadingRecyclingProducts.has(product.rfid) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Recycle className="w-3 h-3 mr-2" />
                              Send to Recycling Unit
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recycling Batches</CardTitle>
              <CardDescription>
                Products sent to recycling unit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batchesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : batchProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Recycle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No products in recycling batches</p>
                  <p className="text-sm mt-2">Products sent for recycling will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batchProducts.map((product) => (
                    <Card 
                      key={product._id}
                      className="overflow-visible hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{product.product_name}</h3>
                            <code className="text-xs text-muted-foreground font-mono block truncate">
                              {product.rfid}
                            </code>
                          </div>
                          <div className="ml-2">
                            {getStatusBadge(product.currentStatus)}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize">
                            {product.material}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </div>
                        
                        {product.batch_no && (
                          <p className="text-xs text-muted-foreground">
                            Batch: {product.batch_no}
                          </p>
                        )}
                        
                        {product.collected_at && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Collected: {new Date(product.collected_at).toLocaleDateString()}
                          </p>
                        )}
                        
                        {product.recycled_at && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Recycled: {new Date(product.recycled_at).toLocaleDateString()}
                          </p>
                        )}
                        
                        {product.customer_email && (
                          <p className="text-xs text-muted-foreground">
                            Customer: {product.customer_email}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
