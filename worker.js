/**
 * Cloudflare Worker — Agente de Pedidos
 * Cole este código no editor do Cloudflare Workers.
 * 
 * Em Settings > Variables, adicione:
 *   ANTHROPIC_API_KEY = sk-ant-xxxxxx  (marque Encrypt)
 */

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(), status: 204 });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await request.json();

      if (!body.messages || !Array.isArray(body.messages)) {
        return json({ error: "Payload inválido" }, 400);
      }

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: body.system || "",
          messages: body.messages
        })
      });

      const data = await resp.json();
      return json(data, resp.status);

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
