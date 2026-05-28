import { useState } from 'react'
import Head from 'next/head'

const STEPS = [
  { id: 'city', label: 'Location', icon: '📍' },
  { id: 'type', label: 'Property Type', icon: '🏠' },
  { id: 'purpose', label: 'Purpose', icon: '🎯' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'size', label: 'Size', icon: '📐' },
  { id: 'bedrooms', label: 'Bedrooms', icon: '🛏️' },
  { id: 'features', label: 'Features', icon: '✨' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
]

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Faisalabad', 'Multan', 'Other']
const PROPERTY_TYPES = ['House', 'Apartment / Flat', 'Plot / Land', 'Commercial', 'Farmhouse', 'Penthouse']
const PURPOSES = ['Buy', 'Rent', 'Investment']
const BEDROOM_OPTIONS = ['1', '2', '3', '4', '5+', 'Any']
const FEATURES = [
  'Gated Community', 'Parking', 'Generator Backup', 'Solar Panels',
  'Swimming Pool', 'Gym', 'CCTV / Security', 'Gas Connection',
  'Near School', 'Near Hospital', 'Corner Plot', 'Basement',
]
const BUDGET_RANGES = {
  Buy: ['Under 50 Lac', '50 Lac – 1 Crore', '1 – 2 Crore', '2 – 5 Crore', '5 – 10 Crore', '10 Crore+', 'Flexible'],
  Rent: ['Under 20k/mo', '20k – 50k/mo', '50k – 1 Lac/mo', '1 – 2 Lac/mo', '2 Lac+/mo', 'Flexible'],
  Investment: ['Under 50 Lac', '50 Lac – 1 Crore', '1 – 3 Crore', '3 – 5 Crore', '5 Crore+', 'Flexible'],
}
const SIZE_OPTIONS = ['Under 3 Marla', '3–5 Marla', '5–10 Marla', '10–20 Marla', '1 Kanal+', 'Any Size']

function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 18px', borderRadius: 99,
      border: selected ? '1.5px solid #00C896' : '1.5px solid rgba(255,255,255,0.15)',
      background: selected ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.04)',
      color: selected ? '#00C896' : 'rgba(255,255,255,0.7)',
      cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
      fontWeight: selected ? 600 : 400, transition: 'all 0.2s',
    }}>
      {label}
    </button>
  )
}

