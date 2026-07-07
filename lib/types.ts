export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  cost_cents: number;
  margin_cents: number;
  supplier: string;
  supplier_sku: string | null;
  trending_score: number;
  is_active: boolean;
  stock: number;
};

export type CartLine = {
  product_id: string;
  quantity: number;
  // denormalized snapshot so the cart UI works offline / pre-auth
  name: string;
  price_cents: number;
  image_url: string | null;
};

export type Order = {
  id: string;
  user_id: string | null;
  customer_email: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
  total_cents: number;
  tracking_number: string | null;
  tracking_email_sent: boolean;
  created_at: string;
};
