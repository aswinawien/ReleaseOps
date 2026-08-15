-- Synthetic Harbor & Pine Studio workspace.
-- Demo passwords are documented in README.md. They are not production secrets.

create extension if not exists pgcrypto;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'mira.owner@harborpine.test',
    crypt('HarborPine!demo1', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mira Chen"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'jonas.agent@harborpine.test',
    crypt('HarborPine!demo1', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jonas Reed"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'priya.client@harborpine.test',
    crypt('HarborPine!demo1', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Priya Nair"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-8444-444444444444',
    'authenticated',
    'authenticated',
    'owen.viewer@harborpine.test',
    crypt('HarborPine!demo1', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Owen Blake"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  id::text,
  now(),
  now(),
  now()
from auth.users
where email like '%@harborpine.test';

insert into public.organizations (id, name, slug)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Harbor & Pine Studio',
  'harbor-pine-studio'
);

insert into public.memberships (organization_id, user_id, role)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'owner'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'agent'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', 'client'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '44444444-4444-4444-8444-444444444444', 'viewer');

insert into public.projects (id, organization_id, name, description)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Northwind Portal',
    'Client-facing request portal and content updates for the Northwind demo brand.'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Studio Operations',
    'Internal keep-the-lights-on work for Harbor & Pine Studio.'
  );

insert into public.tickets (
  id, organization_id, project_id, title, description, status, priority, created_by, assigned_to
)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Staging deploy is blocked on the preview env',
    'The Northwind preview environment fails health checks after the last content migration. Clients cannot review the homepage draft.',
    'in_progress',
    'high',
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'Add an approvals note to the launch checklist',
    'Before go-live, Priya needs a place to approve copy changes and request revisions without email threads.',
    'waiting_on_client',
    'medium',
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'Rotate the demo mailbox forwarding rule',
    'The studio shared mailbox still forwards to a retired address. Please point it at the current on-call alias.',
    'open',
    'low',
    '11111111-1111-4111-8111-111111111111',
    null
  );

insert into public.ticket_comments (
  organization_id, ticket_id, author_id, body
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '33333333-3333-4333-8333-333333333333',
    'I can still reproduce this on preview.northwind.test. The hero image 404s and the health endpoint returns 502.'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '22222222-2222-4222-8222-222222222222',
    'Thanks Priya. I am checking the object storage origin and will post when the preview is green again.'
  );

insert into public.approvals (
  organization_id, ticket_id, requested_by, status, notes
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
  '22222222-2222-4222-8222-222222222222',
  'pending',
  'Please confirm the launch checklist copy before Friday.'
);
