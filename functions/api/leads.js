const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const clean = (v, l = 500) => typeof v === "string" ? v.trim().slice(0, l) : "";
    const lead = {
      name: clean(body?.name, 100),
      phone: clean(body?.phone, 30),
      email: clean(body?.email, 150).toLowerCase(),
      business_type: clean(body?.business_type, 100),
      message: clean(body?.message, 1200),
    };

    if (lead.name.length < 2)
      return new Response(JSON.stringify({ error: "Please share your name." }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    if (!/^[+\d][\d\s-]{8,16}$/.test(lead.phone))
      return new Response(JSON.stringify({ error: "Please enter a valid WhatsApp number." }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    if (!lead.business_type)
      return new Response(JSON.stringify({ error: "Please select your business type." }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    // Send email via Resend if configured
    let emailSent = false;
    if (env && env.RESEND_API_KEY) {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Finpixel India <onboarding@resend.dev>",
            to: ["finpixelindia@gmail.com"],
            subject: `New demo enquiry — ${lead.business_type}`,
            text: `Name: ${lead.name}\nWhatsApp: ${lead.phone}\nEmail: ${lead.email || "Not provided"}\nType: ${lead.business_type}\nGoal: ${lead.message || "Not provided"}`,
          }),
        });
        emailSent = resp.ok;
      } catch {}
    }

    const reference = `FP-${Date.now().toString(36).toUpperCase()}`;
    return new Response(JSON.stringify({ ok: true, reference, email_sent: emailSent, created_at: new Date().toISOString() }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "We could not save your request. Please WhatsApp us directly." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}
