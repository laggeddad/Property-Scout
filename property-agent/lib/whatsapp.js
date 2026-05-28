/**
 * Sends a WhatsApp message via CallMeBot free API.
 * User must first activate their number by messaging the CallMeBot bot.
 * Instructions: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export async function sendWhatsApp(phone, apikey, message) {
  const encoded = encodeURIComponent(message)
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apikey}`

  const res = await fetch(url)
  const text = await res.text()

  if (!res.ok || text.includes('Error')) {
    throw new Error(`CallMeBot error: ${text}`)
  }

  return text
}
