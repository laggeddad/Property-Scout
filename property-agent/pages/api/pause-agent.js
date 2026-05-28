import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Missing phone' })

  const { error } = await supabase
    .from('property_agents')
    .update({ active: false })
    .eq('phone', phone)

  if (error) return res.status(500).json({ error: 'Failed to pause agent' })

  return res.status(200).json({ success: true, message: 'Agent paused' })
}
