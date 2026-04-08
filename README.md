This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

https://docs.stripe.com/connect/express-accounts Our product is a marketplace application where experts post their solutions and businesses pay the solution upfront which stays in escrow (platforms stripe account) and split across milestones. Whenever a milestone is reached we need business can transfer the funds to experts who have created an express account using Stripe Connect Service. Platform keeps some money and rest is transferred to the expert. We have experts from Ukraine who cannot create an express account as stripe connect platform is not available in their country.
For now we don't have as much scale so I have planned a workaround for this, guide me through it. 

1. Save how much I owe to whom
2. Whenever I detect that the milestone payment is going to an expert with unsupported country I'll just add it in the payments table 
3. Transfer the amount manually when funds are released / transferred.

 
Can you please verify this idea ? Also tell me how and what details should I get from the expert as he is from ukraine or a different unsupported country?
