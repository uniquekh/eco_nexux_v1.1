// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Upload, FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";

// interface BulkUploadDialogProps {
//   trigger?: React.ReactNode;
// }

// export function BulkUploadDialog({ trigger }: BulkUploadDialogProps) {
//   const [file, setFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [success, setSuccess] = useState(false);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//       setSuccess(false);
//     }
//   };

//   const handleUpload = () => {
//     if (!file) return;
    
//     setUploading(true);
//     setProgress(0);
//     console.log("Uploading file:", file.name);
    
//     // Simulate upload progress
//     const interval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(interval);
//           setUploading(false);
//           setSuccess(true);
//           return 100;
//         }
//         return prev + 10;
//       });
//     }, 200);
//   };

//   const downloadTemplate = () => {
//     console.log("Downloading CSV template");
//     // In real implementation, this would trigger a CSV download
//     alert("CSV template download started");
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         {trigger || (
//           <Button data-testid="button-bulk-upload">
//             <Upload className="w-4 h-4 mr-2" />
//             Bulk Upload
//           </Button>
//         )}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Bulk Upload Products</DialogTitle>
//           <DialogDescription>
//             Upload a CSV file with product information
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="space-y-4">
//           <Button 
//             variant="outline" 
//             className="w-full"
//             onClick={downloadTemplate}
//             data-testid="button-download-template"
//           >
//             <Download className="w-4 h-4 mr-2" />
//             Download CSV Template
//           </Button>
          
//           <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate">
//             <input
//               type="file"
//               accept=".csv,.xlsx"
//               onChange={handleFileChange}
//               className="hidden"
//               id="file-upload"
//               data-testid="input-file-upload"
//             />
//             <label 
//               htmlFor="file-upload" 
//               className="cursor-pointer flex flex-col items-center gap-2"
//             >
//               <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
//               <div className="text-sm text-muted-foreground">
//                 {file ? file.name : "Click to select CSV or Excel file"}
//               </div>
//             </label>
//           </div>
          
//           {file && !success && (
//             <>
//               {uploading && (
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Uploading...</span>
//                     <span>{progress}%</span>
//                   </div>
//                   <Progress value={progress} />
//                 </div>
//               )}
              
//               {!uploading && (
//                 <Button 
//                   className="w-full" 
//                   onClick={handleUpload}
//                   data-testid="button-start-upload"
//                 >
//                   <Upload className="w-4 h-4 mr-2" />
//                   Upload Products
//                 </Button>
//               )}
//             </>
//           )}
          
//           {success && (
//             <div className="flex items-center justify-center gap-2 text-status-collected py-4">
//               <CheckCircle2 className="w-5 h-5" />
//               <span className="font-medium">Upload successful!</span>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { getUserEmail } from "@/pages/LoginPage";
import { API_CONFIG } from '@/lib/config';

interface BulkUploadDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BulkUploadDialog({ trigger, onSuccess }: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ==================== HARDCODED API FUNCTIONS ====================

  // Generate unique RFID (Hardcoded logic from api.py)
  const generateUniqueRFID = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let rfid = '';
    for (let i = 0; i < 10; i++) {
      rfid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return rfid;
  };

  // Generate Transaction ID (Hardcoded logic from api.py)
  const generateTxnId = (email: string, date: string, rfid: string, prevTxnId: string | null) => {
    const data = `${email}|${date}|${rfid}|${prevTxnId || 'null'}`;
    
    // Simple hash function (SHA256 equivalent)
    const hash = async (str: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    };
    
    return hash(data).then(hashHex => {
      const shortHash = hashHex.substring(0, 16);
      const dateFormatted = date.replace(/-/g, '');
      return `TXN-${dateFormatted}-${shortHash}`;
    });
  };

  // Gemini AI categorization function (Hardcoded)
  const categorizeWithAI = async (productName: string, category?: string, material?: string) => {
    // If both category and material exist, return them
    if (category && material) {
      return { category, material };
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Given a product with name "${productName}", ${category ? `category "${category}"` : ''}, ${material ? `material "${material}"` : ''}, please provide:
1. A suitable product category (e.g., Electronics, Clothing, Furniture, Household, etc.)
2. The primary material (e.g., Plastic, Metal, Glass, Fabric, Wood, etc.)

Respond in JSON format: {"category": "...", "material": "..."}`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        return {
          category: category || aiData.category || "General",
          material: material || aiData.material || "Mixed"
        };
      }
    } catch (error) {
      console.error("AI categorization error:", error);
    }

    // Fallback
    return {
      category: category || "General",
      material: material || "Mixed"
    };
  };

  // Create product directly (Hardcoded MongoDB insert via FastAPI)
  const createProductHardcoded = async (productData: any) => {
    const rfid = generateUniqueRFID();
    const txn = await generateTxnId(
      productData.company_email,
      productData.manufacture_date,
      rfid,
      null
    );

    const newProduct = {
      TXN: txn,
      company_email: productData.company_email,
      product_name: productData.product_name,
      category: productData.category,
      material: productData.material,
      size: productData.size,
      weight: productData.weight,
      batch_no: productData.batch_no,
      price: productData.price,
      manufacture_date: productData.manufacture_date,
      rfid: rfid,
      created_at: new Date().toISOString(),
      currentStatus: "Registered"
    };

    // Call FastAPI to insert into MongoDB
    const response = await fetch(`${API_CONFIG.FASTAPI_BASE}/add_product_company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    });

    if (!response.ok) {
      throw new Error("Failed to create product");
    }

    const result = await response.json();
    return result.product;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setSuccess(false);
        setUploadResult(null);
      } else {
        toast({
          title: "Invalid file",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const companyEmail = getUserEmail();
      if (!companyEmail) {
        throw new Error("Company email not found");
      }

      // Read and parse CSV
      const text = await file.text();
      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });

      if (parseResult.errors.length > 0) {
        throw new Error("CSV parsing error");
      }

      const rows = parseResult.data as any[];
      if (rows.length === 0) {
        throw new Error("CSV file is empty");
      }

      const productsCreated = [];
      const errors = [];
      const totalRows = rows.length;

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        try {
          const productName = row.product_name || row.name;
          if (!productName) {
            errors.push({
              row: i + 1,
              error: "Missing product_name",
              data: row
            });
            continue;
          }

          // Update progress
          setProgress(Math.round(((i + 1) / totalRows) * 90));

          // Use AI to categorize
          const { category, material } = await categorizeWithAI(
            productName,
            row.category,
            row.material
          );

          // Create product using hardcoded function
          const productData = {
            company_email: companyEmail,
            product_name: productName,
            category,
            material,
            size: row.size || "",
            weight: row.weight || "1",
            batch_no: row.batch_no || row.batchNo || "",
            price: row.price || "0",
            manufacture_date: row.manufacture_date || new Date().toISOString().split('T')[0]
          };

          const product = await createProductHardcoded(productData);
          productsCreated.push(product);

        } catch (error: any) {
          errors.push({
            row: i + 1,
            error: error.message,
            data: row
          });
        }
      }

      setProgress(100);
      setSuccess(true);
      setUploadResult({
        totalRows: rows.length,
        successCount: productsCreated.length,
        errorCount: errors.length,
        products: productsCreated,
        errors: errors.length > 0 ? errors : null
      });

      toast({
        title: "Import Successful! ✨",
        description: `${productsCreated.length} products imported successfully${errors.length > 0 ? ` (${errors.length} errors)` : ""}`,
      });

      // Refresh products list
      queryClient.invalidateQueries({ queryKey: ["products_by_company"] });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setProgress(0);
        setUploadResult(null);
        setOpen(false);
      }, 3000);

    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload products",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `product_name,category,material,size,weight,batch_no,price,manufacture_date
