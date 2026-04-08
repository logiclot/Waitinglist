"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import {
  BanknoteIcon,
  CheckCircleIcon,
  ArrowUpDownIcon,
  EyeIcon,
  Loader2Icon,
} from "lucide-react";

// ---------- Types ----------

interface Payout {
  id: string;
  specialistId: string;
  orderId: string;
  milestoneIndex: number;
  milestoneTitle: string;
  amountCents: number;
  platformFeeCents: number;
  currency: string;
  status: string;
  transferredAt: string | null;
  transferNote: string | null;
  createdAt: string;
  specialist: {
    id: string;
    displayName: string;
    legalFullName: string;
    country: string;
    bankAccountHolder: string | null;
    bankIban: string | null;
    bankSwiftBic: string | null;
    bankName: string | null;
    bankCurrency: string | null;
    user: { email: string };
  };
  order: {
    id: string;
    buyer: {
      email: string;
      businessProfile: { companyName: string } | null;
    };
  };
}

type StatusFilter = "all" | "pending" | "transferred" | "cancelled";

// ---------- Helpers ----------

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(cents / 100);
}

const statusBadge: Record<string, { variant: BadgeVariant; label: string }> = {
  pending: { variant: "warning", label: "Pending" },
  transferred: { variant: "success", label: "Transferred" },
  cancelled: { variant: "info", label: "Cancelled" },
};

// ---------- Bank Details Dialog ----------

function BankDetailsDialog({ specialist }: { specialist: Payout["specialist"] }) {
  const details = [
    { label: "Account Holder", value: specialist.bankAccountHolder },
    { label: "IBAN", value: specialist.bankIban },
    { label: "SWIFT / BIC", value: specialist.bankSwiftBic },
    { label: "Bank Name", value: specialist.bankName },
    { label: "Preferred Currency", value: specialist.bankCurrency },
    { label: "Country", value: specialist.country },
    { label: "Email", value: specialist.user.email },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="xs">
          <EyeIcon data-icon="inline-start" />
          Bank Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Bank Details &mdash; {specialist.displayName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          {details.map((d) => (
            <div key={d.label} className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-xs">{d.label}</span>
              <span className="font-medium select-all">
                {d.value || <span className="text-muted-foreground italic">Not provided</span>}
              </span>
            </div>
          ))}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

// ---------- Mark Transferred Dialog ----------

function MarkTransferredDialog({ payout }: { payout: Payout }) {
  const [note, setNote] = useState(payout.transferNote || "");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/payouts/${payout.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "transferred", transferNote: note }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="xs">
          <CheckCircleIcon data-icon="inline-start" />
          Mark Paid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          <p>
            Mark <strong>{formatCents(payout.amountCents, payout.currency)}</strong>{" "}
            to <strong>{payout.specialist.displayName}</strong> as transferred?
          </p>
          <div className="flex flex-col gap-1">
            <label htmlFor="transfer-note" className="text-xs text-muted-foreground">
              Transfer reference (optional)
            </label>
            <input
              id="transfer-note"
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="e.g. Wise transfer #12345"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Columns ----------

const columns: ColumnDef<Payout>[] = [
  {
    accessorKey: "specialist.displayName",
    header: "Expert",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.specialist.displayName}</span>
        <span className="text-xs text-muted-foreground">{row.original.specialist.country}</span>
      </div>
    ),
  },
  {
    accessorKey: "milestoneTitle",
    header: "Milestone",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.milestoneTitle}</span>
        <span className="text-xs text-muted-foreground">
          Order: {row.original.orderId.slice(0, 8)}...
        </span>
      </div>
    ),
  },
  {
    accessorKey: "order.buyer.email",
    header: "Buyer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.order.buyer.businessProfile?.companyName || "N/A"}</span>
        <span className="text-xs text-muted-foreground">{row.original.order.buyer.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "amountCents",
    header: "Amount",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {formatCents(row.original.amountCents, row.original.currency)}
        </span>
        <span className="text-xs text-muted-foreground">
          Fee: {formatCents(row.original.platformFeeCents, row.original.currency)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = statusBadge[row.original.status] || statusBadge.pending;
      return <Badge variant={s.variant} label={s.label} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <BankDetailsDialog specialist={row.original.specialist} />
        {row.original.status === "pending" && (
          <MarkTransferredDialog payout={row.original} />
        )}
        {row.original.status === "transferred" && row.original.transferNote && (
          <span className="text-xs text-muted-foreground max-w-[140px] truncate" title={row.original.transferNote}>
            {row.original.transferNote}
          </span>
        )}
      </div>
    ),
  },
];

// ---------- Main Component ----------

export function PayoutsTable() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, error } = useQuery<{ payouts: Payout[] }>({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payouts");
      if (!res.ok) throw new Error("Failed to fetch payouts");
      return res.json();
    },
  });

  const filteredData = useMemo(
    () =>
      data?.payouts.filter((p) =>
        statusFilter === "all" ? true : p.status === statusFilter
      ) ?? [],
    [data, statusFilter]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const pendingCount = data?.payouts.filter((p) => p.status === "pending").length ?? 0;
  const totalPending = data?.payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amountCents, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats + Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <BanknoteIcon className="size-4 text-muted-foreground" />
            <span>
              <strong>{pendingCount}</strong> pending
            </span>
            {pendingCount > 0 && (
              <span className="text-muted-foreground">
                ({formatCents(totalPending, "EUR")} total)
              </span>
            )}
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Payouts</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin mr-2" />
          Loading payouts...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Failed to load payouts. Please try again.
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No payouts found{statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}.
        </div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDownIcon className="size-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
