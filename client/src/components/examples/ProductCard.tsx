import { ProductCard } from "../ProductCard";

export default function ProductCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <ProductCard
        productCode="RFID-2024-00001"
        name="Eco Water Bottle"
        category="Beverage Container"
        material="Recycled Plastic"
        status="Manufactured"
      />
      <ProductCard
        productCode="RFID-2024-00002"
        name="Bamboo Phone Case"
        category="Electronics Accessory"
        material="Bamboo Fiber"
        status="Collected"
      />
      <ProductCard
        productCode="RFID-2024-00003"
        name="Organic Cotton Tote"
        category="Bag"
        material="Organic Cotton"
        status="Recycled"
      />
    </div>
  );
}
