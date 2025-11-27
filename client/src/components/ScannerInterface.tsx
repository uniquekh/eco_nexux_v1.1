import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Keyboard, QrCode, Flashlight } from "lucide-react";

interface ScannerInterfaceProps {
  onScanComplete?: (code: string) => void;
}

export function ScannerInterface({ onScanComplete }: ScannerInterfaceProps) {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      console.log("Manual code submitted:", manualCode);
      onScanComplete?.(manualCode);
      setManualCode("");
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    console.log("Camera scanning started");
    // Simulate successful scan after 2 seconds
    setTimeout(() => {
      const mockCode = "RFID-2024-" + Math.floor(Math.random() * 10000).toString().padStart(5, "0");
      console.log("Scanned code:", mockCode);
      onScanComplete?.(mockCode);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Product</CardTitle>
        <CardDescription>
          Use your camera to scan a QR code or barcode, or enter the product code manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" data-testid="tab-camera-scan">
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual" data-testid="tab-manual-entry">
              <Keyboard className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            {!isScanning ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Position the QR code or barcode within the frame
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={startScanning}
                    data-testid="button-start-scan"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Scanning
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flashlight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
                  <Camera className="w-16 h-16 text-primary" />
                </div>
                <p className="text-sm text-primary font-medium">Scanning...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productCode">Product Code</Label>
                <Input
                  id="productCode"
                  placeholder="Enter RFID, NFC, QR, or Barcode"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  data-testid="input-product-code"
                  className="font-mono"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={!manualCode.trim()}
                data-testid="button-validate-code"
              >
                Validate Product
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
