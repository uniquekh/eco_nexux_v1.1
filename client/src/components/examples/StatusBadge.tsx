import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-6">
      <StatusBadge status="Manufactured" />
      <StatusBadge status="Sold" />
      <StatusBadge status="Used" />
      <StatusBadge status="Returned" />
      <StatusBadge status="Collected" />
      <StatusBadge status="In Inventory" />
      <StatusBadge status="Sent to Recycling" />
      <StatusBadge status="Recycled" />
    </div>
  );
}
