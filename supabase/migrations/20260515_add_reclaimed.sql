alter table materials add column if not exists reclaimed boolean default false;

-- Flag any existing materials whose name indicates reclaimed or salvaged origin
update materials
set reclaimed = true
where
  name ilike '%reclaim%'
  or name ilike '%salvag%'
  or name ilike '%reuse%'
  or name ilike '%reused%'
  or name ilike '%repurpose%';
