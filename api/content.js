import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const { data, error } = await supabase
      .from('finpixel_site_content')
      .select('id, section, sort_order, content')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Content API error:', err);
    return res.status(500).json({ error: 'The studio experience is temporarily unavailable. Please try again.' });
  }
}
