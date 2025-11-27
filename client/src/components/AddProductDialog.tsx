import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { getUserEmail, getUserRole } from '@/pages/LoginPage';
import { API_CONFIG, generateUniqueRFID, generateTxnId } from '@/lib/config';

interface AddProductDialogProps {
  trigger?: React.ReactNode;
}

export function AddProductDialog({ trigger }: AddProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Get logged-in company email
  const userEmail = getUserEmail();
  const userRole = getUserRole();

  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    material: "",
    size: "",
    batch_no: "",
    price: "",
    weight: "",
    manufacture_date: new Date().toISOString().split("T")[0],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const rfid = generateUniqueRFID();
      const txn = await generateTxnId(
        userEmail || "",
        data.manufacture_date,
        rfid
      );

      const newProduct = {
        TXN: txn,
        company_email: userEmail || "",
        product_name: data.product_name,
        category: data.category,
        material: data.material,
        size: data.size,
        weight: data.weight, // ← Weight included
        batch_no: data.batch_no,
        price: data.price,
        manufacture_date: data.manufacture_date,
        rfid: rfid,
        created_at: new Date().toISOString(),
        currentStatus: "Registered"
      };

      console.log("📦 Creating product:", newProduct);
      console.log("⚖️ Weight:", data.weight, typeof data.weight);

      // Direct MongoDB insert via FastAPI
      const response = await fetch(`${API_CONFIG.FASTAPI_BASE}/add_product_company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      
      // Invalidate and refetch products query for this company
      queryClient.invalidateQueries({ queryKey: ['products_by_company', userEmail] });
      
      setOpen(false);
      // Reset form
      setFormData({
        product_name: "",
        category: "",
        material: "",
        size: "",
        batch_no: "",
        price: "",
        weight: "",
        manufacture_date: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that user is logged in as company
    if (userRole !== "company") {
      toast({
        title: "Error",
        description: "Only companies can add products",
        variant: "destructive",
      });
      return;
    }

    if (!userEmail) {
      toast({
        title: "Error",
        description: "Company email not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Register a new product in the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="e.g., Electronics, Clothing, Food"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material">Material *</Label>
            <Input
              id="material"
              value={formData.material}
              onChange={(e) =>
                setFormData({ ...formData, material: e.target.value })
              }
              placeholder="e.g., Plastic, Cotton, Metal"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                placeholder="e.g., M, L, XL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNo">Batch No</Label>
              <Input
                id="batchNo"
                value={formData.batch_no}
                onChange={(e) =>
                  setFormData({ ...formData, batch_no: e.target.value })
                }
                placeholder="e.g., BATCH001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufactureDate">Manufacture Date *</Label>
            <Input
              id="manufactureDate"
              type="date"
              value={formData.manufacture_date}
              onChange={(e) =>
                setFormData({ ...formData, manufacture_date: e.target.value })
              }
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Create Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
