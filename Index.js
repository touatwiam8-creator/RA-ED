export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const body = await request.json();

    return new Response(
      JSON.stringify({
        ok: true,
        received: body
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
