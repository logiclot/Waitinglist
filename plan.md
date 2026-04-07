```schema.prisma
enum PaymentStatus {
  pending
  succeeded
  failed
  refunded
  partially_refunded
}

enum PayoutProvider {
  stripe_connect
  wise
  manual
}

enum PayoutStatus {
  pending       // created in our DB, not yet sent
  processing    // sent to provider, in flight
  succeeded
  failed
  bounced       // Wise-specific: returned by recipient bank
  cancelled
}

// Money IN — what the buyer actually paid us
model Payment {
  id      String @id @default(uuid())
  orderId String
  order   Order  @relation(fields: [orderId], references: [id])

  // Amounts always in the smallest currency unit
  amountCents   Int
  currency      String  @default("usd")       // ISO 4217 lowercase
  feeCents      Int     @default(0)           // Stripe's fee
  netCents      Int                            // amountCents - feeCents
  refundedCents Int     @default(0)

  status PaymentStatus @default(pending)

  // Stripe references
  stripePaymentIntentId String? @unique
  stripeChargeId        String?
  stripeCustomerId      String?

  paymentMethod String?   // "card", "sepa_debit", etc. — useful for support
  paidAt        DateTime?
  failureReason String?

  // Raw provider payload for debugging / audit
  providerMetadata Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  payouts Payout[]

  @@index([orderId])
  @@index([status])
  @@index([stripePaymentIntentId])
}

// Money OUT — what we sent to the expert, per milestone
model Payout {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  paymentId String?                                    // which incoming payment funded this
  payment   Payment? @relation(fields: [paymentId], references: [id])

  expertId  String
  expert    SpecialistProfile @relation(fields: [expertId], references: [id])

  // Which milestone this payout corresponds to (index into Order.milestones,
  // or a stable milestone id if you promote milestones to their own table later)
  milestoneIndex Int?
  milestoneTitle String?

  // Amounts
  grossCents       Int     // what the milestone is worth
  platformFeeCents Int     // your commission
  netCents         Int     // what the expert actually receives
  currency         String  @default("usd")

  // Routing
  provider PayoutProvider
  status   PayoutStatus   @default(pending)

  // Stripe Connect fields
  stripeTransferId String? @unique
  stripeAccountId  String?

  // Wise fields
  wiseTransferId       String? @unique
  wiseQuoteId          String?
  wiseRecipientId      String?
  wiseCustomerTxnId    String? @unique   // idempotency key you generate
  wiseSourceCurrency   String?           // e.g. "USD"
  wiseTargetCurrency   String?           // e.g. "UAH"
  wiseExchangeRate     Decimal? @db.Decimal(18, 8)
  wiseProviderFeeCents Int?

  initiatedAt DateTime?
  completedAt DateTime?
  failedAt    DateTime?
  failureReason String?

  providerMetadata Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([expertId])
  @@index([status])
  @@index([provider, status])
}
```

### Explaination

Why this shape
One Payment row per Stripe charge, many Payout rows per Payment. This matches how your business actually works: buyer pays once upfront for an order, then you release money in chunks as milestones hit. Each milestone release is a separate Payout row, and the provider column is what lets you route Ukrainian experts through wise and everyone else through stripe*connect — your PayoutProvider abstraction from the last message maps one-to-one onto this column.
Amounts as Int cents, never Float or Decimal for the primary amount. You're already doing this correctly elsewhere (priceCents, implementationPriceCents), so stay consistent. The only Decimal I used above is wiseExchangeRate, because rates have more than 2 decimal places and aren't money-you-can-spend.
Currency column on every row, even if you're USD-only today. Wise payouts to Ukraine will involve UAH conversion. You want grossCents in USD and wiseTargetCurrency = "UAH" on the same row so reconciliation is possible. Adding currency later is painful; adding it now is free.
providerMetadata Json on both tables. Dump the raw Stripe/Wise webhook payload here. You will thank yourself the first time a payout goes weird and support needs to figure out what actually happened — you'll have the full provider response without having to dig through logs.
Idempotency keys as first-class columns. wiseCustomerTxnId is unique — generate it as something like payout*{payoutId} before calling Wise, store it, and pass it on every retry. This is how you survive your server crashing mid-request without double-paying an expert. Same principle applies to Stripe, but Stripe's idempotency is request-header based and less schema-visible.
A separate Payout table (not just JSON inside Order.milestones). I know it's tempting to keep extending the milestones JSON, but the moment you need to answer "how much have we paid out to expert X this month" or "which payouts are stuck in processing" you'll be writing horrible JSON queries. With a real table it's one SUM with a WHERE.
What to do with Order.milestones JSON
Keep it for now — it's fine as the definition of the milestones (title, description, planned price, delivery time). Think of it as the contract/spec. The Payout table becomes the execution log of those milestones. When a milestone is released, you create a Payout row pointing back at the milestone by index. Later, if you want, you can promote milestones to their own table, but you don't have to do that now to unblock Wise.
Migration path (roughly half a day)

Add the two models, run prisma migrate dev.
Backfill: for every existing Order with a stripePaymentIntentId, create one Payment row. You can do this in a one-off script by fetching each PaymentIntent from Stripe to get the real fee and net. For orders already past milestones, create historical Payout rows marked status: succeeded with whatever data you have — even partial history is better than none.
Update your checkout code: wherever you currently create a PaymentIntent, also create a Payment row in the same transaction.
Update your milestone-release code: instead of calling stripe.transfers.create directly, go through your PayoutProvider abstraction, which writes a Payout row first (status: pending), then calls the provider, then updates the row on webhook.

One more thing worth flagging: if you're operating in the EU (your schema has VAT fields, so I'm guessing yes), a proper payment ledger isn't just nice-to-have — it's something your accountant and potentially tax auditors will eventually want. Building it now, before you have thousands of rows to backfill, is much cheaper than building it later.
Want me to sketch the backfill script, or the PayoutProvider interface that reads/writes against this new schema?
