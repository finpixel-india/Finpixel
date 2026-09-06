import { createClient } from '@supabase/supabase-js';

export async function onRequestGet({ env }) {
  const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  try {
    const { data, error } = await supabase
      .from('finpixel_site_content')
      .select('id, section, sort_order, content')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Content API error:', err);
    return new Response(JSON.stringify({ error: 'The studio experience is temporarily unavailable. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
