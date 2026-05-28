import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { phone, apikey, prefs } = req.body

  if (!phone || !apikey || !prefs) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Upsert user preferences (update if phone already exists)
  const { data, error } = await supabase
    .from('property_agents')
    .upsert(
      {
        phone,
        callmebot_apikey: apikey,
        prefs,
        active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'phone' }
    )
    .select()

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ error: 'Failed to save preferences' })
  }

  return res.status(200).json({ success: true, data })
}
