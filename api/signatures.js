import supabase from "./_supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);

  const { data, error, count } = await supabase
    .from("signatures")
    .select("first_name, last_name, message, created_at", { count: "exact" })
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to fetch signatures" });
  }

  return res.status(200).json({ signatures: data, total: count });
}
