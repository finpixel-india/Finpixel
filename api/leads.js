import supabase from './db-client.js';

const clean = (value, length = 500) => typeof value === 'string' ? value.trim().slice(0, length) : '';
const escapeHtml = (value) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const lead = {
      name: clean(req.body?.name, 100),
      phone: clean(req.body?.phone, 30),
      email: clean(req.body?.email, 150).toLowerCase(),
      business_type: clean(req.body?.business_type, 100),
      website: clean(req.body?.website, 250),
      message: clean(req.body?.message, 1200),
      status: 'new',
    };
    if (lead.name.length < 2) return res.status(400).json({ error: 'Please share your name.' });
    if (!/^[+\d][\d\s-]{8,16}$/.test(lead.phone)) return res.status(400).json({ error: 'Please enter a valid WhatsApp number.' });
    if (!lead.business_type) return res.status(400).json({ error: 'Please select your business type.' });
    if (lead.email && !/^\S+@\S+\.\S+$/.test(lead.email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

    const { data, error } = await supabase
      .from('finpixel_leads')
      .insert(lead)
      .select('id, created_at')
      .single();
    if (error) throw error;
    const reference = `FP-${data.id}`;
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.FINPIXEL_FROM_EMAIL || 'Finpixel India <onboarding@resend.dev>',
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
    return res.status(201).json({ ok: true, reference, created_at: data.created_at, email_sent: emailSent });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: 'We could not save your request. Please WhatsApp us and we will respond right away.' });
  }
}
