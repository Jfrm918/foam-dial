import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEYS = {
  foamSystems: 'foamDial.foamSystems',
  diagnostics: 'foamDial.diagnostics',
  jobs: 'foamDial.jobs',
  equipment: 'foamDial.equipment',
  chat: 'foamDial.chat',
}

const defaultFoamSystems = [
  {
    id: 'easyseal-05',
    manufacturer: 'Enverge',
    product: 'EasySeal .5',
    type: 'open',
    rValue: '3.8',
    yield: '20000',
    ratio: '1:1',
    minTemp: '60',
    maxTemp: '95',
    substrates: 'Walls, rooflines, metal buildings',
    notes:
      'PRIMARY. Targets: 2x4=4in (R15) | 2x6=4-6in (R15-23) | Rooflines=5-6in | Metal=3.5-5in. +25% yield vs Ambit.',
  },
  {
    id: 'sucraseal-oc',
    manufacturer: 'Enverge',
    product: 'SucraSeal OC',
    type: 'open',
    rValue: '3.8',
    yield: '22000',
    ratio: '1:1',
    minTemp: '60',
    maxTemp: '95',
    substrates: 'Green spec projects, walls, attics',
    notes: 'Bio-based OC. Highest yielding bio-based OC per Enverge.',
  },
  {
    id: 'onepass-hfo',
    manufacturer: 'Enverge',
    product: 'OnePass HFO',
    type: 'closed',
    rValue: '7.0',
    yield: '1400',
    ratio: '1:1',
    minTemp: '55',
    maxTemp: '90',
    substrates: 'Roofs, foundations, exterior, cold storage',
    notes: 'TBD IF RUNNING. Up to 4in single pass. 30%+ yield vs standard 2lb.',
  },
  {
    id: 'nexseal-cc',
    manufacturer: 'Enverge',
    product: 'NexSeal CC',
    type: 'closed',
    rValue: '7.0',
    yield: '1350',
    ratio: '1:1',
    minTemp: '55',
    maxTemp: '90',
    substrates: 'Foundations, exterior, cold storage',
    notes: 'TBD IF RUNNING. HFO Solstice LBA. Low GWP.',
  },
  {
    id: 'ambit-oc',
    manufacturer: 'Ambit',
    product: 'OC (previous)',
    type: 'open',
    rValue: '3.7',
    yield: '16000',
    ratio: '1:1',
    minTemp: '60',
    maxTemp: '90',
    substrates: 'Reference only',
    notes: 'PREVIOUS. Switched away. 16k bf/set. Reference for yield comparison.',
  },
  {
    id: 'sealection-500',
    manufacturer: 'Demilec',
    product: 'Sealection 500',
    type: 'open',
    rValue: '3.8',
    yield: '19000',
    ratio: '1:1',
    minTemp: '60',
    maxTemp: '95',
    substrates: 'Walls, attics',
    notes: 'Competitor OC reference. Water-blown.',
  },
  {
    id: 'walltite-eco',
    manufacturer: 'BASF',
    product: 'Walltite ECO',
    type: 'closed',
    rValue: '7.0',
    yield: '1300',
    ratio: '1:1',
    minTemp: '55',
    maxTemp: '85',
    substrates: 'Moisture barrier assemblies',
    notes: 'Competitor CC reference. Excellent moisture barrier.',
  },
  {
    id: 'bayseal-cc',
    manufacturer: 'Covestro',
    product: 'Bayseal CC',
    type: 'closed',
    rValue: '6.5',
    yield: '1250',
    ratio: '1:1',
    minTemp: '55',
    maxTemp: '95',
    substrates: 'Metal buildings, pole barns',
    notes: 'Competitor CC. Strong metal adhesion. Pole barns.',
  },
]

