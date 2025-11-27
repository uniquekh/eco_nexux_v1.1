import { StatsCard } from "../StatsCard";
import { Package, Recycle, TrendingUp, DollarSign } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      <StatsCard
        title="Total Products"
        value="2,847"
        icon={Package}
        trend={{ value: "12% from last month", positive: true }}
      />
      <StatsCard
        title="Collected"
        value="1,243"
        icon={Recycle}
        trend={{ value: "8% from last month", positive: true }}
      />
      <StatsCard
        title="In Inventory"
        value="456"
        icon={TrendingUp}
      />
      <StatsCard
        title="Total Rewards"
        value="$3,240"
        icon={DollarSign}
        trend={{ value: "15% from last month", positive: true }}
      />
    </div>
  );
}
