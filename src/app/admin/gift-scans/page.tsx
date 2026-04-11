import { GiftScansTable } from "@/components/admin/GiftScansTable";

export default function GiftScan() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gift Scans to Business</h1>
      </div>
      <GiftScansTable />
    </div>
  );
}
