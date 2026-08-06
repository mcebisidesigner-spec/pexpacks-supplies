-- ===================================================
-- 00011 PACK & ITEM ICONS
-- Add item icon, backfill icons + pack sort order
-- ===================================================

alter table public.stationery_items add column if not exists icon text;

-- ---------------------------------------------------
-- 1. BACKFILL ITEM ICONS from item name
-- ---------------------------------------------------

update public.stationery_items
set icon = case
  when lower(name) ~ '(book|scrapbook)'          then 'notebook'
  when lower(name) ~ '(pad|paper)'                then 'pad'
  when lower(name) ~ '(file|sleeve|folder)'       then 'file'
  when lower(name) ~ '(pen|marker)'               then 'pen'
  when lower(name) ~ '(pencil|crayon|colour|color)' then 'pencil'
  when lower(name) ~ 'glue'                       then 'glue'
  when lower(name) ~ 'scissor'                    then 'scissors'
  when lower(name) ~ 'ruler'                      then 'ruler'
  when lower(name) ~ 'eraser'                     then 'eraser'
  when lower(name) ~ 'sharpener'                  then 'sharpener'
  when lower(name) ~ 'highlighter'                then 'highlighter'
  when lower(name) ~ 'calculator'                 then 'calculator'
  else 'box'
end
where icon is null or icon = '';

-- ---------------------------------------------------
-- 2. BACKFILL PACK SORT ORDER from grade slug
--    (grade-r -> 0, grade-1 -> 1, … grade-12 -> 12)
-- ---------------------------------------------------

with grade_orders(grade_slug, sort_order) as (
  values
    ('grade-r', 0), ('grade-1', 1), ('grade-2', 2), ('grade-3', 3),
    ('grade-4', 4), ('grade-5', 5), ('grade-6', 6), ('grade-7', 7),
    ('grade-8', 8), ('grade-9', 9), ('grade-10', 10), ('grade-11', 11),
    ('grade-12', 12)
)
update public.stationery_packs p
set sort_order = g.sort_order
from grade_orders g
where p.sort_order = 0
  and p.slug ~* 'grade-(r|[0-9]{1,2})$'
  and lower(substring(p.slug from 'grade-(r|[0-9]{1,2})$')) = g.grade_slug;
