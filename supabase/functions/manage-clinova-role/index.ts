import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const allowedRoles = new Set([
  "instructor",
  "faculty",
  "content_author",
  "clinical_reviewer",
  "editorial_reviewer",
  "content_publisher",
  "content_admin",
]);
const allowedOrigins = new Set([
  "https://clinovainternationalacademy.co.uk",
  "https://www.clinovainternationalacademy.co.uk",
  "http://localhost:5173",
]);

function corsHeaders(origin: string | null) {
  const permitted = origin && (allowedOrigins.has(origin) || /^https:\/\/clinova-international-academy-[a-z0-9-]+\.vercel\.app$/.test(origin));
  return {
    "Access-Control-Allow-Origin": permitted ? origin! : "https://clinovainternationalacademy.co.uk",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);
  if (origin && headers["Access-Control-Allow-Origin"] !== origin) return json({ error: "Origin not allowed" }, 403, headers);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401, headers);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "Role management is not configured" }, 503, headers);

  const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  const caller = callerData.user;
  if (callerError || !caller) return json({ error: "Invalid or expired session" }, 401, headers);

  const callerRoles = Array.isArray(caller.app_metadata?.clinova_roles) ? caller.app_metadata.clinova_roles : [];
  const isAdmin = caller.app_metadata?.role === "admin" || callerRoles.includes("content_admin");
  if (!isAdmin) return json({ error: "Administrator role required" }, 403, headers);

  let body: { user_id?: string; role?: string; enabled?: boolean };
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400, headers); }
  const userId = body.user_id?.trim();
  const role = body.role?.trim();
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return json({ error: "A valid target user UUID is required" }, 400, headers);
  }
  if (!role || !allowedRoles.has(role) || typeof body.enabled !== "boolean") {
    return json({ error: "A supported role and boolean enabled value are required" }, 400, headers);
  }
  if (caller.id === userId && role === "content_admin" && body.enabled === false) {
    return json({ error: "You cannot remove your own content administrator access" }, 400, headers);
  }

  const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(userId);
  const target = targetData.user;
  if (targetError || !target) return json({ error: "Target account was not found" }, 404, headers);

  const existing = Array.isArray(target.app_metadata?.clinova_roles)
    ? target.app_metadata.clinova_roles.filter((value: unknown): value is string => typeof value === "string" && allowedRoles.has(value))
    : [];
  const next = new Set(existing);
  if (body.enabled) next.add(role); else next.delete(role);
  const nextRoles = [...next].sort();

  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { ...target.app_metadata, clinova_roles: nextRoles },
  });
  if (updateError) return json({ error: "The role update was rejected" }, 400, headers);

  const { error: auditError } = await adminClient.from("admin_role_audit_events").insert({
    target_user_id: userId,
    actor_user_id: caller.id,
    role_name: role,
    action: body.enabled ? "granted" : "revoked",
  });
  return json({
    success: true,
    user_id: userId,
    roles: nextRoles,
    audit_recorded: !auditError,
  }, 200, headers);
});
