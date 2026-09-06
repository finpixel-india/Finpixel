import { createClient } from '@supabase/supabase-js';

const clean = (value, length = 500) => typeof value === 'string' ? value.trim().slice(0, length) : '';
const escapeHtml = (value) => value.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await request.json();
    const lead = {
      name: clean(body?.name, 100),
      phone: clean(body?.phone, 30),
      email: clean(body?.email, 150).toLowerCase(),
      business_type: clean(body?.business_type, 100),
      website: clean(body?.website, 250),
      message: clean(body?.message, 1200),
      status: 'new',
    };

    if (lead.name.length < 2)
      return new Response(JSON.stringify({ error: 'Please share your name.' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    if (!/^[+\d][\d\s-]{8,16}$/.test(lead.phone))
      return new Response(JSON.stringify({ error: 'Please enter a valid WhatsApp number.' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    if (!lead.business_type)
      return new Response(JSON.stringify({ error: 'Please select your business type.' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    if (lead.email && !/^\S+@\S+\.\S+$/.test(lead.email))
      return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const { data, error } = await supabase.from('finpixel_leads').insert(lead).select('id, created_at').single();
    if (error) throw error;

    const reference = `FP-${data.id}`;
    let emailSent = false;

    if (env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: env.FINPIXEL_FROM_EMAIL || 'Finpixel India <onboarding@resend.dev>',
            to: ['finpixelindia@gmail.com'],
            reply_to: lead.email || undefined,
            subject: `New free demo enquiry — ${lead.business_type} (${reference})`,
            text: `New Finpixel India enquiry\n\nReference: ${reference}\nName: ${lead.name}\nWhatsApp: ${lead.phone}\nEmail: ${lead.email || 'Not provided'}\nBusiness / Project Type: ${lead.business_type}\nGoal: ${lead.message || 'Not provided'}\nSubmitted: ${data.created_at}`,
            html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17212b"><div style="padding:24px;border-radius:18px 18px 0 0;background:#dff3ff"><strong style="font-size:22px">New free demo enquiry</strong><p style="margin:7px 0 0;color:#456273">Reference ${escapeHtml(reference)}</p></div><div style="padding:24px;border:1px solid #d9e8ef;border-top:0;border-radius:0 0 18px 18px"><p><strong>Name:</strong> ${escapeHtml(lead.name)}</p><p><strong>WhatsApp:</strong> ${escapeHtml(lead.phone)}</p><p><strong>Email:</strong> ${escapeHtml(lead.email || 'Not provided')}</p><p><strong>Business / Project Type:</strong> ${escapeHtml(lead.business_type)}</p><p><strong>Website goal:</strong></p><div style="padding:14px;border-radius:10px;background:#f4f9fc;line-height:1.6">${escapeHtml(lead.message || 'Not provided')}</div><p style="margin-top:22px;color:#73808a;font-size:12px">Submitted through the Finpixel India website on ${escapeHtml(data.created_at)}</p></div></div>`,
          }),
        });
        emailSent = emailResponse.ok;
        if (!emailResponse.ok) console.error('Lead email error:', await emailResponse.text());
        if (emailSent) await supabase.from('finpixel_leads').update({ status: 'notified' }).eq('id', data.id);
      } catch (emailError) {
        console.error('Lead email error:', emailError);
      }
    }

    return new Response(JSON.stringify({ ok: true, reference, created_at: data.created_at, email_sent: emailSent }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('Lead API error:', err);
    return new Response(JSON.stringify({ error: 'We could not save your request. Please WhatsApp us and we will respond right away.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
