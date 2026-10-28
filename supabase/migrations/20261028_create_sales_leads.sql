-- 出口A（面談希望の申し込み）の保存先。Supabase の SQL エディタで実行する
create table public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  display_name text not null,
  phone text not null,
  contact_method text not null check (contact_method in ('phone', 'line')),
  contact_time text not null,
  current_job text not null,
  desired_job text not null,
  diagnosis_type text not null,
  free_answers jsonb not null,
  self_pr text not null,
  consent_text text not null,
  partners_at_consent text[] not null,
  ref_source text,
  provided_at timestamptz, -- BEPRIDE に渡した日時（kanata が記入）
  provided_to text          -- 渡した会社名（kanata が記入）
);
alter table public.sales_leads enable row level security; -- ポリシーは作らない（service_role のみ）
-- 新しい表には自動で権限が付かないため、アプリ（service_role）にだけ読み書きを許可する
grant select, insert, update on public.sales_leads to service_role;
