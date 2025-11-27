import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatsCard } from "@/components/StatsCard";
import "../styles/dashboard-animations.css";
import { ProductCard } from "@/components/ProductCard";
import { ScannerInterface } from "@/components/ScannerInterface";
import { RequestPickupDialog } from "@/components/RequestPickupDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Recycle, Truck, DollarSign, Scan, MapPin, Loader2, Plus, X, Award, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { getUserEmail, getUserRole } from './LoginPage';

// ==================== HARDCODED DELETE FUNCTION ====================
const deleteProductHardcoded = async (rfid: string, userEmail: string) => {
  const FASTAPI_BASE = "https://api-hack-virid.vercel.app";
  
  try {
    const response = await fetch(
      `${FASTAPI_BASE}/delete_product/${encodeURIComponent(rfid)}?company_email=${encodeURIComponent(userEmail)}`,
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

// ==================== CARBON SAVINGS CALCULATION WITH GEMINI ====================
const calculateCarbonSavings = async (product: Product): Promise<CarbonSavings> => {
  const GEMINI_API_KEY = "AIzaSyCObiw1MJMvLh8OfPeYHyFa8AjNLIw-_CQ";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
  
  // Parse weight as number, default to 1 kg if not specified or invalid
  const weight = product.weight ? parseFloat(product.weight.toString()) : 1;
  
  console.log('🤖 Gemini AI Calculation:');
  console.log('Product:', product.product_name);
  console.log('Weight:', weight, 'kg');
  console.log('Material:', product.material);
  
  const prompt = `Calculate the estimated carbon savings from recycling this product:
  
Product Details:
- Name: ${product.product_name}
- Category: ${product.category}
- Material: ${product.material}
- Weight: ${weight} kg
- Size: ${product.size || 'standard'}

Please provide:
1. Estimated carbon saved in kg CO2 based on the weight and material type
2. Equivalent number of trees planted (1 tree absorbs ~21 kg CO2/year)
3. Brief explanation of the calculation

Respond ONLY with a valid JSON object in this exact format:
{
  "carbon_saved_kg": <number>,
  "equivalent_trees": <number>,
  "explanation": "<string>"
}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error("Failed to calculate carbon savings");
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || "";
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const carbonData = JSON.parse(jsonMatch[0]);
      return {
        carbon_saved_kg: parseFloat(carbonData.carbon_saved_kg) || 0,
        equivalent_trees: parseFloat(carbonData.equivalent_trees) || 0,
        explanation: carbonData.explanation || "Carbon savings calculated based on material recycling benefits"
      };
    }
    
    // Fallback calculation if Gemini fails
    return getFallbackCarbonSavings(product);
  } catch (error) {
    console.error("Gemini API error:", error);
    return getFallbackCarbonSavings(product);
  }
};

// Fallback carbon calculation based on weight and material
const getFallbackCarbonSavings = (product: Product): CarbonSavings => {
  // Carbon savings per kg of material recycled (kg CO2 per kg of material)
  const materialFactors: { [key: string]: number } = {
    plastic: 2.5,      // 2.5 kg CO2 saved per kg of plastic
    metal: 3.5,        // 3.5 kg CO2 saved per kg of metal
    electronics: 5.0,  // 5.0 kg CO2 saved per kg of electronics
    glass: 0.8,        // 0.8 kg CO2 saved per kg of glass
    paper: 1.2,        // 1.2 kg CO2 saved per kg of paper
    fabric: 1.5,       // 1.5 kg CO2 saved per kg of fabric
    wood: 1.0          // 1.0 kg CO2 saved per kg of wood
  };
  
  // Estimate weight based on product name/category if not provided
  const estimateWeight = (): number => {
    const name = product.product_name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    
    // Check product name for common items
    if (name.includes('laptop') || name.includes('computer')) return 2.5;
    if (name.includes('phone') || name.includes('mobile')) return 0.2;
    if (name.includes('tablet')) return 0.5;
    if (name.includes('chair')) return 8.5;
    if (name.includes('table') || name.includes('desk')) return 15.0;
    if (name.includes('bottle')) return 0.15;
    if (name.includes('bag')) return 0.3;
    if (name.includes('shirt') || name.includes('cloth')) return 0.25;
    
    // Check category
    if (category.includes('electronic')) return 2.0;
    if (category.includes('furniture')) return 10.0;
    if (category.includes('clothing') || category.includes('fabric')) return 0.3;
    if (category.includes('household')) return 0.5;
    
    return 1.0; // Default
  };
  
  // Parse weight as number, or estimate if not provided
  const weight = product.weight ? parseFloat(product.weight.toString()) : estimateWeight();
  const factor = materialFactors[product.material.toLowerCase()] || 2.0;
  const carbon_saved_kg = factor * weight;
  
  // Debug logging
  console.log('🔍 Carbon Calculation Debug:');
  console.log('Product:', product.product_name);
  console.log('Weight (raw):', product.weight, typeof product.weight);
  console.log('Weight (parsed/estimated):', weight, typeof weight);
  console.log('Material:', product.material);
  console.log('Factor:', factor);
  console.log('Carbon Saved:', carbon_saved_kg);
  
  const weightSource = product.weight ? 'actual' : 'estimated';
  
  return {
    carbon_saved_kg: parseFloat(carbon_saved_kg.toFixed(2)),
    equivalent_trees: parseFloat((carbon_saved_kg / 21).toFixed(2)),
    explanation: `Recycling ${weight} kg (${weightSource}) of ${product.material} saves approximately ${carbon_saved_kg.toFixed(2)} kg of CO2 emissions compared to producing new materials.`
  };
};

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
  price?: number;
  weight?: number;
  added_at?: string;
  registered_date?: string;
  registered_by?: string;
  currentStatus?: string;
};

type RewardCalculation = {
  material: string;
  price: number;
  days_difference: number;
  reward_points: number;
};

type CarbonSavings = {
  carbon_saved_kg: number;
  equivalent_trees: number;
  explanation: string;
};

type Stats = {
  registeredProducts: number;
  collected: number;
  pendingPickup: number;
  totalRewards: number;
};

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [calculatedReward, setCalculatedReward] = useState<RewardCalculation | null>(null);
  const [carbonSavings, setCarbonSavings] = useState<CarbonSavings | null>(null);
  const [isCalculatingReward, setIsCalculatingReward] = useState(false);
  const [isCalculatingCarbon, setIsCalculatingCarbon] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  
  const userEmail = getUserEmail();
  const userRole = getUserRole();

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (rfid: string) => {
      if (!userEmail) throw new Error("User email not found");
      return deleteProductHardcoded(rfid, userEmail);
    },
    onSuccess: () => {
      toast({
        title: "Product Deleted ✅",
        description: "Product has been removed from your list",
      });
      queryClient.invalidateQueries({ queryKey: ["all_products"] });
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

  // Fetch all products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["all_products", userEmail],
    queryFn: async () => {
      if (!userEmail) throw new Error("User email not found");
      return await api.getProductsByEmail(userEmail);
    },
    enabled: !!userEmail,
  });

  const products: Product[] = productsData?.products || [];

  // Separate products by status
  const activeProducts = products.filter(p => 
    !p.currentStatus || p.currentStatus === "Registered" || p.currentStatus === "Active"
  );
  
  const pendingPickupProducts = products.filter(p => 
    p.currentStatus === "Pending Pickup"
  );
  
  const collectedProducts = products.filter(p => 
    p.currentStatus === "Collected" || p.currentStatus === "Processing" || p.currentStatus === "Recycled"
  );
  
  // Debug: Log collected products with weight
  console.log('📊 Collected Products for Carbon Calculation:', collectedProducts.map(p => ({
    name: p.product_name,
    weight: p.weight,
    material: p.material,
    status: p.currentStatus
  })));

  // Calculate rewards: only from collected products (completed recycling)
  const earnedRewards = collectedProducts.reduce((sum, product) => {
    return sum + (product.price ? product.price * 0.12 : 0);
  }, 0);

  // Calculate pending rewards: from active and pending pickup products
  const pendingRewards = [...activeProducts, ...pendingPickupProducts].reduce((sum, product) => {
    return sum + (product.price ? product.price * 0.12 : 0);
  }, 0);

  // Calculate total carbon saved (estimated from collected products using weight)
  const totalCarbonSaved = collectedProducts.reduce((sum, product) => {
    const materialFactors: { [key: string]: number } = {
      plastic: 2.5,      // kg CO2 per kg
      metal: 3.5,
      electronics: 5.0,
      glass: 0.8,
      paper: 1.2,
      fabric: 1.5,
      wood: 1.0
    };
    
    // Estimate weight based on product name/category if not provided
    const estimateWeight = (): number => {
      const name = product.product_name?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      
      // Check product name for common items
      if (name.includes('laptop') || name.includes('computer')) return 2.5;
      if (name.includes('phone') || name.includes('mobile')) return 0.2;
      if (name.includes('tablet')) return 0.5;
      if (name.includes('chair')) return 8.5;
      if (name.includes('table') || name.includes('desk')) return 15.0;
      if (name.includes('bottle')) return 0.15;
      if (name.includes('bag')) return 0.3;
      if (name.includes('shirt') || name.includes('cloth')) return 0.25;
      
      // Check category
      if (category.includes('electronic')) return 2.0;
      if (category.includes('furniture')) return 10.0;
      if (category.includes('clothing') || category.includes('fabric')) return 0.3;
      if (category.includes('household')) return 0.5;
      
      return 1.0; // Default
    };
    
    // Parse weight as number, or estimate if not provided
    const weight = product.weight ? parseFloat(product.weight.toString()) : estimateWeight();
    const factor = materialFactors[product.material.toLowerCase()] || 2.0;
    const carbonSaved = factor * weight;
    
    console.log('💚 Total Carbon Calculation:', {
      product: product.product_name,
      weight_raw: product.weight,
      weight_parsed: weight,
      material: product.material,
      factor: factor,
      carbonSaved: carbonSaved,
      runningTotal: sum + carbonSaved
    });
    
    return sum + carbonSaved;
  }, 0);

  const stats: Stats = {
    registeredProducts: activeProducts.length,
    collected: collectedProducts.length,
    pendingPickup: pendingPickupProducts.length,
    totalRewards: Math.round(earnedRewards * 100) / 100,
  };

  // Calculate reward mutation
  const calculateRewardMutation = useMutation({
    mutationFn: async (data: {
      material: string;
      price: number;
      manufacture_date: string;
      registered_date: string;
    }) => {
      // Hardcoded API call
      const FASTAPI_BASE = "https://api-hack-virid.vercel.app";
      const response = await fetch(`${FASTAPI_BASE}/calculate-reward/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: (data: RewardCalculation) => {
      setCalculatedReward(data);
      toast({
        title: "Reward Calculated!",
        description: `You'll earn ₹${data.reward_points.toFixed(2)} when this product is collected!`,
        duration: 5000,
      });
    },
    onError: () => {
      setCalculatedReward(null);
    },
  });

  // Calculate carbon savings mutation
  const calculateCarbonMutation = useMutation({
    mutationFn: async (product: Product) => {
      return await calculateCarbonSavings(product);
    },
    onSuccess: (data: CarbonSavings) => {
      setCarbonSavings(data);
    },
    onError: () => {
      setCarbonSavings(null);
    },
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productRfid: string) => {
      if (!userEmail) throw new Error("User email not found");
      
      // Hardcoded API call
      const FASTAPI_BASE = "https://api-hack-virid.vercel.app";
      const response = await fetch(`${FASTAPI_BASE}/add_product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          added_at: new Date().toISOString(),
          product_rfid: productRfid,
        })
      });
      
      const result = await response.json();
      if (result.status !== "success") {
        throw new Error(result.detail || result.message || "Failed to add product");
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: calculatedReward 
          ? `Product added! You'll earn ₹${calculatedReward.reward_points.toFixed(2)} when collected!`
          : "Product added to your account successfully!",
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["all_products", userEmail] });
      setShowProductDetails(false);
      setScannedProduct(null);
      setCalculatedReward(null);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to add product";
      toast({
        title: "Cannot Add Product",
        description: errorMessage.includes("already been") 
          ? errorMessage 
          : "This product cannot be registered. It may have already been recycled.",
        variant: "destructive",
        duration: 6000,
      });
      // Close the dialog on error
      setShowProductDetails(false);
      setScannedProduct(null);
      setCalculatedReward(null);
    },
  });

  const handleScanComplete = async (code: string) => {
    try {
      // Hardcoded API call
      const FASTAPI_BASE = "https://api-hack-virid.vercel.app";
      const response = await fetch(`${FASTAPI_BASE}/product_by_rfid/${encodeURIComponent(code)}`);
      const data = await response.json();
      
      if (data.status === "success" && data.product) {
        // Check if product has already been recycled
        const recycledStatuses = ["Collected", "Processing", "Recycled", "Pending Pickup"];
        if (recycledStatuses.includes(data.product.currentStatus)) {
          toast({
            title: "Product Already Recycled",
            description: `This product has already been ${data.product.currentStatus.toLowerCase()} and cannot be registered again.`,
            variant: "destructive",
          });
          return;
        }
        
        setScannedProduct(data.product);
        setShowProductDetails(true);
        setCalculatedReward(null);
        setCarbonSavings(null);
        
        toast({
          title: "Product Found",
          description: `${data.product.product_name} - ${data.product.rfid}`,
        });

        // Calculate reward
        if (data.product.price) {
          setIsCalculatingReward(true);
          calculateRewardMutation.mutate({
            material: data.product.material,
            price: parseFloat(data.product.price),
            manufacture_date: data.product.manufacture_date,
            registered_date: new Date().toISOString(),
          });
          setIsCalculatingReward(false);
        }

        // Calculate carbon savings
        setIsCalculatingCarbon(true);
        calculateCarbonMutation.mutate(data.product);
        setIsCalculatingCarbon(false);
      } else {
        toast({
          title: "Product Not Found",
          description: `No product found with RFID: ${code}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scan product",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = () => {
    if (scannedProduct && userEmail) {
      if (!scannedProduct.TXN) {
        toast({
          title: "Error",
          description: "Product transaction ID not found",
          variant: "destructive",
        });
        return;
      }
      
      addProductMutation.mutate(scannedProduct.rfid);
    } else if (!userEmail) {
      toast({
        title: "Error",
        description: "Please login to add products",
        variant: "destructive",
      });
    }
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
          <Badge variant="secondary" className="bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Recycled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Package className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
    }
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white" data-testid="text-page-title">
                Customer Dashboard
              </h1>
              <p className="text-white/90 mt-1 text-lg">
                Register products for recycling and track your rewards
              </p>
            </div>
          </div>
          {userEmail && (
            <p className="text-sm text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Logged in as: {userEmail}
            </p>
          )}
        </div>
      </div>

      {/* Scanner and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScannerInterface onScanComplete={handleScanComplete} />
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden relative hover:shadow-xl transition-all duration-300 border-2 border-blue-200/50 dark:border-blue-800/50">
            {/* Subtle wave decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <RequestPickupDialog 
                trigger={
                  <Button className="w-full" variant="outline" data-testid="button-request-pickup">
                    <Truck className="w-4 h-4 mr-2" />
                    Request Pickup
                  </Button>
                }
              />
              <Button className="w-full" variant="outline" data-testid="button-find-dropoff">
                <MapPin className="w-4 h-4 mr-2" />
                Find Drop-off Point
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => setActiveTab("pickups")}
                data-testid="button-view-pickups"
              >
                <Truck className="w-4 h-4 mr-2" />
                View My Pickups
                {pendingPickupProducts.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-yellow-500/20 text-yellow-700">
                    {pendingPickupProducts.length}
                  </Badge>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            {/* Animated Wave Background */}
            <div className="absolute inset-0">
              <svg className="absolute bottom-0 w-full h-24 opacity-30" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="white" className="animate-pulse" style={{ animationDuration: '4s' }} />
              </svg>
              <svg className="absolute bottom-0 w-full h-20 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,0 C200,80 400,20 600,60 C800,100 1000,40 1200,80 L1200,120 L0,120 Z" fill="white" className="animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
              </svg>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                Earned Rewards
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">
                From collected products
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-5xl font-bold mb-2 drop-shadow-lg" data-testid="text-total-rewards">
                ₹{stats.totalRewards.toFixed(2)}
              </div>
              <p className="text-sm text-white/90 flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" />
                1 point = ₹1
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scanned Product Details Dialog */}
      <Dialog open={showProductDetails} onOpenChange={(open) => {
        setShowProductDetails(open);
        if (!open) {
          setScannedProduct(null);
          setCalculatedReward(null);
        }
      }}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-300">
          {/* Wave Background Header */}
          <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 pt-8 pb-16 px-6 overflow-hidden">
            {/* Animated Wave SVG */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg className="w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path 
                  d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" 
                  fill="white"
                  className="animate-pulse"
                  style={{ animationDuration: '3s' }}
                />
              </svg>
            </div>
            
            {/* Header Content */}
            <DialogHeader className="relative z-10">
              <DialogTitle className="flex items-center gap-3 text-white text-2xl">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Package className="w-6 h-6" />
                </div>
                Scanned Product Details
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base mt-2">
                Review product information and add to your account
              </DialogDescription>
            </DialogHeader>
          </div>
          
          {/* Content Area */}
          {scannedProduct && (
            <div className="space-y-4 p-6 max-h-[calc(90vh-180px)] overflow-y-auto animate-in slide-in-from-bottom-4 duration-500">
              {calculatedReward && (
                <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800 shadow-lg animate-in slide-in-from-top-2 duration-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          Estimated Reward
                        </div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 animate-in zoom-in-50 duration-700">
                          ₹{calculatedReward.reward_points.toFixed(2)}
                        </div>
                        <div className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-2 font-medium">
                          💰 Earn when product is collected • 1 point = ₹1
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <Award className="w-16 h-16 text-blue-600 dark:text-blue-400 relative animate-in spin-in-180 duration-1000" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {calculateRewardMutation.isPending && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Calculating your reward...</p>
                </CardContent>
              </Card>
            )}

            {/* Carbon Savings Display */}
            {carbonSavings && (
              <Card className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-300 dark:from-teal-950/20 dark:to-blue-950/20 dark:border-teal-800 shadow-lg animate-in slide-in-from-top-2 duration-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-teal-500/20 rounded-lg">
                        <Recycle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-teal-700 dark:text-teal-300">
                          🌍 Carbon Impact
                        </div>
                        <div className="text-xs text-teal-600/70 dark:text-teal-400/70">
                          Environmental benefit of recycling
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                        <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                          {carbonSavings.carbon_saved_kg.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">kg CO₂ saved</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                        <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                          {carbonSavings.equivalent_trees.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">🌳 trees/year</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-teal-700/80 dark:text-teal-300/80 bg-teal-100/50 dark:bg-teal-900/20 p-3 rounded-lg">
                      {carbonSavings.explanation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {calculateCarbonMutation.isPending && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
                  <p className="text-sm text-muted-foreground">Calculating carbon savings with AI...</p>
                </CardContent>
              </Card>
            )}

              <div className="grid grid-cols-2 gap-4 animate-in fade-in-50 duration-700">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Product Name</div>
                  <div className="font-semibold text-sm">{scannedProduct.product_name}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">RFID</div>
                  <code className="text-sm font-mono font-semibold">
                    {scannedProduct.rfid}
                  </code>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800">
                  <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">Category</div>
                  <div className="capitalize font-semibold text-sm">{scannedProduct.category}</div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border border-teal-200 dark:border-teal-800">
                  <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">Material</div>
                  <div className="capitalize font-semibold text-sm">{scannedProduct.material}</div>
                </div>
              {scannedProduct.size && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Size</div>
                  <div className="uppercase">{scannedProduct.size}</div>
                </div>
              )}
              {scannedProduct.batch_no && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Batch No</div>
                  <code className="text-sm font-mono">{scannedProduct.batch_no}</code>
                </div>
              )}
              {scannedProduct.price && (
                <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Price</div>
                  <div className="font-semibold text-sm">₹{parseFloat(scannedProduct.price.toString()).toFixed(2)}</div>
                </div>
              )}
              {scannedProduct.weight && (
                <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800">
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">Weight</div>
                  <div className="font-semibold text-sm">{parseFloat(scannedProduct.weight.toString()).toFixed(2)} kg</div>
                </div>
              )}
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Manufacture Date</div>
                <div>
                  {new Date(scannedProduct.manufacture_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Company</div>
                <div className="text-sm">{scannedProduct.company_email}</div>
              </div>
              <div className="col-span-2">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Registration Date
                  </div>
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} (Today)
                  </div>
                  <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    This will be recorded when you add the product
                  </div>
                </div>
              </div>
            </div>
              <div className="flex gap-3 pt-6 animate-in slide-in-from-bottom-4 duration-700">
                <Button 
                  onClick={handleAddProduct} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                  disabled={addProductMutation.isPending}
                >
                  {addProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      {calculatedReward ? `Add & Earn ₹${calculatedReward.reward_points.toFixed(2)}` : 'Add to My Products'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 hover:bg-muted/50 transition-all duration-300 h-12"
                  onClick={() => {
                    setShowProductDetails(false);
                    setLocation(`/product/${scannedProduct.rfid}`);
                  }}
                >
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Registered Products"
          value={stats.registeredProducts.toString()}
          icon={Scan}
        />
        <StatsCard
          title="Collected"
          value={stats.collected.toString()}
          icon={Recycle}
        />
        <StatsCard
          title="Pending Pickup"
          value={stats.pendingPickup.toString()}
          icon={Truck}
        />
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingRewards.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From active & pickup products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Carbon Savings Stats */}
      {collectedProducts.length > 0 && (
        <Card className="overflow-hidden relative bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white border-0 shadow-2xl">
          <div className="absolute inset-0">
            <svg className="absolute bottom-0 w-full h-20 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="white" className="animate-pulse" style={{ animationDuration: '5s' }} />
            </svg>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Recycle className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Carbon Saved</span>
                </div>
                <div className="text-4xl font-bold mb-2">
                  {totalCarbonSaved.toFixed(1)} kg CO₂
                </div>
                <p className="text-sm text-white/90">
                  🌍 Equivalent to {(totalCarbonSaved / 21).toFixed(2)} trees planted for a year
                </p>
              </div>
              <div className="text-6xl opacity-20">🌱</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Products and Pickups */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-blue-100/50 dark:bg-blue-900/20 p-1">
          <TabsTrigger 
            value="products" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Package className="w-4 h-4" />
            My Products
            {activeProducts.length > 0 && (
              <Badge variant="secondary" className="ml-1">{activeProducts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="pickups" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Truck className="w-4 h-4" />
            Pending Pickups
            {pendingPickupProducts.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingPickupProducts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white transition-all duration-300"
          >
            <Recycle className="w-4 h-4" />
            Collection History
            {collectedProducts.length > 0 && (
              <Badge variant="secondary" className="ml-1">{collectedProducts.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* My Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Registered Products</h2>
            {activeProducts.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {activeProducts.length} product{activeProducts.length !== 1 ? 's' : ''} ready for pickup
              </p>
            )}
          </div>
          
          {activeProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No active products. Scan a product to get started.
                </p>
                <p className="text-sm text-muted-foreground">
                  Earn reward points for every product you register for recycling!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProducts.map((product) => (
                <Card key={product._id} className="group overflow-hidden relative border-2 border-blue-200/50 dark:border-blue-800/50 bg-white dark:bg-gray-950 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-2">
                  {/* Wave Background - Always visible with gradient */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                    <svg className="absolute bottom-0 w-full h-16 opacity-20 group-hover:opacity-40 transition-opacity duration-300" viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="url(#wave-gradient)" className="animate-pulse" style={{ animationDuration: '4s' }} />
                      <defs>
                        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <CardContent className="p-4 space-y-3 relative z-10">
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
                    
                    {product.registered_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Registered: {new Date(product.registered_date).toLocaleDateString()}
                      </p>
                    )}
                    
                    {product.price && (
                      <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        Pending: ~₹{(parseFloat(product.price.toString()) * 0.12).toFixed(2)}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setLocation(`/product/${product.rfid}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.rfid)}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Pickups Tab */}
        <TabsContent value="pickups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pending Pickups</h2>
            {pendingPickupProducts.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {pendingPickupProducts.length} product{pendingPickupProducts.length !== 1 ? 's' : ''} awaiting pickup
              </p>
            )}
          </div>
          
          {pendingPickupProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No pending pickups at the moment.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Request a pickup for your registered products to start the recycling process!
                </p>
                <RequestPickupDialog 
                  trigger={
                    <Button variant="outline">
                      <Truck className="w-4 h-4 mr-2" />
                      Request Pickup
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        Pickup Requests in Progress
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Your products are scheduled for pickup. Our team will collect them soon!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPickupProducts.map((product) => (
                  <Card key={product._id} className="group overflow-hidden relative border-2 border-yellow-200/50 dark:border-yellow-800/50 bg-white dark:bg-gray-950 hover:shadow-2xl hover:border-yellow-400 transition-all duration-300 hover:-translate-y-2">
                    {/* Wave Background - Always visible with gradient */}
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-amber-950/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                      <svg className="absolute bottom-0 w-full h-16 opacity-20 group-hover:opacity-40 transition-opacity duration-300" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="url(#wave-gradient-pending)" className="animate-pulse" style={{ animationDuration: '4s' }} />
                        <defs>
                          <linearGradient id="wave-gradient-pending" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#eab308" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <CardContent className="p-4 space-y-3 relative z-10">
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
                      
                      {product.registered_date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Registered: {new Date(product.registered_date).toLocaleDateString()}
                        </p>
                      )}
                      
                      {product.price && (
                        <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          Pending: ~₹{(parseFloat(product.price.toString()) * 0.12).toFixed(2)}
                        </p>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setLocation(`/product/${product.rfid}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Collection History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Collection History</h2>
            {collectedProducts.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {collectedProducts.length} product{collectedProducts.length !== 1 ? 's' : ''} collected
              </p>
            )}
          </div>
          
          {collectedProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Recycle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No collection history yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Once your products are collected, they will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectedProducts.map((product) => (
                <Card key={product._id} className="group overflow-hidden relative border-2 border-green-200/50 dark:border-green-800/50 bg-white dark:bg-gray-950 hover:shadow-2xl hover:border-green-400 transition-all duration-300 hover:-translate-y-2">
                  {/* Wave Background - Always visible with gradient */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                    <svg className="absolute bottom-0 w-full h-16 opacity-20 group-hover:opacity-40 transition-opacity duration-300" viewBox="0 0 1200 120" preserveAspectRatio="none">
                      <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="url(#wave-gradient-collected)" className="animate-pulse" style={{ animationDuration: '4s' }} />
                      <defs>
                        <linearGradient id="wave-gradient-collected" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <CardContent className="p-4 space-y-3 relative z-10">
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
                    
                    {product.added_at && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Collected: {new Date(product.added_at).toLocaleDateString()}
                      </p>
                    )}
                    
                    {product.price && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          Earned: ₹{(parseFloat(product.price.toString()) * 0.12).toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setLocation(`/product/${product.rfid}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
