-- Add score_confidence column
alter table public.materials
  add column if not exists score_confidence text default 'placeholder';

-- Verified: has a real source_url
update public.materials
set score_confidence = 'verified'
where source_url is not null and source_url != '';

-- Estimated: no source_url but has meaningful (non-default 85/85) scores
update public.materials m
set score_confidence = 'estimated'
where m.score_confidence = 'placeholder'
  and exists (
    select 1 from public.lis_ris_scores lrs
    where lrs.material_id = m.id
      and (lrs.ris_score != 85 or lrs.lis_score != 85)
  );

-- Placeholder: explicitly mark 85/85 default scores with no source_url
update public.materials m
set score_confidence = 'placeholder'
where (m.source_url is null or m.source_url = '')
  and exists (
    select 1 from public.lis_ris_scores lrs
    where lrs.material_id = m.id
      and lrs.ris_score = 85
      and lrs.lis_score = 85
  );
