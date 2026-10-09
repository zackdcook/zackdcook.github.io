import "server-only";
import { assertExperimentalEnvironment } from "./experimental-environment";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function authConfigured() {
  assertExperimentalEnvironment(process.env);
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export async function serverSupabase() {
  if (!authConfigured())
    throw new Error("Account connections are not configured yet.");
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Proxy refreshes sessions for Server Components. */
          }
        },
      },
    },
  );
}

export function serviceSupabase() {
  assertExperimentalEnvironment(process.env);
  if (
    !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  )
    throw new Error("Server storage is not configured yet.");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function currentUser() {
  if (!authConfigured()) return null;
  const client = await serverSupabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

export function isOwner(
  user: { email?: string; email_confirmed_at?: string } | null,
) {
  const email = process.env.ZACK_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(
    email && user?.email_confirmed_at && user.email?.toLowerCase() === email,
  );
}

export async function requireOwner() {
  const user = await currentUser();
  if (!user || !isOwner(user)) throw new Error("Owner sign-in required.");
  return user;
}

export async function registerOwner(userId: string) {
  const { error } = await serviceSupabase()
    .from("site_admins")
    .upsert({ id: "owner", user_id: userId });
  if (error)
    throw new Error("The private editor database needs its setup step.");
}

export function siteOrigin() {
  return new URL(process.env.SITE_URL || "http://127.0.0.1:3000").origin;
}

export function checkOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new Error("Please submit from this website.");
}
