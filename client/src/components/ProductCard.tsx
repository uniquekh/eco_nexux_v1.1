import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Package, ExternalLink, Tag, Layers, ArrowRight, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  productCode: string;
  name: string;
  category: string;
  material: string;
  status: "Manufactured" | "Sold" | "Used" | "Returned" | "Collected" | "In Inventory" | "Sent to Recycling" | "Recycled" | "Active";
  onViewDetails?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function ProductCard({ productCode, name, category, material, status, onViewDetails, onDelete, showDelete = false }: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="space-y-3 pb-4 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h3 
                className="font-semibold text-base leading-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-2" 
                data-testid={`text-product-name-${productCode}`}
                title={name}
              >
                {name}
              </h3>
              <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded" data-testid={`text-product-code-${productCode}`}>
                {productCode}
              </code>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <StatusBadge status={status} />
            {showDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    data-testid={`button-delete-${productCode}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3 relative">
        <div className="flex items-center gap-2 text-sm">
          <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground text-xs">Category:</span>
            <span className="text-foreground font-medium capitalize truncate">{category}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Layers className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground text-xs">Material:</span>
            <span className="text-foreground font-medium capitalize truncate">{material}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 relative">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group/btn hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
          onClick={() => {
            console.log(`View details for ${productCode}`);
            onViewDetails?.();
          }}
          data-testid={`button-view-details-${productCode}`}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Details
          <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" />
        </Button>
      </CardFooter>
    </Card>
  );
}