export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    console.log("Request body keys:", body ? Object.keys(body) : "undefined/null");
    console.log("API key present:", !!process.env.ANTHROPIC_API_KEY);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Anthropic status:", response.status);
    if (!response.ok) {
      console.log("Anthropic error:", JSON.stringify(data));
    }
    return res.status(response.status).json(data);
  } catch (err) {
    console.log("Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
