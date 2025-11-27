import { PickupRequestCard } from "../PickupRequestCard";

export default function PickupRequestCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      <PickupRequestCard
        id="PR-2024-001"
        productCount={3}
        customerName="Sarah Johnson"
        location="123 Oak Street, Downtown"
        preferredDate="Oct 15, 2024"
        status="Pending"
        onAssign={() => console.log("Assign clicked")}
      />
      <PickupRequestCard
        id="PR-2024-002"
        productCount={1}
        customerName="Mike Chen"
        location="456 Maple Ave, Westside"
        preferredDate="Oct 16, 2024"
        status="Assigned"
        assignedAgent="Agent #042"
        onComplete={() => console.log("Complete clicked")}
      />
      <PickupRequestCard
        id="PR-2024-003"
        productCount={2}
        customerName="Emma Davis"
        location="789 Pine Road, Eastside"
        preferredDate="Oct 14, 2024"
        status="Completed"
        assignedAgent="Agent #015"
      />
    </div>
  );
}
