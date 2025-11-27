import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User } from "lucide-react";

interface PickupRequestCardProps {
  id: string;
  productCount: number;
  customerName: string;
  location: string;
  preferredDate?: string;
  status: "Pending" | "Assigned" | "Completed";
  assignedAgent?: string;
  onAssign?: () => void;
  onComplete?: () => void;
}

export function PickupRequestCard({
  id,
  productCount,
  customerName,
  location,
  preferredDate,
  status,
  assignedAgent,
  onAssign,
  onComplete
}: PickupRequestCardProps) {
  const statusColors = {
    "Pending": "bg-status-used/10 text-status-used border-status-used/20",
    "Assigned": "bg-status-inventory/10 text-status-inventory border-status-inventory/20",
    "Completed": "bg-status-collected/10 text-status-collected border-status-collected/20",
  };

  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm" data-testid={`text-pickup-id-${id}`}>Request #{id}</h3>
            <p className="text-sm text-muted-foreground">{productCount} product{productCount !== 1 ? 's' : ''}</p>
          </div>
          <Badge variant="outline" className={statusColors[status]}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm min-w-0">
            <div className="text-muted-foreground">Customer</div>
            <div className="font-medium">{customerName}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm min-w-0">
            <div className="text-muted-foreground">Location</div>
            <div className="break-words">{location}</div>
          </div>
        </div>
        {preferredDate && (
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm min-w-0">
              <div className="text-muted-foreground">Preferred Date</div>
              <div>{preferredDate}</div>
            </div>
          </div>
        )}
        {assignedAgent && (
          <div className="text-sm">
            <span className="text-muted-foreground">Assigned to:</span>{" "}
            <span className="font-medium">{assignedAgent}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {status === "Pending" && onAssign && (
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => {
              console.log(`Assigning pickup ${id}`);
              onAssign();
            }}
            data-testid={`button-assign-${id}`}
          >
            Assign Agent
          </Button>
        )}
        {status === "Assigned" && onComplete && (
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => {
              console.log(`Completing pickup ${id}`);
              onComplete();
            }}
            data-testid={`button-complete-${id}`}
          >
            Mark Complete
          </Button>
        )}
        {status === "Completed" && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            disabled
          >
            Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// import { useState } from "react";
// import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useToast } from "@/hooks/use-toast";
// import { Loader2, Truck } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { getUserEmail } from '@/pages/LoginPage';

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
// };

// interface RequestPickupDialogProps {
//   trigger?: React.ReactNode;
// }

// export function RequestPickupDialog({ trigger }: RequestPickupDialogProps) {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [open, setOpen] = useState(false);
//   const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
//   const [location, setLocation] = useState("");
//   const [preferredDate, setPreferredDate] = useState("");

//   const userEmail = getUserEmail();

//   const { data: productsData, isLoading: productsLoading, error } = useQuery({
//     queryKey: ["all_products", userEmail],
//     queryFn: async () => {
//       const res = await fetch("https://api-hack-virid.vercel.app/get_products_by_email/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: userEmail }),
//       });

//       if (!res.ok) {
//         throw new Error("Failed to load products");
//       }

//       const data = await res.json();
//       return data;
//     },
//     enabled: !!userEmail && open,
//   });

//   const products: Product[] = productsData?.products || [];

//   const createPickupMutation = useMutation({
//     mutationFn: async (data: { 
//       productIds?: string[]; 
//       products: Product[];
//       location: string; 
//       preferredDate?: string;
//       userEmail: string;
//     }) => {
//       // Use the correct API URL (matching your other endpoints)
//       const pickupRes = await fetch("https://api-hack-virid.vercel.app/api/pickups", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: data.userEmail,
//           location: data.location,
//           preferredDate: data.preferredDate,
//         }),
//       });
      
//       if (!pickupRes.ok) {
//         const errorText = await pickupRes.text();
//         throw new Error(errorText || "Failed to create pickup request");
//       }
      
//       // Then update each product's status to "Pending Pickup"
//       const updatePromises = data.products.map(async (product) => {
//         try {
//           const res = await fetch("https://api-hack-virid.vercel.app/update_product_status", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               rfid: product.rfid,
//               status: "Pending Pickup",
//               email: data.userEmail,
//             }),
//           });
          
//           if (!res.ok) {
//             console.error(`Failed to update status for product ${product.rfid}`);
//           }
          
//           return res.json();
//         } catch (error) {
//           console.error(`Error updating product ${product.rfid}:`, error);
//         }
//       });

//       await Promise.all(updatePromises);
      
//       return await pickupRes.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success",
//         description: `Pickup request created for ${selectedProducts.length} product(s). Status updated to "Pending Pickup".`,
//       });
//       setOpen(false);
//       setSelectedProducts([]);
//       setLocation("");
//       setPreferredDate("");
      
//       // Invalidate all relevant queries to refresh the UI
//       queryClient.invalidateQueries({ queryKey: ['/api/pickups'] });
//       queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
//       queryClient.invalidateQueries({ queryKey: ["all_products", userEmail] });
//       queryClient.invalidateQueries({ queryKey: ["pending_pickups", userEmail] });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create pickup request",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleSubmit = () => {
//     if (selectedProducts.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please select at least one product",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!location.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter a pickup location",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Get the full product objects for selected IDs
//     const selectedProductObjects = products.filter(p => selectedProducts.includes(p._id));

//     createPickupMutation.mutate({
//       productIds: selectedProducts,
//       products: selectedProductObjects,
//       location,
//       preferredDate: preferredDate || undefined,
//       userEmail: userEmail!,
//     });
//   };

//   const toggleProduct = (productId: string) => {
//     setSelectedProducts(prev =>
//       prev.includes(productId)
//         ? prev.filter(id => id !== productId)
//         : [...prev, productId]
//     );
//   };

//   // Filter for registered products (products that can be picked up)
//   const registeredProducts = products.filter((p) => 
//     !p?.currentStatus || p?.currentStatus === "Registered" || p?.currentStatus === "Active"
//   );

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         {trigger || (
//           <Button variant="outline" data-testid="button-request-pickup">
//             <Truck className="w-4 h-4 mr-2" />
//             Request Pickup
//           </Button>
//         )}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Request Pickup</DialogTitle>
//           <DialogDescription>
//             Select products for recycling and provide pickup details
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="space-y-4 py-4">
//           <div className="space-y-2">
//             <Label>Select Products</Label>
//             {productsLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <Loader2 className="w-6 h-6 animate-spin text-primary" />
//               </div>
//             ) : error ? (
//               <Card>
//                 <CardContent className="py-6">
//                   <p className="text-sm text-destructive text-center">
//                     Failed to load products. Please try again.
//                   </p>
//                 </CardContent>
//               </Card>
//             ) : registeredProducts.length === 0 ? (
//               <Card>
//                 <CardContent className="py-6">
//                   <p className="text-sm text-muted-foreground text-center">
//                     No registered products available for pickup.
//                   </p>
//                   <p className="text-xs text-muted-foreground text-center mt-2">
//                     Scan and add products to request a pickup.
//                   </p>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
//                 {registeredProducts.map((product) => (
//                   <Card 
//                     key={product._id} 
//                     className={`overflow-visible transition-colors ${
//                       selectedProducts.includes(product._id) 
//                         ? 'border-primary bg-primary/5' 
//                         : 'hover:border-primary/50'
//                     }`}
//                   >
//                     <CardContent className="p-3">
//                       <div className="flex items-start gap-3">
//                         <Checkbox
//                           id={`product-${product._id}`}
//                           checked={selectedProducts.includes(product._id)}
//                           onCheckedChange={() => toggleProduct(product._id)}
//                           data-testid={`checkbox-product-${product._id}`}
//                           className="mt-1"
//                         />
//                         <div className="flex-1 min-w-0">
//                           <label
//                             htmlFor={`product-${product._id}`}
//                             className="text-sm font-medium cursor-pointer block"
//                           >
//                             {product.product_name}
//                           </label>
//                           <p className="text-xs text-muted-foreground mt-1">
//                             RFID: {product.rfid}
//                           </p>
//                           {product.batch_no && (
//                             <p className="text-xs text-muted-foreground">
//                               Batch: {product.batch_no}
//                             </p>
//                           )}
//                           <div className="flex gap-2 mt-1 flex-wrap">
//                             <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
//                               {product.material}
//                             </span>
//                             <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
//                               {product.category}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//             {registeredProducts.length > 0 && (
//               <p className="text-xs text-muted-foreground mt-2">
//                 {selectedProducts.length} of {registeredProducts.length} products selected
//               </p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="location">Pickup Location *</Label>
//             <Input
//               id="location"
//               placeholder="Enter your address"
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               data-testid="input-pickup-location"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="preferredDate">Preferred Date (Optional)</Label>
//             <Input
//               id="preferredDate"
//               type="date"
//               value={preferredDate}
//               onChange={(e) => setPreferredDate(e.target.value)}
//               min={new Date().toISOString().split('T')[0]}
//               data-testid="input-preferred-date"
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setOpen(false)}
//             data-testid="button-cancel-pickup"
//           >
//             Cancel
//           </Button>
//           <Button
//             type="button"
//             onClick={handleSubmit}
//             disabled={createPickupMutation.isPending || selectedProducts.length === 0 || !location.trim()}
//             data-testid="button-submit-pickup"
//           >
//             {createPickupMutation.isPending && (
//               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             )}
//             Request Pickup ({selectedProducts.length})
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