const defaultDiagnostics = [
  {
    id: 'fisheyes',
    problem: 'Fisheyes / Pinhole Voids',
    category: 'surface',
    severity: 'high',
    causes: 'B-heavy off-ratio, substrate contamination, cold substrate <50F, gun too fast, high humidity/dew point',
    fixes: 'Balance A/B within 10%, clean and dry substrate, pre-heat to 55F+, slow gun, keep substrate 10F above dew point',
  },
  {
    id: 'delamination',
    problem: 'Delamination / Pulling Away',
    category: 'adhesion',
    severity: 'high',
    causes: 'Substrate below 45F, oil/dust/frost, first pass too thin, smooth ICF or concrete, over vapor barrier',
    fixes: 'Pre-heat to 60F+, acetone on metal or dry brush on wood, 1in+ tack coat, profile smooth surfaces, remove vapor barriers',
  },
  {
    id: 'b-heavy',
    problem: 'Off-Ratio - B-Heavy',
    category: 'ratio',
    severity: 'high',
    causes: 'B pressure too high, B too hot, A filter clogged, A drum running low',
    fixes: 'Balance pressures at gun, lower B hose temp 5-10F, purge and clean A strainer, switch A drum before empty',
  },
  {
    id: 'a-heavy',
    problem: 'Off-Ratio - A-Heavy',
    category: 'ratio',
    severity: 'high',
    causes: 'A pressure too high, A overheated, B filter clogged, B drum running low',
    fixes: 'Reduce A pressure, lower A hose temp, purge and clean B filter, switch B drum immediately',
  },
  {
    id: 'tacky',
    problem: 'Tacky / Sticky Foam',
    category: 'surface',
    severity: 'med',
    causes: 'B-heavy ratio, pass too thick, material too warm, RH above 80%',
    fixes: 'Check ratio first, reduce pass thickness, drop hose temp 5F, improve ventilation',
  },
  {
    id: 'low-yield',
    problem: 'Low Yield / Burning Through Sets',
    category: 'yield',
    severity: 'med',
    causes: 'Drums too cold, ambient too hot, partial blockage, drum stratification',
    fixes: 'Heat drums to 65-70F, work early morning in summer, purge and check filters, roll drums before use',
  },
  {
    id: 'sagging',
    problem: 'Foam Sagging Off Walls',
    category: 'application',
    severity: 'med',
    causes: 'Pass too thick per lift, material too hot, high ambient temp',
    fixes: 'Max 3in per lift on verticals, wait between passes, lower hose temp 5-10F',
  },
  {
    id: 'cold-weather',
    problem: 'Cold Weather Problems (<40F)',
    category: 'weather',
    severity: 'high',
    causes: 'Drums too cold, substrate below 50F, hose temp dropping, slow reaction',
    fixes: 'Heat drums overnight to 70F, pre-heat substrate, increase hose temp 5-10F, insulate hose runs',
  },
  {
    id: 'cell-structure',
    problem: 'Poor Cell Structure / Rough Texture',
    category: 'application',
    severity: 'med',
    causes: 'Gun too fast, pressures too low, temp out of spec, nozzle clogged',
    fixes: 'Slow gun movement, increase pressures to spec, check temps, change mix chamber or nozzle',
  },
  {
    id: 'surging',
    problem: 'Pressure Fluctuation / Surging',
    category: 'equipment',
    severity: 'high',
    causes: 'Pump cavitation, air in supply lines, filter restriction, check valve failure',
    fixes: 'Switch drum before empty, bleed air from lines, clean all filters, inspect check valves',
  },
  {
    id: 'summer',
    problem: 'Hot Weather / Summer Issues',
    category: 'weather',
    severity: 'med',
    causes: 'Foam reacts too fast, shorter cream time, sags more on verticals',
    fixes: 'Work early morning, lower hose temps 5-10F, thinner passes on verticals, shade drum truck',
  },
  {
    id: 'discoloration',
    problem: 'Discoloration / Uneven Color',
    category: 'yield',
    severity: 'low',
    causes: 'Ratio drift, B-drum past shelf life, UV exposure, contamination',
    fixes: 'Run cup test, weigh each side, check B-drum date, cosmetic only if old foam, suspect ratio if fresh foam discolors',
  },
]

const defaultJobs = [
  {
    id: 'job-2026-04-16-tulsa-51st-mingo-wood',
    date: '2026-04-16',
    location: 'Tulsa, 51st and Mingo, wood substrate',
    foam: 'Enverge open cell',
    sets: '12',
    bf: '',
    ambT: '70',
    subT: '',
    rh: '84',
    rating: '3',
    problems: 'Foam felt too hot. Dropped setting to 143F with little noticeable change.',
    notes: 'Finished log for second job. Spraying wood substrate. Current weather around start was roughly 70F, 84% RH, overcast, south wind about 11 mph. Rig screen photo at 12:13 showed hose target 145F, A 124F, B 121F, hose actual 138F, transfer pressures A 81 psi and B 67 psi, main pressure 1120 psi. Foam still laid down nice overall, but job rated 6/10.',
  },
  {
    id: 'job-2026-04-16-tulsa-hills-common-wall',
    date: '2026-04-16',
    location: 'Tulsa Hills common wall, sheetrock substrate',
    foam: 'Enverge open cell',
    sets: '13',
    bf: '',
    ambT: '56',
    subT: '',
    rh: '67',
    rating: '4',
    problems: 'Rolled a little in certain cavities.',
    notes: 'Finished log. Flat spray against sheetrock on common wall. Tulsa Hills weather at start roughly 56F, 67% RH, light SSE wind, mist early. Rig start settings from photo: hose target 145F, A 145F, B 146F, A pressure 1065 psi, B pressure 1080 psi. Foam sprayed good from the start, stayed consistent on growth time, and had no shrinking or peel back. Finished around 11:30 AM. Job rated 8/10.',
  },
]

