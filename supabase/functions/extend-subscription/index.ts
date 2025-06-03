import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient as actualSupabaseCreateClient } from "jsr:@supabase/supabase-js@^2.43.4";
import type { Database } from "../../../lib/database.types.ts";

console.log("🔁 extend-subscription function loaded");

Deno.serve(async (req: Request) => {
  const supabaseClient = createClient(req);

  const { office_id, duration_in_days, triggered_by } = await req.json();

  if (!office_id || !duration_in_days) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch office subscription info
  const { data: office, error: fetchError } = await supabaseClient
    .from("offices")
    .select("subscription_start, subscription_end, subscription_status, subscription_expires_at, auto_renew")
    .eq("id", office_id)
    .single();

  if (fetchError) {
    return new Response(
      JSON.stringify({ error: "Office not found", details: fetchError.message }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Calculate new subscription_end
  const currentDate = new Date();
  const currentEnd = office.subscription_end
    ? new Date(office.subscription_end)
    : currentDate;
  const newEnd = new Date(Math.max(currentEnd.getTime(), currentDate.getTime()));
  newEnd.setDate(newEnd.getDate() + duration_in_days);

  const updates: Record<string, any> = {
    subscription_end: newEnd.toISOString(),
    subscription_status: "active",
    subscription_expires_at: null,
  };

  if (!office.subscription_start) {
    updates.subscription_start = currentDate.toISOString();
  }

  // Update office
  const { error: updateError } = await supabaseClient
    .from("offices")
    .update(updates)
    .eq("id", office_id);

  if (updateError) {
    return new Response(
      JSON.stringify({ error: "Failed to update subscription", details: updateError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      message: `Subscription extended by ${duration_in_days} days`,
      updated_until: newEnd.toISOString(),
      triggered_by,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});

function createClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  return actualSupabaseCreateClient<Database>(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });
}
