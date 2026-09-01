-- Fix: "new row violates row-level security policy" when uploading an
-- image/video/audio from the admin panel's Media tab.
--
-- Same class of issue as fix-quiz-exam-rls-policies.sql, but one layer
-- lower: file uploads go straight from the browser to Supabase Storage
-- (bucket buckets slide-images / slide-videos / slide-audios), which has
-- its own Row-Level Security on the storage.objects table, completely
-- separate from the tables RLS covers. The admin check in
-- SlideMediaAdmin.tsx's uploadFile() never reaches the database — this is
-- Storage rejecting the write before it gets that far.
--
-- Run once in the Supabase SQL editor.

-- ── slide-images ────────────────────────────────────────────────────────
drop policy if exists "Admins can upload slide images" on storage.objects;
create policy "Admins can upload slide images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'slide-images'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can update slide images" on storage.objects;
create policy "Admins can update slide images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'slide-images'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can delete slide images" on storage.objects;
create policy "Admins can delete slide images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'slide-images'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Anyone can view slide images" on storage.objects;
create policy "Anyone can view slide images"
on storage.objects for select
to public
using (bucket_id = 'slide-images');

-- ── slide-videos ────────────────────────────────────────────────────────
drop policy if exists "Admins can upload slide videos" on storage.objects;
create policy "Admins can upload slide videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'slide-videos'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can update slide videos" on storage.objects;
create policy "Admins can update slide videos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'slide-videos'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can delete slide videos" on storage.objects;
create policy "Admins can delete slide videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'slide-videos'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Anyone can view slide videos" on storage.objects;
create policy "Anyone can view slide videos"
on storage.objects for select
to public
using (bucket_id = 'slide-videos');

-- ── slide-audios ────────────────────────────────────────────────────────
drop policy if exists "Admins can upload slide audios" on storage.objects;
create policy "Admins can upload slide audios"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'slide-audios'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can update slide audios" on storage.objects;
create policy "Admins can update slide audios"
on storage.objects for update
to authenticated
using (
  bucket_id = 'slide-audios'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Admins can delete slide audios" on storage.objects;
create policy "Admins can delete slide audios"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'slide-audios'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.user_role = 'admin')
);

drop policy if exists "Anyone can view slide audios" on storage.objects;
create policy "Anyone can view slide audios"
on storage.objects for select
to public
using (bucket_id = 'slide-audios');

-- ── Make sure the buckets actually exist and are public ────────────────
-- (upload/update above are no-ops if a bucket is missing; getPublicUrl()
-- only serves files without a signed URL when the bucket is public)
insert into storage.buckets (id, name, public)
values
  ('slide-images', 'slide-images', true),
  ('slide-videos', 'slide-videos', true),
  ('slide-audios', 'slide-audios', true)
on conflict (id) do update set public = true;

-- ── Verify ───────────────────────────────────────────────────────────────
select id, name, public from storage.buckets
where id in ('slide-images', 'slide-videos', 'slide-audios');

select policyname, cmd
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname ilike '%slide %'
order by policyname;