const defaultEquipment = [
  {
    id: 'eq-1',
    date: '2026-04-10',
    gunModel: 'Fusion AP',
    hoseTempA: '128',
    hoseTempB: '127',
    drumTempA: '70',
    drumTempB: '71',
    pressureA: '1180',
    pressureB: '1170',
    notes: 'Balanced. Good atomization. No surging.',
  },
  {
    id: 'eq-2',
    date: '2026-04-08',
    gunModel: 'Fusion AP',
    hoseTempA: '132',
    hoseTempB: '132',
    drumTempA: '72',
    drumTempB: '73',
    pressureA: '1200',
    pressureB: '1195',
    notes: 'Hot afternoon. Reduced temp mid-job to control sagging.',
  },
]

const defaultChat = [
  {
    role: 'assistant',
    text: 'I am Foam Dial AI. Ask for dial-in numbers, field diagnostics, or job recommendations.',
  },
]

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'foam-db', label: 'Foam Database', icon: '◫' },
  { id: 'diagnostics', label: 'Diagnostics', icon: '⌁' },
  { id: 'job-log', label: 'Job Log', icon: '📝' },
  { id: 'equipment-log', label: 'Equipment Log', icon: '⚙' },
  { id: 'calculator', label: 'Dial-In', icon: '◌' },
  { id: 'ai-chat', label: 'AI Expert', icon: '✦' },
]

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function calculateDewPoint(tempF, humidity) {
  const tempC = ((tempF - 32) * 5) / 9
  const a = 17.27
  const b = 237.7
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100)
  const dewC = (b * alpha) / (a - alpha)
  return (dewC * 9) / 5 + 32
}

