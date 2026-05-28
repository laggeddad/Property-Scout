import { supabase } from '../../lib/supabase'
import { runPropertyAgent } from '../../lib/agent'
import { sendWhatsApp } from '../../lib/whatsapp'

// This endpoint is called daily by cron-job.org
// Protect it with a secret token so only cron-job.org can trigger it
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  // Validate cron secret
  const secret = req.headers['x-cron-secret'] || req.query.secret
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('🏠 Daily property agent cron started:', new Date().toISOString())

  // Fetch all active users from Supabase
  const { data: users, error } = await supabase
    .from('property_agents')
    .select('*')
    .eq('active', true)

  if (error) {
    console.error('Failed to fetch users:', error)
    return res.status(500).json({ error: 'DB error' })
  }

  console.log(`Running agent for ${users.length} users...`)

  const results = []

  for (const user of users) {
    try {
      console.log(`Processing user: ${user.phone}`)
      const report = await runPropertyAgent(user.prefs)

      if (report === 'NO_MATCHES_TODAY') {
        console.log(`No matches for ${user.phone} today`)
        results.push({ phone: user.phone, status: 'no_matches' })

        // Log to DB
        await supabase.from('agent_logs').insert({
          user_phone: user.phone,
          status: 'no_matches',
          message: null,
          ran_at: new Date().toISOString(),
        })
        continue
      }

      // Build the final WhatsApp message
      const message =
        `🏠 *Property Scout — Daily Report*\n` +
        `📅 ${new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n` +
        report +
        `\n\n🔁 Next scan: Tomorrow 9 AM\n` +
        `💬 Reply STOP to pause alerts`

      // Send WhatsApp via CallMeBot
      await sendWhatsApp(user.phone, user.callmebot_apikey, message)
      console.log(`✅ WhatsApp sent to ${user.phone}`)

      // Log to DB
      await supabase.from('agent_logs').insert({
        user_phone: user.phone,
        status: 'sent',
        message,
        ran_at: new Date().toISOString(),
      })

      results.push({ phone: user.phone, status: 'sent' })

      // Throttle between users to avoid rate limits
      await new Promise((r) => setTimeout(r, 2000))
    } catch (err) {
      console.error(`Error for ${user.phone}:`, err.message)
      results.push({ phone: user.phone, status: 'error', error: err.message })

      await supabase.from('agent_logs').insert({
        user_phone: user.phone,
        status: 'error',
        message: err.message,
        ran_at: new Date().toISOString(),
      })
    }
  }

  console.log('✅ Cron completed:', results)
  return res.status(200).json({ success: true, results })
}