Laptop Computer,Electronics,Metal,15 inch,2.5,BATCH001,75000,2024-01-15
Smartphone,Electronics,Glass,6.5 inch,0.2,BATCH002,45000,2024-01-20
Office Chair,Furniture,Plastic,Standard,8.5,BATCH003,12000,2024-02-01
Water Bottle,Household,Plastic,500ml,0.15,BATCH004,500,2024-02-05
Cotton T-Shirt,Clothing,Fabric,Large,0.25,BATCH005,800,2024-02-10`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Template Downloaded",
      description: "CSV template downloaded successfully",
    });
  };

  const resetDialog = () => {
    setFile(null);
    setSuccess(false);
    setProgress(0);
    setUploading(false);
    setUploadResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-bulk-upload">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Bulk Upload Products
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with product information. AI will help categorize your products automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <p className="text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Powered by Gemini AI for smart product categorization
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={downloadTemplate}
            data-testid="button-download-template"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>

          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              data-testid="input-file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {file ? (
                  <span className="text-primary font-medium">{file.name}</span>
                ) : (
                  "Click to select CSV file"
                )}
              </div>
            </label>
          </div>

          {file && !success && (
            <>
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing with AI...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {!uploading && (
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  data-testid="button-start-upload"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process Products
                </Button>
              )}
            </>
          )}

          {success && uploadResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 py-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Upload successful!</span>
              </div>
              
              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Rows:</span>
                  <span className="font-medium">{uploadResult.totalRows}</span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Successful:</span>
                  <span className="font-medium">{uploadResult.successCount}</span>
                </div>
                {uploadResult.errorCount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Errors:</span>
                    <span className="font-medium">{uploadResult.errorCount}</span>
                  </div>
                )}
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="text-sm text-red-900 dark:text-red-200">
                      <p className="font-medium mb-1">Some rows had errors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {uploadResult.errors.slice(0, 3).map((err: any, idx: number) => (
                          <li key={idx}>Row {err.row}: {err.error}</li>
                        ))}
                        {uploadResult.errors.length > 3 && (
                          <li>...and {uploadResult.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