function getDialInRecommendation({ ambient, substrate, humidity, foamType }) {
  const dewPoint = calculateDewPoint(ambient, humidity)
  const margin = substrate - dewPoint
  const hoseBase = foamType === 'closed' ? 125 : 128
  const drumBase = foamType === 'closed' ? 72 : 68
  const coldBump = ambient < 50 ? 10 : ambient < 65 ? 5 : 0
  const hotDrop = ambient > 80 ? -8 : ambient > 72 ? -4 : 0
  const humidityDrop = humidity > 75 ? -3 : 0

  return {
    dewPoint,
    margin,
    hoseTemp: hoseBase + coldBump + hotDrop + humidityDrop,
    drumTemp: drumBase + (ambient < 55 ? 4 : 0),
    alerts: [
      margin < 10 ? 'Substrate is too close to dew point. Get 10F+ margin before spraying.' : null,
      humidity > 80 ? 'Humidity is elevated. Expect slower forgiveness and more surface defects.' : null,
      ambient > 85 ? 'High heat. Work thinner lifts and lower hose temp.' : null,
    ].filter(Boolean),
  }
}

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [foamSystems, setFoamSystems] = useState([])
  const [diagnostics, setDiagnostics] = useState([])
  const [jobs, setJobs] = useState([])
  const [equipment, setEquipment] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [foamSearch, setFoamSearch] = useState('')
  const [diagnosticSearch, setDiagnosticSearch] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [foamForm, setFoamForm] = useState({ manufacturer: '', product: '', type: 'open', rValue: '', yield: '', ratio: '1:1', minTemp: '', maxTemp: '', substrates: '', notes: '' })
  const [jobForm, setJobForm] = useState({ date: '', location: '', foam: 'Enverge EasySeal .5', sets: '', bf: '', ambT: '', subT: '', rh: '', rating: '5', problems: '', notes: '' })
  const [jobStep, setJobStep] = useState(0)
  const [equipmentForm, setEquipmentForm] = useState({ date: '', gunModel: 'Fusion AP', hoseTempA: '', hoseTempB: '', drumTempA: '', drumTempB: '', pressureA: '', pressureB: '', notes: '' })
  const [calculator, setCalculator] = useState({ ambient: 68, substrate: 60, humidity: 50, foamType: 'open' })

  const jobSteps = [
    { id: 'basics', label: 'Basics' },
    { id: 'production', label: 'Production' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'notes', label: 'Notes' },
  ]

  useEffect(() => {
    setFoamSystems(readStorage(STORAGE_KEYS.foamSystems, defaultFoamSystems))
    setDiagnostics(readStorage(STORAGE_KEYS.diagnostics, defaultDiagnostics))
    setJobs(readStorage(STORAGE_KEYS.jobs, defaultJobs))
    setEquipment(readStorage(STORAGE_KEYS.equipment, defaultEquipment))
    setChatMessages(readStorage(STORAGE_KEYS.chat, defaultChat))
  }, [])

  useEffect(() => {
    if (foamSystems.length) saveStorage(STORAGE_KEYS.foamSystems, foamSystems)
  }, [foamSystems])

  useEffect(() => {
    if (diagnostics.length) saveStorage(STORAGE_KEYS.diagnostics, diagnostics)
  }, [diagnostics])

  useEffect(() => {
    if (jobs.length) saveStorage(STORAGE_KEYS.jobs, jobs)
  }, [jobs])

  useEffect(() => {
    if (equipment.length) saveStorage(STORAGE_KEYS.equipment, equipment)
  }, [equipment])

  useEffect(() => {
    if (chatMessages.length) saveStorage(STORAGE_KEYS.chat, chatMessages)
  }, [chatMessages])

  const avgYield = useMemo(() => {
    if (!jobs.length) return 0
    const values = jobs
      .map((job) => Number(job.bf) / Math.max(Number(job.sets), 1))
      .filter(Boolean)
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0
  }, [jobs])

  const filteredFoams = foamSystems.filter((foam) =>
    `${foam.manufacturer} ${foam.product} ${foam.type} ${foam.notes}`
      .toLowerCase()
      .includes(foamSearch.toLowerCase()),
  )

  const filteredDiagnostics = diagnostics.filter((item) =>
    `${item.problem} ${item.category} ${item.causes} ${item.fixes}`
      .toLowerCase()
      .includes(diagnosticSearch.toLowerCase()),
  )

  const dialIn = useMemo(() => getDialInRecommendation(calculator), [calculator])

  function addFoamSystem(event) {
    event.preventDefault()
    const next = {
      id: crypto.randomUUID(),
      ...foamForm,
    }
    setFoamSystems((current) => [next, ...current])
    setFoamForm({ manufacturer: '', product: '', type: 'open', rValue: '', yield: '', ratio: '1:1', minTemp: '', maxTemp: '', substrates: '', notes: '' })
  }

  function addJob(event) {
    event.preventDefault()
    setJobs((current) => [{ id: crypto.randomUUID(), ...jobForm }, ...current])
    setJobForm({ date: '', location: '', foam: 'Enverge EasySeal .5', sets: '', bf: '', ambT: '', subT: '', rh: '', rating: '5', problems: '', notes: '' })
    setJobStep(0)
  }

  function updateJobField(field, value) {
    setJobForm((current) => ({ ...current, [field]: value }))
  }

  function nextJobStep() {
    setJobStep((current) => Math.min(current + 1, jobSteps.length - 1))
  }

  function previousJobStep() {
    setJobStep((current) => Math.max(current - 1, 0))
  }

  function addEquipment(event) {
    event.preventDefault()
    setEquipment((current) => [{ id: crypto.randomUUID(), ...equipmentForm }, ...current])
    setEquipmentForm({ date: '', gunModel: 'Fusion AP', hoseTempA: '', hoseTempB: '', drumTempA: '', drumTempB: '', pressureA: '', pressureB: '', notes: '' })
  }

  function sendChatMessage(message) {
    const prompt = message.trim()
    if (!prompt) return

    const lower = prompt.toLowerCase()
    let response = 'Log more jobs and equipment data so I can answer from your operation, not generic foam advice.'

    if (lower.includes('yield')) {
      response = `Your logged average is ${avgYield.toLocaleString()} bf per set. EasySeal target is 20,000 bf per set, so the current sample is ${avgYield >= 20000 ? 'on target or better' : 'below target and needs tightening on temp, ratio, or drum conditioning'}.`
    } else if (lower.includes('dew') || lower.includes('dial')) {
      response = `At ${calculator.ambient}F ambient, ${calculator.substrate}F substrate, and ${calculator.humidity}% RH, dew point is ${dialIn.dewPoint.toFixed(1)}F and margin is ${dialIn.margin.toFixed(1)}F. Run about ${dialIn.hoseTemp}F hose and ${dialIn.drumTemp}F drums for a ${calculator.foamType} cell baseline.`
    } else if (lower.includes('sticky') || lower.includes('tacky')) {
      response = 'Tacky foam is usually B-heavy first. Check ratio before anything else, reduce pass thickness, drop hose temp 5F, and improve ventilation.'
    } else if (lower.includes('easyseal')) {
      response = 'EasySeal .5 is the primary system here, R-3.8 per inch with 20,000 bf per set target. Best use case is walls, rooflines, and metal buildings with clean dry substrate and controlled dew margin.'
    }

    setChatMessages((current) => [
      ...current,
      { role: 'user', text: prompt },
      { role: 'assistant', text: response },
    ])
    setChatInput('')
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <section className="content-grid">
            <div className="hero-card glass-card">
              <div>
                <p className="eyebrow">Spray foam intelligence hub</p>
                <h1>FOAM DIAL</h1>
                <p className="hero-copy">Track jobs, lock in better yield, and keep field diagnostics one tap away.</p>
                <p className="live-test-banner">LIVE TEST ACTIVE</p>
              </div>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => setActiveSection('job-log')}>Log Job</button>
                <button className="ghost-button" onClick={() => setActiveSection('calculator')}>Open Dial-In</button>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard label="Jobs logged" value={jobs.length} detail="All recorded installs" />
              <StatCard label="Sets tracked" value={jobs.reduce((sum, job) => sum + Number(job.sets || 0), 0)} detail="Across all logged jobs" />
              <StatCard label="Avg yield" value={`${avgYield.toLocaleString()} bf/set`} detail="Based on current job history" />
              <StatCard label="Primary foam" value="EasySeal .5" detail="+25% field yield vs Ambit" accent />
            </div>

            <div className="two-column">
              <div className="glass-card panel-card">
                <SectionHeader title="Recent jobs" subtitle="Reverse chronological field log" />
                <div className="stack-list">
                  {jobs.slice(0, 5).map((job) => (
                    <article className="list-card" key={job.id}>
                      <div className="list-topline">
                        <strong>{job.location}</strong>
                        <span>{job.date}</span>
                      </div>
                      <p>{job.foam} • {job.bf} bf • {job.sets} set(s)</p>
                      <small>{job.notes}</small>
                    </article>
                  ))}
                </div>
              </div>

              <div className="glass-card panel-card">
                <SectionHeader title="Quick actions" subtitle="High-value shortcuts" />
                <div className="action-grid">
                  {[
                    ['Open diagnostics', 'diagnostics'],
                    ['Review foam database', 'foam-db'],
                    ['Check equipment log', 'equipment-log'],
                    ['Ask Foam Dial AI', 'ai-chat'],
                  ].map(([label, section]) => (
                    <button key={label} className="action-tile" onClick={() => setActiveSection(section)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      case 'foam-db':
        return (
          <section className="content-grid">
            <div className="glass-card panel-card">
              <SectionHeader title="Foam database" subtitle="Searchable product systems" />
              <div className="toolbar">
                <input className="glass-input" placeholder="Search manufacturer, product, notes" value={foamSearch} onChange={(event) => setFoamSearch(event.target.value)} />
              </div>
              <div className="card-grid">
                {filteredFoams.map((foam) => (
                  <article className="foam-card" key={foam.id}>
                    <div className="list-topline">
                      <strong>{foam.manufacturer} {foam.product}</strong>
                      <span className={`pill pill-${foam.type}`}>{foam.type}</span>
                    </div>
                    <p>R-{foam.rValue}/in • {Number(foam.yield).toLocaleString()} bf/set • Ratio {foam.ratio}</p>
                    <p>{foam.minTemp}F to {foam.maxTemp}F</p>
                    <small>{foam.notes}</small>
                    <button className="text-button" onClick={() => setFoamSystems((current) => current.filter((item) => item.id !== foam.id))}>Delete</button>
                  </article>
                ))}
              </div>
            </div>

            <form className="glass-card panel-card form-card" onSubmit={addFoamSystem}>
              <SectionHeader title="Add foam system" subtitle="Keep the database current" />
              <div className="form-grid">
                <input className="glass-input" placeholder="Manufacturer" value={foamForm.manufacturer} onChange={(event) => setFoamForm({ ...foamForm, manufacturer: event.target.value })} required />
                <input className="glass-input" placeholder="Product" value={foamForm.product} onChange={(event) => setFoamForm({ ...foamForm, product: event.target.value })} required />
                <select className="glass-input" value={foamForm.type} onChange={(event) => setFoamForm({ ...foamForm, type: event.target.value })}>
                  <option value="open">Open cell</option>
                  <option value="closed">Closed cell</option>
                </select>
                <input className="glass-input" placeholder="R-value/in" value={foamForm.rValue} onChange={(event) => setFoamForm({ ...foamForm, rValue: event.target.value })} required />
                <input className="glass-input" placeholder="Yield bf/set" value={foamForm.yield} onChange={(event) => setFoamForm({ ...foamForm, yield: event.target.value })} required />
                <input className="glass-input" placeholder="Ratio" value={foamForm.ratio} onChange={(event) => setFoamForm({ ...foamForm, ratio: event.target.value })} required />
                <input className="glass-input" placeholder="Min temp F" value={foamForm.minTemp} onChange={(event) => setFoamForm({ ...foamForm, minTemp: event.target.value })} required />
                <input className="glass-input" placeholder="Max temp F" value={foamForm.maxTemp} onChange={(event) => setFoamForm({ ...foamForm, maxTemp: event.target.value })} required />
                <input className="glass-input span-2" placeholder="Substrates" value={foamForm.substrates} onChange={(event) => setFoamForm({ ...foamForm, substrates: event.target.value })} />
                <textarea className="glass-input span-2" placeholder="Notes" rows="4" value={foamForm.notes} onChange={(event) => setFoamForm({ ...foamForm, notes: event.target.value })} />
              </div>
              <button className="primary-button" type="submit">Save Foam System</button>
            </form>
          </section>
        )
      case 'diagnostics':
        return (
          <section className="content-grid">
            <div className="glass-card panel-card">
              <SectionHeader title="Field diagnostics" subtitle="Symptom lookup with causes and fixes" />
              <div className="toolbar">
                <input className="glass-input" placeholder="Search symptoms, causes, fixes" value={diagnosticSearch} onChange={(event) => setDiagnosticSearch(event.target.value)} />
              </div>
              <div className="stack-list">
                {filteredDiagnostics.map((item) => (
                  <article className="list-card diagnostic-card" key={item.id}>
                    <div className="list-topline">
                      <strong>{item.problem}</strong>
                      <div className="pill-row">
                        <span className="pill pill-neutral">{item.category}</span>
                        <span className={`pill pill-${item.severity}`}>{item.severity}</span>
                      </div>
                    </div>
                    <p><strong>Causes:</strong> {item.causes}</p>
                    <small><strong>Fixes:</strong> {item.fixes}</small>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      case 'job-log':
        return (
          <section className="content-grid two-column-layout job-log-layout">
            <form className="glass-card panel-card form-card mobile-job-card" onSubmit={addJob}>
              <SectionHeader title="Quick log job" subtitle="Built for iPhone-speed entry" />

              <div className="job-stepper">
                {jobSteps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    className={index === jobStep ? 'job-step-pill active' : 'job-step-pill'}
                    onClick={() => setJobStep(index)}
                  >
                    {index + 1}. {step.label}
                  </button>
                ))}
              </div>

              <div className="job-progress-card">
                <small>Step {jobStep + 1} of {jobSteps.length}</small>
                <strong>{jobSteps[jobStep].label}</strong>
              </div>

              {jobStep === 0 && (
                <div className="mobile-form-stack">
                  <label className="field-block">
                    <span>Date</span>
                    <input className="glass-input touch-input" type="date" value={jobForm.date} onChange={(event) => updateJobField('date', event.target.value)} required />
                  </label>
                  <label className="field-block">
                    <span>Job location</span>
                    <input className="glass-input touch-input" placeholder="Lincoln attic retrofit" value={jobForm.location} onChange={(event) => updateJobField('location', event.target.value)} required />
                  </label>
                  <label className="field-block">
                    <span>Foam used</span>
                    <input className="glass-input touch-input" placeholder="Enverge EasySeal .5" value={jobForm.foam} onChange={(event) => updateJobField('foam', event.target.value)} required />
                  </label>
                </div>
              )}

              {jobStep === 1 && (
                <div className="mobile-form-stack">
                  <div className="mobile-split-grid">
                    <label className="field-block">
                      <span>Sets used</span>
                      <input className="glass-input touch-input" inputMode="numeric" placeholder="2" value={jobForm.sets} onChange={(event) => updateJobField('sets', event.target.value)} required />
                    </label>
                    <label className="field-block">
                      <span>Board feet</span>
                      <input className="glass-input touch-input" inputMode="numeric" placeholder="39200" value={jobForm.bf} onChange={(event) => updateJobField('bf', event.target.value)} required />
                    </label>
                  </div>
                  <label className="field-block">
                    <span>Overall job rating</span>
                    <div className="rating-row">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={Number(jobForm.rating) === value ? 'rating-chip active' : 'rating-chip'}
                          onClick={() => updateJobField('rating', String(value))}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              )}

              {jobStep === 2 && (
                <div className="mobile-form-stack">
                  <div className="mobile-split-grid">
                    <label className="field-block">
                      <span>Ambient temp</span>
                      <input className="glass-input touch-input" inputMode="numeric" placeholder="67" value={jobForm.ambT} onChange={(event) => updateJobField('ambT', event.target.value)} required />
                    </label>
                    <label className="field-block">
                      <span>Substrate temp</span>
                      <input className="glass-input touch-input" inputMode="numeric" placeholder="61" value={jobForm.subT} onChange={(event) => updateJobField('subT', event.target.value)} required />
                    </label>
                  </div>
                  <label className="field-block">
                    <span>Humidity %</span>
                    <input className="glass-input touch-input" inputMode="numeric" placeholder="48" value={jobForm.rh} onChange={(event) => updateJobField('rh', event.target.value)} required />
                  </label>
                </div>
              )}

              {jobStep === 3 && (
                <div className="mobile-form-stack">
                  <label className="field-block">
                    <span>Problems noticed</span>
                    <input className="glass-input touch-input" placeholder="Minor sagging on west wall lifts" value={jobForm.problems} onChange={(event) => updateJobField('problems', event.target.value)} />
                  </label>
                  <label className="field-block">
                    <span>Notes</span>
                    <textarea className="glass-input touch-input touch-textarea" rows="5" placeholder="What changed, what worked, what went wrong" value={jobForm.notes} onChange={(event) => updateJobField('notes', event.target.value)} />
                  </label>
                  <div className="job-summary-card">
                    <strong>{jobForm.location || 'New job log'}</strong>
                    <small>{jobForm.foam || 'Foam not set yet'} • {jobForm.sets || '0'} set(s) • {jobForm.bf || '0'} bf</small>
                  </div>
                </div>
              )}

              <div className="job-nav-row">
                <button type="button" className="ghost-button" onClick={previousJobStep} disabled={jobStep === 0}>Back</button>
                {jobStep < jobSteps.length - 1 ? (
                  <button type="button" className="primary-button" onClick={nextJobStep}>Next</button>
                ) : (
                  <button className="primary-button" type="submit">Save Job</button>
                )}
              </div>
            </form>

            <div className="glass-card panel-card">
              <SectionHeader title="Recent job history" subtitle="Fast review after entry" />
              <div className="stack-list">
                {jobs.map((job) => (
                  <article className="list-card job-history-card" key={job.id}>
                    <div className="list-topline">
                      <strong>{job.location}</strong>
                      <span>{job.date}</span>
                    </div>
                    <p>{job.foam} • {job.bf} bf • {job.sets} set(s)</p>
                    <div className="job-history-metrics">
                      <span>{job.ambT}F ambient</span>
                      <span>{job.subT}F substrate</span>
                      <span>{job.rh}% RH</span>
                      <span>Rating {job.rating}/5</span>
                    </div>
                    <small>Problems: {job.problems || 'None'} • {job.notes || 'No notes logged.'}</small>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      case 'equipment-log':
        return (
          <section className="content-grid two-column-layout">
            <form className="glass-card panel-card form-card" onSubmit={addEquipment}>
              <SectionHeader title="Equipment log" subtitle="Track settings and pressure balance" />
              <div className="form-grid">
                <input className="glass-input" type="date" value={equipmentForm.date} onChange={(event) => setEquipmentForm({ ...equipmentForm, date: event.target.value })} required />
                <input className="glass-input" placeholder="Gun model" value={equipmentForm.gunModel} onChange={(event) => setEquipmentForm({ ...equipmentForm, gunModel: event.target.value })} required />
                <input className="glass-input" placeholder="Hose temp A" value={equipmentForm.hoseTempA} onChange={(event) => setEquipmentForm({ ...equipmentForm, hoseTempA: event.target.value })} required />
                <input className="glass-input" placeholder="Hose temp B" value={equipmentForm.hoseTempB} onChange={(event) => setEquipmentForm({ ...equipmentForm, hoseTempB: event.target.value })} required />
                <input className="glass-input" placeholder="Drum temp A" value={equipmentForm.drumTempA} onChange={(event) => setEquipmentForm({ ...equipmentForm, drumTempA: event.target.value })} required />
                <input className="glass-input" placeholder="Drum temp B" value={equipmentForm.drumTempB} onChange={(event) => setEquipmentForm({ ...equipmentForm, drumTempB: event.target.value })} required />
                <input className="glass-input" placeholder="Pressure A psi" value={equipmentForm.pressureA} onChange={(event) => setEquipmentForm({ ...equipmentForm, pressureA: event.target.value })} required />
                <input className="glass-input" placeholder="Pressure B psi" value={equipmentForm.pressureB} onChange={(event) => setEquipmentForm({ ...equipmentForm, pressureB: event.target.value })} required />
                <textarea className="glass-input span-2" rows="4" placeholder="Notes" value={equipmentForm.notes} onChange={(event) => setEquipmentForm({ ...equipmentForm, notes: event.target.value })} />
              </div>
              <button className="primary-button" type="submit">Save Equipment Log</button>
            </form>

            <div className="glass-card panel-card">
              <SectionHeader title="Equipment history" subtitle="Recent rig settings" />
              <div className="stack-list">
                {equipment.map((item) => (
                  <article className="list-card" key={item.id}>
                    <div className="list-topline">
                      <strong>{item.gunModel}</strong>
                      <span>{item.date}</span>
                    </div>
                    <p>Hose A/B: {item.hoseTempA}/{item.hoseTempB}F • Drum A/B: {item.drumTempA}/{item.drumTempB}F</p>
                    <small>Pressure A/B: {item.pressureA}/{item.pressureB} psi • {item.notes}</small>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )
      case 'calculator':
        return (
          <section className="content-grid two-column-layout">
            <div className="glass-card panel-card form-card">
              <SectionHeader title="Dial-In calculator" subtitle="Set site conditions and get numbers fast" />
              <div className="slider-block">
                <label>Ambient temp: <strong>{calculator.ambient}F</strong></label>
                <input type="range" min="20" max="100" value={calculator.ambient} onChange={(event) => setCalculator({ ...calculator, ambient: Number(event.target.value) })} />
              </div>
              <div className="slider-block">
                <label>Substrate temp: <strong>{calculator.substrate}F</strong></label>
                <input type="range" min="20" max="120" value={calculator.substrate} onChange={(event) => setCalculator({ ...calculator, substrate: Number(event.target.value) })} />
              </div>
              <div className="slider-block">
                <label>Humidity: <strong>{calculator.humidity}%</strong></label>
                <input type="range" min="10" max="100" value={calculator.humidity} onChange={(event) => setCalculator({ ...calculator, humidity: Number(event.target.value) })} />
              </div>
              <div className="toggle-row">
                <button className={calculator.foamType === 'open' ? 'toggle-button active' : 'toggle-button'} onClick={() => setCalculator({ ...calculator, foamType: 'open' })}>Open cell</button>
                <button className={calculator.foamType === 'closed' ? 'toggle-button active' : 'toggle-button'} onClick={() => setCalculator({ ...calculator, foamType: 'closed' })}>Closed cell</button>
              </div>
            </div>

            <div className="glass-card panel-card dial-results">
              <SectionHeader title="Recommended baseline" subtitle="Adjust after field feedback" />
              <div className="result-grid">
                <ResultCard label="Dew point" value={`${dialIn.dewPoint.toFixed(1)}F`} />
                <ResultCard label="Substrate margin" value={`${dialIn.margin.toFixed(1)}F`} alert={dialIn.margin < 10} />
                <ResultCard label="Suggested hose temp" value={`${dialIn.hoseTemp}F`} />
                <ResultCard label="Suggested drum temp" value={`${dialIn.drumTemp}F`} />
              </div>
              <div className="alerts-list">
                {dialIn.alerts.length ? dialIn.alerts.map((alert) => <div key={alert} className="alert-row">{alert}</div>) : <div className="alert-row safe">Conditions look workable. Verify ratio and spray pattern on a test shot.</div>}
              </div>
            </div>
          </section>
        )
      case 'ai-chat':
        return (
          <section className="content-grid two-column-layout">
            <div className="glass-card panel-card">
              <SectionHeader title="AI expert chat" subtitle="In-app field answers" />
              <div className="quick-prompt-row">
                {['How do I fix sticky foam?', 'Dial in EasySeal for 38F morning', 'What is my current average yield?', 'What causes pull-away?'].map((prompt) => (
                  <button key={prompt} className="quick-prompt" onClick={() => sendChatMessage(prompt)}>{prompt}</button>
                ))}
              </div>
              <div className="chat-window">
                {chatMessages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                    <span>{message.role === 'assistant' ? 'Athena' : 'You'}</span>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input className="glass-input" placeholder="Ask a field question" value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendChatMessage(chatInput)} />
                <button className="primary-button" onClick={() => sendChatMessage(chatInput)}>Send</button>
              </div>
            </div>

            <div className="glass-card panel-card">
              <SectionHeader title="System prompt payload preview" subtitle="Live context for later OpenAI API wiring" />
              <pre className="payload-preview">{JSON.stringify({
                installer: '1 year spraying, 3 years assisting. Primary foam: Enverge EasySeal .5. +25% yield gain vs Ambit.',
                foamDatabase: foamSystems,
                recentJobs: jobs.slice(0, 10),
                recentEquipmentLogs: equipment.slice(0, 5),
              }, null, 2)}</pre>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="app-shell">
      <div className="background-glow glow-left" />
      <div className="background-glow glow-right" />
      <aside className="sidebar glass-card">
        <div className="brand-block">
          <div className="brand-mark">FD</div>
          <div>
            <div className="brand-title">FOAM DIAL</div>
            <p>Field intelligence, dialed in and live.</p>
          </div>
        </div>

        <nav className="nav-stack">
          {sections.map((section) => (
            <button key={section.id} className={activeSection === section.id ? 'nav-item active' : 'nav-item'} onClick={() => setActiveSection(section.id)}>
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer glass-card">
          <p className="eyebrow">Yield watch</p>
          <strong>{avgYield.toLocaleString()} bf/set</strong>
          <small>EasySeal target: 20,000 bf/set</small>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar glass-card">
          <div>
            <p className="eyebrow">Owner operation</p>
            <h2>Enverge EasySeal .5 primary workflow</h2>
          </div>
          <div className="status-strip">
            <span className="status-pill amber">+25% yield vs Ambit</span>
            <span className="status-pill blue">Mobile-first V1</span>
          </div>
        </header>
        {renderSection()}
      </main>

      <nav className="mobile-nav glass-card">
        {sections.map((section) => (
          <button key={section.id} className={activeSection === section.id ? 'mobile-nav-item active' : 'mobile-nav-item'} onClick={() => setActiveSection(section.id)}>
            <span>{section.icon}</span>
            <small>{section.label.split(' ')[0]}</small>
          </button>
        ))}
      </nav>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="section-accent" />
    </div>
  )
}

function StatCard({ label, value, detail, accent }) {
  return (
    <article className={accent ? 'stat-card glass-card accent' : 'stat-card glass-card'}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function ResultCard({ label, value, alert }) {
  return (
    <div className={alert ? 'result-card alert' : 'result-card'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
