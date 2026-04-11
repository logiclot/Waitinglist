import { useBusinessDelete, useBusinesses } from "@/hooks/use-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

function BusinessManagementSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="px-6">Business</TableHead>
            <TableHead className="px-6">Email</TableHead>
            <TableHead className="px-6">Company</TableHead>
            <TableHead className="px-6">Country</TableHead>
            <TableHead className="px-6">Joined</TableHead>
            <TableHead className="px-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="px-6 py-4">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <div className="h-4 w-4 bg-muted animate-pulse rounded ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function BusinessManagement() {
  const { data: businesses, isPending } = useBusinesses();
  const { mutateAsync: deleteBusiness, isPending: isDeleting } =
    useBusinessDelete();

  const handleDelete = async (id: string, email: string) => {
    if (
      !confirm(
        `Delete user ${email}? This removes all their data permanently.`,
      )
    )
      return;
    await deleteBusiness({ id });
  };

  if (isPending) {
    return <BusinessManagementSkeleton />;
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/50">
          <TableRow>
            <TableHead className="px-6">Business</TableHead>
            <TableHead className="px-6">Email</TableHead>
            <TableHead className="px-6">Company</TableHead>
            <TableHead className="px-6">Country</TableHead>
            <TableHead className="px-6">Joined</TableHead>
            <TableHead className="px-6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businesses?.map((b) => (
            <TableRow key={b.id} className="hover:bg-secondary/20">
              <TableCell className="px-6 py-4 font-medium">
                {b.firstName}
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground">
                {b.user?.email || "—"}
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground">
                {b.companyName || "—"}
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground">
                {b.country || "—"}
              </TableCell>
              <TableCell className="px-6 py-4 text-muted-foreground text-xs">
                {b.user?.createdAt
                  ? new Date(b.user.createdAt).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <button
                  onClick={() => handleDelete(b.id, b.user?.email)}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded disabled:opacity-50"
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {(!businesses || businesses.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="px-6 py-8 text-center text-muted-foreground text-sm"
              >
                No businesses yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
