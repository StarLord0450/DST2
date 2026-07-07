-- ============================================================
-- Seed data — 10 starter products.
-- EDIT THESE with your real supplier SKUs, costs, and prices before going live.
-- price_cents / cost_cents are in cents (e.g. $19.99 = 1999)
-- Run after schema.sql, in Supabase SQL Editor.
-- ============================================================

insert into public.products (name, slug, description, image_url, price_cents, cost_cents, supplier, supplier_sku, trending_score, stock)
values
  ('LED Galaxy Star Projector', 'led-galaxy-projector', 'Bluetooth-enabled starfield projector with remote and app control.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', 3499, 1150, 'CJDropshipping', 'CJ-GAL-001', 98, 500),
  ('Magnetic Wireless Car Mount', 'magnetic-car-mount', '15W fast-charge magnetic phone mount for dash or vent.', 'https://images.unsplash.com/photo-1615526675250-2e0f3d871a75?w=800', 2299, 690, 'CJDropshipping', 'CJ-MAG-014', 91, 500),
  ('Portable Neck Fan', 'portable-neck-fan', 'Bladeless rechargeable neck fan, 3-speed, USB-C.', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800', 1899, 520, 'Zendrop', 'ZD-FAN-227', 87, 500),
  ('Mini Skincare Fridge', 'mini-skincare-fridge', '4L thermoelectric mini fridge for cosmetics and skincare.', 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800', 4999, 1899, 'Spocket', 'SP-FRIDGE-09', 95, 300),
  ('Posture Corrector Brace', 'posture-corrector', 'Adjustable back brace for posture support, unisex.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', 1599, 410, 'CJDropshipping', 'CJ-POST-330', 76, 500),
  ('Retractable Dog Leash Pro', 'retractable-dog-leash', '5m retractable leash with LED light and waste bag dispenser.', 'https://images.unsplash.com/photo-1601758228041-3caa4b46d43a?w=800', 2699, 780, 'CJDropshipping', 'CJ-LEASH-55', 82, 500),
  ('Silicone Kitchen Gadget Set', 'silicone-kitchen-set', '12-piece heat-resistant silicone cooking utensil set.', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800', 3299, 1120, 'Spocket', 'SP-KIT-118', 70, 400),
  ('Wireless Earbuds Sport', 'wireless-earbuds-sport', 'IPX7 waterproof sport earbuds with charging case.', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 3999, 1450, 'Zendrop', 'ZD-BUDS-402', 93, 400),
  ('Adjustable Laptop Stand', 'adjustable-laptop-stand', 'Aluminum ergonomic laptop stand, foldable, 6-level height.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 2999, 990, 'CJDropshipping', 'CJ-STAND-77', 79, 500),
  ('Smart Water Bottle Tracker', 'smart-water-bottle', 'Hydration-tracking bottle with glow reminder, 500ml, BPA-free.', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800', 2199, 640, 'CJDropshipping', 'CJ-BOTTLE-19', 84, 500)
on conflict (slug) do nothing;