export default function Home() {
  const [step, setStep] = useState(0)
  const [prefs, setPrefs] = useState({})
  const [apikey, setApikey] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | done | error
  const [errorMsg, setErrorMsg] = useState('')

  const totalSteps = STEPS.length
  const isLast = step === totalSteps - 1

  const canProceed = () => {
    if (step === 0) return (prefs.cities || []).length > 0
    if (step === 1) return (prefs.types || []).length > 0
    if (step === 2) return !!prefs.purpose
    if (step === 3) return !!prefs.budget
    if (step === 4) return !!prefs.size
    if (step === 5) return !!prefs.bedrooms
    if (step === 6) return true
    if (step === 7) return prefs.phone?.length >= 10 && apikey.length >= 4
    return true
  }

  const handleSubmit = async () => {
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/save-prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+92' + prefs.phone, apikey, prefs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('done')
    } catch (e) {
      setStatus('error')
      setErrorMsg(e.message)
    }
  }

  const toggle = (field, value) => {
    const arr = prefs[field] || []
    setPrefs({ ...prefs, [field]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value] })
  }

  const stepContent = [
    // Step 0: City
    <div key="city">
      <h2 style={s.title}>Which city are you looking in?</h2>
      <p style={s.sub}>Select one or more cities</p>
      <div style={s.chips}>
        {CITIES.map(c => <Chip key={c} label={c} selected={(prefs.cities||[]).includes(c)} onClick={() => toggle('cities', c)} />)}
      </div>
    </div>,

    // Step 1: Type
    <div key="type">
      <h2 style={s.title}>What type of property?</h2>
      <p style={s.sub}>Choose all that apply</p>
      <div style={s.chips}>
        {PROPERTY_TYPES.map(t => <Chip key={t} label={t} selected={(prefs.types||[]).includes(t)} onClick={() => toggle('types', t)} />)}
      </div>
    </div>,

    // Step 2: Purpose
    <div key="purpose">
      <h2 style={s.title}>What's your goal?</h2>
      <p style={s.sub}>This shapes which listings we find</p>
      <div style={{ display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
        {PURPOSES.map(p => (
          <button key={p} onClick={() => setPrefs({ ...prefs, purpose: p, budget: null })} style={{
            flex: 1, minWidth: 100, padding: '28px 16px', borderRadius: 16,
            border: prefs.purpose === p ? '1.5px solid #00C896' : '1.5px solid rgba(255,255,255,0.12)',
            background: prefs.purpose === p ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.03)',
            color: prefs.purpose === p ? '#00C896' : 'rgba(255,255,255,0.65)',
            cursor: 'pointer', fontSize: 15, fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
          }}>
            {p === 'Buy' ? '🏡' : p === 'Rent' ? '🔑' : '📈'}<br />
            <span style={{ marginTop: 8, display: 'block' }}>{p}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Budget
    <div key="budget">
      <h2 style={s.title}>What's your budget?</h2>
      <p style={s.sub}>For {prefs.purpose?.toLowerCase() || 'purchase'}</p>
      <div style={s.chips}>
        {(BUDGET_RANGES[prefs.purpose] || BUDGET_RANGES.Buy).map(r =>
          <Chip key={r} label={r} selected={prefs.budget === r} onClick={() => setPrefs({ ...prefs, budget: r })} />
        )}
      </div>
    </div>,

    // Step 4: Size
    <div key="size">
      <h2 style={s.title}>Minimum size?</h2>
      <p style={s.sub}>Select minimum preferred size</p>
      <div style={s.chips}>
        {SIZE_OPTIONS.map(sz => <Chip key={sz} label={sz} selected={prefs.size === sz} onClick={() => setPrefs({ ...prefs, size: sz })} />)}
      </div>
    </div>,

    // Step 5: Bedrooms
    <div key="bedrooms">
      <h2 style={s.title}>How many bedrooms?</h2>
      <p style={s.sub}>Minimum required</p>
      <div style={s.chips}>
        {BEDROOM_OPTIONS.map(b => <Chip key={b} label={b === 'Any' ? 'Any / Flexible' : `${b} BR`} selected={prefs.bedrooms === b} onClick={() => setPrefs({ ...prefs, bedrooms: b })} />)}
      </div>
    </div>,

    // Step 6: Features
    <div key="features">
      <h2 style={s.title}>Must-have features?</h2>
      <p style={s.sub}>Optional — skip if no preference</p>
      <div style={s.chips}>
        {FEATURES.map(f => <Chip key={f} label={f} selected={(prefs.features||[]).includes(f)} onClick={() => toggle('features', f)} />)}
      </div>
    </div>,

    // Step 7: WhatsApp + CallMeBot
    <div key="whatsapp">
      <h2 style={s.title}>Connect your WhatsApp</h2>
      <p style={s.sub}>We'll send your daily report via a free service called CallMeBot</p>

      <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 12, background: 'rgba(0,200,150,0.07)', border: '1px solid rgba(0,200,150,0.2)', marginBottom: 20 }}>
        <p style={{ color: '#00C896', fontWeight: 600, margin: '0 0 8px', fontSize: 14 }}>📋 Setup steps (one-time, 2 minutes):</p>
        <ol style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 2, margin: 0, paddingLeft: 20 }}>
          <li>Save this number in your contacts: <strong style={{ color: '#fff' }}>+34 694 26 48 06</strong></li>
          <li>Send them a WhatsApp message: <strong style={{ color: '#fff' }}>I allow callmebot to send me messages</strong></li>
          <li>They'll reply with your <strong style={{ color: '#fff' }}>API key</strong> — paste it below</li>
        </ol>
      </div>

      <label style={s.label}>Your Phone Number (WhatsApp)</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <div style={{ ...s.input, width: 60, flex: 'none', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+92</div>
        <input type="tel" placeholder="3XX XXXXXXX" value={prefs.phone || ''} onChange={e => setPrefs({ ...prefs, phone: e.target.value })} style={{ ...s.input, flex: 1, marginTop: 0 }} />
      </div>

      <label style={{ ...s.label, marginTop: 16 }}>CallMeBot API Key</label>
      <input type="text" placeholder="e.g. 1234567" value={apikey} onChange={e => setApikey(e.target.value)} style={s.input} />
    </div>,
  ]

  if (status === 'done') {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ ...s.title, textAlign: 'center' }}>Your agent is live!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, marginTop: 12 }}>
            We'll scan Zameen.com and other property sites every morning and WhatsApp you matching listings at <strong style={{ color: '#00C896' }}>9 AM</strong>.<br />
            If there are no matches, we'll silently check again tomorrow.
          </p>

          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left' }}>
            {[
              { label: 'Cities', value: (prefs.cities||[]).join(', ') },
              { label: 'Type', value: (prefs.types||[]).join(', ') },
              { label: 'Purpose', value: prefs.purpose },
              { label: 'Budget', value: prefs.budget },
              { label: 'Size', value: prefs.size },
              { label: 'Bedrooms', value: prefs.bedrooms ? `${prefs.bedrooms} BR` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: 500 }}>{value || '—'}</div>
              </div>
            ))}
          </div>

          <button onClick={() => { setStep(0); setPrefs({}); setApikey(''); setStatus('idle') }} style={{ marginTop: 24, width: '100%', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            + Add another agent
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? '#00C896' : 'rgba(255,255,255,0.1)', transition: 'background 0.4s' }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {STEPS[step].icon} {STEPS[step].label}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{step + 1} / {totalSteps}</span>
      </div>

      <div style={{ minHeight: 260, paddingTop: 16 }}>
        {stepContent[step]}
      </div>

      {status === 'error' && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 12 }}>⚠️ {errorMsg || 'Something went wrong. Try again.'}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
            ← Back
          </button>
        )}
        <button
          onClick={isLast ? handleSubmit : () => setStep(s => s + 1)}
          disabled={!canProceed() || status === 'saving'}
          style={{
            flex: 2, padding: 14, borderRadius: 12, border: 'none',
            background: canProceed() && status !== 'saving' ? 'linear-gradient(135deg, #00C896, #00a87a)' : 'rgba(255,255,255,0.06)',
            color: canProceed() ? '#fff' : 'rgba(255,255,255,0.2)',
            fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            cursor: canProceed() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
          }}
        >
          {status === 'saving' ? '⏳ Activating…' : isLast ? '🚀 Activate My Agent' : 'Continue →'}
        </button>
      </div>
    </Layout>
  )
}

function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Property Scout — Daily WhatsApp Alerts</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080d12; min-height: 100vh; }
        input { outline: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #080d12 0%, #0d1a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 250, background: 'radial-gradient(ellipse, rgba(0,200,150,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 500, animation: 'fadeUp 0.4s ease' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)', marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#00C896', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Property Scout</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'DM Serif Display, serif', lineHeight: 1.2 }}>
              Find Your Dream Property<br />
              <span style={{ color: '#00C896' }}>While You Sleep.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 10 }}>Set once. Get WhatsApp alerts daily — free.</p>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px' }}>
            {children}
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 16 }}>
            Powered by Claude AI + Zameen.com • 100% Free
          </p>
        </div>
      </div>
    </>
  )
}

const s = {
  title: { fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'DM Serif Display, serif', lineHeight: 1.3 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  input: { display: 'block', width: '100%', marginTop: 8, padding: '13px 15px', borderRadius: 11, border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, fontFamily: 'DM Sans, sans-serif' },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block' },
}
