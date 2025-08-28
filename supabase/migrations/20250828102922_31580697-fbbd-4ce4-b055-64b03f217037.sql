-- Grant admin role to the current user (from auth logs: 23ff79fe-27bc-4cd8-848d-d0928ffbc1a1)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('23ff79fe-27bc-4cd8-848d-d0928ffbc1a1'::uuid, 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;