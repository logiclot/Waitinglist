"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface Business {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  country: string | null;
  freeDiscoveryScansRemaining: number;
  freeCustomProjects: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

async function fetchBusinesses(): Promise<Business[]> {
  const res = await fetch("/api/admin/businesses");
  if (!res.ok) throw new Error("Failed to fetch businesses");
  const data = await res.json();
  return data.businesses;
}

type GiftKind = "scan" | "customProject";

async function updateGift(
  businessProfileId: string,
  action: "increment" | "decrement",
  kind: GiftKind
) {
  const res = await fetch("/api/admin/businesses", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessProfileId, action, kind }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update");
  }
  return res.json();
}

function GiftControls({
  business,
  kind,
}: {
  business: Business;
  kind: GiftKind;
}) {
  const queryClient = useQueryClient();
  const count =
    kind === "scan"
      ? business.freeDiscoveryScansRemaining
      : business.freeCustomProjects;
  const label = kind === "scan" ? "scan" : "custom project";

  const mutation = useMutation({
    mutationFn: ({ action }: { action: "increment" | "decrement" }) =>
      updateGift(business.id, action, kind),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      if (action === "increment") {
        toast.success(`Free ${label} gifted to ${business.firstName}`);
      } else {
        toast.success(`${label} removed from ${business.firstName}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => mutation.mutate({ action: "decrement" })}
        disabled={mutation.isPending || count <= 0}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
      </button>
      <span className="w-6 text-center font-medium tabular-nums">{count}</span>
      <button
        onClick={() => mutation.mutate({ action: "increment" })}
        disabled={mutation.isPending}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function GiftScansTable() {
  const { data: businesses, isPending, error } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: fetchBusinesses,
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        Failed to load businesses.
      </div>
    );
  }

  if (!businesses?.length) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No businesses found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Joined on</TableHead>
          <TableHead>Gift Scans</TableHead>
          <TableHead>Gift Custom Projects</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businesses.map((biz) => (
          <TableRow key={biz.id}>
            <TableCell className="font-bold">
              {biz.firstName} {biz.lastName}
            </TableCell>
            <TableCell>{biz.user.email}</TableCell>
            <TableCell>{biz.companyName}</TableCell>
            <TableCell>{biz.country ?? "—"}</TableCell>
            <TableCell>
              {new Date(biz.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </TableCell>
            <TableCell>
              <GiftControls business={biz} kind="scan" />
            </TableCell>
            <TableCell>
              <GiftControls business={biz} kind="customProject" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
