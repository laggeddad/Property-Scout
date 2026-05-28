/**
 * Runs the property scouting agent using Claude with web_search tool.
 * Searches Zameen.com and other Pakistani property sites for matching listings.
 */
export async function runPropertyAgent(prefs) {
  const {
    cities = [],
    types = [],
    purpose = 'Buy',
    budget = 'Flexible',
    size = 'Any Size',
    bedrooms = 'Any',
    features = [],
  } = prefs

  const systemPrompt = `You are a Pakistani real estate property scout agent. 
Your job is to search for real property listings on Zameen.com and other Pakistani property portals 
(Graana.com, OLX Pakistan real estate, etc.) that match the user's criteria.

When searching:
1. Use web search to find REAL current listings
2. Extract actual property details: title, location, price, size, bedrooms, features, listing URL
3. Only include listings that genuinely match ALL the user's criteria
4. Format your final response as a WhatsApp message (plain text, use emojis, no markdown)
5. Include the listing URL for each property so the user can click through
6. If no listings match, say exactly: "NO_MATCHES_TODAY"

Be concise — WhatsApp messages should be readable on a phone screen.`

  const userPrompt = `Search for properties matching these criteria:
- Cities: ${cities.join(', ')}
- Property Type: ${types.join(', ')}
- Purpose: ${purpose}
- Budget: ${budget}
- Size: ${size}
- Bedrooms: ${bedrooms === 'Any' ? 'Any' : `${bedrooms}+`}
- Required Features: ${features.length > 0 ? features.join(', ') : 'None'}

Search Zameen.com and other Pakistani real estate sites for REAL current listings.
Return max 3 best matches as a WhatsApp-formatted message, or "NO_MATCHES_TODAY" if nothing fits.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'tools-2024-04-04',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()

  // Extract text from the response (may include tool_use blocks)
  const text = data.content
    ?.filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  return text || 'NO_MATCHES_TODAY'
}
