insert into portfolio (id, name, headquarters)
values ('portfolio-ginger-coco', 'Ginger Coco Hospitality', 'Dallas, TX')
on conflict (id) do nothing;

insert into business (id, portfolio_id, name, concept, color)
values
  ('biz-ginger', 'portfolio-ginger-coco', 'Ginger Cafe', 'All-day cafe', '#f6a76f'),
  ('biz-coco', 'portfolio-ginger-coco', 'Coco Cabana', 'Tropical grill', '#70e1c2')
on conflict (id) do nothing;

insert into location (id, business_id, name, city, state, opened_on, seats)
values
  ('loc-ginger-uptown', 'biz-ginger', 'Uptown Cafe', 'Dallas', 'TX', '2023-04-15', 68),
  ('loc-ginger-riverside', 'biz-ginger', 'Riverside Cafe', 'Austin', 'TX', '2024-08-09', 54),
  ('loc-coco-bayside', 'biz-coco', 'Bayside Cabana', 'Miami', 'FL', '2022-11-03', 122),
  ('loc-coco-midtown', 'biz-coco', 'Midtown Cabana', 'Houston', 'TX', '2025-01-18', 96)
on conflict (id) do nothing;

insert into expense_category (id, name, type)
values
  ('exp-coffee', 'Coffee + Tea', 'cogs'),
  ('exp-produce', 'Produce', 'cogs'),
  ('exp-protein', 'Proteins', 'cogs'),
  ('exp-beverage', 'Beverage', 'cogs'),
  ('exp-utilities', 'Utilities', 'operating'),
  ('exp-rent', 'Rent', 'operating'),
  ('exp-marketing', 'Marketing', 'operating'),
  ('exp-cleaning', 'Cleaning', 'operating')
on conflict (id) do nothing;

insert into vendor (id, name, category, business_id)
values
  ('vendor-roast', 'Golden Roast Roasters', 'Coffee', 'all'),
  ('vendor-garden', 'Garden Fresh Produce', 'Produce', 'all'),
  ('vendor-tide', 'Tide & Tropic Seafood', 'Protein', 'all'),
  ('vendor-dairy', 'Blue Cart Dairy', 'Dairy', 'all'),
  ('vendor-grid', 'Sunline Utilities', 'Utilities', 'all'),
  ('vendor-palm', 'Palm House Creative', 'Marketing', 'all')
on conflict (id) do nothing;
