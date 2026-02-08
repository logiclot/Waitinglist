import { Solution, Category, Expert, Order, Conversation, Message } from "@/types";
import { CATEGORIES } from "@/lib/categories";

const expert1: Expert = {
  id: "e1",
  user_id: "u_expert_1",
  slug: "ai-automations-agency",
  name: "AI Automations Agency",
  bio: "We are a team of certified automation experts specializing in HubSpot, Make, and OpenAI implementations for B2B sales teams. Over 40+ implementations delivered.",
  response_time: "Usually replies within 2 hours",
  verified: true,
  business_verified: true,
  founding: true,
  founding_rank: 1,
  completed_sales_count: 42,
  tools: ["Make", "n8n", "OpenAI"],
};

const expert2: Expert = {
  id: "e2",
  user_id: "u_expert_2",
  slug: "workflow-wizards",
  name: "Workflow Wizards",
  bio: "Solo automation consultant focused on finance and ops automations. I help small businesses get their time back.",
  response_time: "Usually replies same day",
  verified: true,
  business_verified: false,
  founding: false,
  completed_sales_count: 5,
  tools: ["Zapier", "Python"],
};

export const experts: Expert[] = [expert1, expert2];

export const solutions: Solution[] = []; 

export const categories: Category[] = CATEGORIES.map((name, index) => ({
  id: (index + 1).toString(),
  name,
  slug: name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-").replace(/[^\w-]+/g, ""),
  description: `Automations for ${name}`
}));

export const orders: Order[] = [];
/*
export const orders: Order[] = [
  {
    id: "o1",
    buyer_id: "user_1",
    seller_id: expert1.id,
    solution_id: "1",
    price_cents: 250000,
    status: "paid_pending_implementation",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    solution: solutions[0],
    seller: expert1
  },
  // ...
];
*/

export const messages: Message[] = [];
/*
export const messages: Message[] = [
  { id: "m1", conversation_id: "c1", sender_id: "user_1", body: "Hi, I just placed an order. When can we start?", type: "user", created_at: new Date(Date.now() - 86400000 * 2 + 1000).toISOString() },
  // ...
];
*/

export const conversations: Conversation[] = [];
/*
export const conversations: Conversation[] = [
  {
    id: "c1",
    buyer_id: "user_1",
    seller_id: expert1.id,
    solution_id: "1",
    order_id: "o1",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: messages,
    solution: solutions[0],
    order: orders[0],
    seller: expert1
  }
];
*/
