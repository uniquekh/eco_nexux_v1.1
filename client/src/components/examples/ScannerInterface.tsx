import { ScannerInterface } from "../ScannerInterface";

export default function ScannerInterfaceExample() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ScannerInterface
        onScanComplete={(code) => {
          console.log("Scan completed with code:", code);
          alert(`Product code validated: ${code}`);
        }}
      />
    </div>
  );
}
