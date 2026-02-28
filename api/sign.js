import supabase from "./_supabase.js";

function stripTags(str) {
  return str.replace(/<[^>]*>/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { first_name, last_name, message } = req.body || {};

  const firstName = stripTags((first_name || "").trim());
  const lastName = stripTags((last_name || "").trim());
  const msg = stripTags((message || "").trim());

  if (!firstName || !lastName) {
    return res
      .status(400)
      .json({ error: "First name and last name are required." });
  }

  if (firstName.length > 100 || lastName.length > 100) {
    return res
      .status(400)
      .json({ error: "Names must be 100 characters or fewer." });
  }

  if (msg.length > 500) {
    return res
      .status(400)
      .json({ error: "Message must be 500 characters or fewer." });
  }

  const { error } = await supabase.from("signatures").insert({
    first_name: firstName,
    last_name: lastName,
    message: msg || null,
    approved: false,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: "Failed to save signature." });
  }

  return res
    .status(201)
    .json({ message: "Thank you! Your signature will appear after review." });
}
