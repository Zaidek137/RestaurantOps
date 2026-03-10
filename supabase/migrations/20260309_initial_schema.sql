create extension if not exists pgcrypto;

create table if not exists portfolio (
  id text primary key,
  name text not null,
  headquarters text not null,
  created_at timestamptz not null default now()
);

create table if not exists business (
  id text primary key,
  portfolio_id text not null references portfolio (id) on delete cascade,
  name text not null,
  concept text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists location (
  id text primary key,
  business_id text not null references business (id) on delete cascade,
  name text not null,
  city text not null,
  state text not null,
  opened_on date not null,
  seats integer not null,
  created_at timestamptz not null default now()
);

create table if not exists user_role_assignment (
  id text primary key,
  user_id uuid not null,
  role text not null check (role in ('owner', 'regional_manager', 'business_manager', 'location_manager', 'inventory', 'finance')),
  business_id text not null default 'all',
  location_id text not null default 'all',
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists expense_category (
  id text primary key,
  name text not null,
  type text not null check (type in ('cogs', 'operating', 'labor'))
);

create table if not exists vendor (
  id text primary key,
  name text not null,
  category text not null,
  business_id text not null default 'all'
);

create table if not exists invoice (
  id text primary key,
  vendor_id text not null references vendor (id),
  invoice_number text not null,
  issued_on date not null,
  amount numeric(12,2) not null,
  attachment_name text not null
);

create table if not exists expense_entry (
  id text primary key,
  business_id text not null references business (id),
  location_id text not null references location (id),
  category_id text not null references expense_category (id),
  vendor_id text not null references vendor (id),
  invoice_id text references invoice (id),
  title text not null,
  amount numeric(12,2) not null,
  occurred_on date not null,
  recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists ingredient (
  id text primary key,
  business_id text not null references business (id),
  name text not null,
  base_unit text not null,
  pack_unit text not null,
  units_per_pack numeric(12,2) not null,
  yield_percent numeric(5,4) not null,
  par_level numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists vendor_price_history (
  id text primary key,
  vendor_id text not null references vendor (id),
  ingredient_id text not null references ingredient (id),
  location_id text references location (id),
  price_per_pack numeric(12,2) not null,
  recorded_on date not null
);

create table if not exists inventory_count (
  id text primary key,
  business_id text not null references business (id),
  location_id text not null references location (id),
  ingredient_id text not null references ingredient (id),
  counted_units numeric(12,2) not null,
  variance_units numeric(12,2) not null,
  counted_on date not null
);

create table if not exists waste_entry (
  id text primary key,
  business_id text not null references business (id),
  location_id text not null references location (id),
  ingredient_id text not null references ingredient (id),
  quantity numeric(12,2) not null,
  reason text not null,
  cost numeric(12,2) not null,
  recorded_on date not null
);

create table if not exists labor_summary (
  id text primary key,
  business_id text not null references business (id),
  location_id text not null references location (id),
  date date not null,
  sales numeric(12,2) not null,
  labor_cost numeric(12,2) not null,
  labor_hours numeric(12,2) not null,
  covers integer not null
);

create table if not exists menu_category (
  id text primary key,
  business_id text not null references business (id),
  name text not null
);

create table if not exists menu_item (
  id text primary key,
  business_id text not null references business (id),
  category_id text not null references menu_category (id),
  name text not null,
  price numeric(12,2) not null,
  availability text not null check (availability in ('active', 'seasonal', 'paused')),
  popularity integer not null default 50
);

create table if not exists recipe (
  id text primary key,
  menu_item_id text not null references menu_item (id) on delete cascade,
  business_id text not null references business (id)
);

create table if not exists recipe_component (
  id text primary key,
  recipe_id text not null references recipe (id) on delete cascade,
  ingredient_id text not null references ingredient (id),
  quantity numeric(12,2) not null
);

create table if not exists sales_summary (
  id text primary key,
  business_id text not null references business (id),
  location_id text not null references location (id),
  date date not null,
  revenue numeric(12,2) not null,
  cogs numeric(12,2) not null,
  labor numeric(12,2) not null
);

create or replace function has_business_access(target_business_id text, target_location_id text default 'all')
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from user_role_assignment ura
    where ura.user_id = auth.uid()
      and (
        ura.role in ('owner', 'finance')
        or ura.business_id = 'all'
        or ura.business_id = target_business_id
      )
      and (
        target_location_id = 'all'
        or ura.location_id = 'all'
        or ura.location_id = target_location_id
      )
  );
$$;

alter table portfolio enable row level security;
alter table business enable row level security;
alter table location enable row level security;
alter table user_role_assignment enable row level security;
alter table expense_entry enable row level security;
alter table invoice enable row level security;
alter table ingredient enable row level security;
alter table vendor_price_history enable row level security;
alter table inventory_count enable row level security;
alter table waste_entry enable row level security;
alter table labor_summary enable row level security;
alter table menu_category enable row level security;
alter table menu_item enable row level security;
alter table recipe enable row level security;
alter table recipe_component enable row level security;
alter table sales_summary enable row level security;

create policy if not exists "portfolio read for authenticated" on portfolio
for select to authenticated using (true);

create policy if not exists "business read scoped" on business
for select to authenticated using (has_business_access(id));

create policy if not exists "location read scoped" on location
for select to authenticated using (has_business_access(business_id, id));

create policy if not exists "user role own rows" on user_role_assignment
for select to authenticated using (user_id = auth.uid());

create policy if not exists "expense scoped access" on expense_entry
for all to authenticated using (has_business_access(business_id, location_id))
with check (has_business_access(business_id, location_id));

create policy if not exists "invoice scoped access" on invoice
for select to authenticated using (
  exists (
    select 1 from expense_entry e
    where e.invoice_id = invoice.id
      and has_business_access(e.business_id, e.location_id)
  )
);

create policy if not exists "ingredient scoped access" on ingredient
for all to authenticated using (has_business_access(business_id))
with check (has_business_access(business_id));

create policy if not exists "vendor price scoped access" on vendor_price_history
for all to authenticated using (
  exists (
    select 1 from ingredient i
    where i.id = vendor_price_history.ingredient_id
      and has_business_access(i.business_id, coalesce(vendor_price_history.location_id, 'all'))
  )
)
with check (
  exists (
    select 1 from ingredient i
    where i.id = vendor_price_history.ingredient_id
      and has_business_access(i.business_id, coalesce(vendor_price_history.location_id, 'all'))
  )
);

create policy if not exists "inventory scoped access" on inventory_count
for all to authenticated using (has_business_access(business_id, location_id))
with check (has_business_access(business_id, location_id));

create policy if not exists "waste scoped access" on waste_entry
for all to authenticated using (has_business_access(business_id, location_id))
with check (has_business_access(business_id, location_id));

create policy if not exists "labor scoped access" on labor_summary
for all to authenticated using (has_business_access(business_id, location_id))
with check (has_business_access(business_id, location_id));

create policy if not exists "menu category scoped access" on menu_category
for all to authenticated using (has_business_access(business_id))
with check (has_business_access(business_id));

create policy if not exists "menu item scoped access" on menu_item
for all to authenticated using (has_business_access(business_id))
with check (has_business_access(business_id));

create policy if not exists "recipe scoped access" on recipe
for all to authenticated using (has_business_access(business_id))
with check (has_business_access(business_id));

create policy if not exists "recipe component scoped access" on recipe_component
for all to authenticated using (
  exists (
    select 1 from recipe r
    where r.id = recipe_component.recipe_id
      and has_business_access(r.business_id)
  )
)
with check (
  exists (
    select 1 from recipe r
    where r.id = recipe_component.recipe_id
      and has_business_access(r.business_id)
  )
);

create policy if not exists "sales scoped access" on sales_summary
for all to authenticated using (has_business_access(business_id, location_id))
with check (has_business_access(business_id, location_id));

create or replace view expense_summary as
select
  e.business_id,
  e.location_id,
  date_trunc('day', e.occurred_on)::date as summary_date,
  c.name as category_name,
  c.type as category_type,
  sum(e.amount) as total_amount
from expense_entry e
join expense_category c on c.id = e.category_id
group by 1, 2, 3, 4, 5;

create or replace view food_cost as
select
  s.business_id,
  s.location_id,
  s.date,
  s.revenue,
  s.cogs,
  case when s.revenue = 0 then 0 else round((s.cogs / s.revenue) * 100, 2) end as food_cost_percent
from sales_summary s;

create or replace view prime_cost as
select
  s.business_id,
  s.location_id,
  s.date,
  s.revenue,
  s.cogs + s.labor as prime_cost_value,
  case when s.revenue = 0 then 0 else round(((s.cogs + s.labor) / s.revenue) * 100, 2) end as prime_cost_percent
from sales_summary s;

create or replace view location_profitability as
select
  s.business_id,
  s.location_id,
  sum(s.revenue) as revenue,
  sum(s.cogs) as cogs,
  sum(s.labor) as labor,
  coalesce(sum(e.amount), 0) as expenses,
  sum(s.revenue) - sum(s.cogs) - sum(s.labor) - coalesce(sum(e.amount), 0) as operating_profit
from sales_summary s
left join expense_entry e on e.location_id = s.location_id and e.business_id = s.business_id
group by 1, 2;

create or replace view portfolio_rollup as
select
  b.portfolio_id,
  s.business_id,
  sum(s.revenue) as revenue,
  sum(s.cogs) as cogs,
  sum(s.labor) as labor,
  coalesce(sum(e.amount), 0) as expenses,
  sum(s.revenue) - sum(s.cogs) - sum(s.labor) - coalesce(sum(e.amount), 0) as operating_profit
from sales_summary s
join business b on b.id = s.business_id
left join expense_entry e on e.business_id = s.business_id
group by 1, 2;
