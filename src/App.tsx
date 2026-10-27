import { useState } from 'react'

type View = 'home' | 'dashboard' | 'scan' | 'voice' | 'customers' | 'reminders' | 'insights'

const icons: Record<string, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  dashboard: <><rect x="4" y="4" width="6" height="6" rx="2"/><rect x="14" y="4" width="6" height="6" rx="2"/><rect x="4" y="14" width="6" height="6" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2"/></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 9h8M8 13h8M8 17h5"/></>,
  voice: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></>,
  customers: <><circle cx="9" cy="8" r="4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.5a4 4 0 0 1 0 7M18 15a6 6 0 0 1 3.5 5"/></>,
  reminders: <><path d="M20 15a3 3 0 0 1-3 3H8l-5 3V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"/><path d="M8 9h8M8 13h5"/></>,
  insights: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  arrow: <><path d="m9 18 6-6-6-6"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{icons[name]}</svg>
}

const customers = [
  { name: 'Musa Abdullahi', initials: 'MA', balance: '₦2,000', status: 'Due today', color: '#e9a23b' },
  { name: 'Chioma Okafor', initials: 'CO', balance: '₦18,500', status: '12 days overdue', color: '#d5685d' },
  { name: 'Tunde Ajayi', initials: 'TA', balance: '₦0', status: 'Fully paid', color: '#3d9474' },
  { name: 'Aisha Bello', initials: 'AB', balance: '₦7,200', status: 'Due Friday', color: '#7d6bb2' },
]

const transactions = [
  { name: 'Musa Abdullahi', item: '2 bags of rice', amount: '₦68,000', type: 'Sale', time: '10:42 AM', initials: 'MA' },
  { name: 'Tunde Ajayi', item: 'Debt repayment', amount: '+₦12,500', type: 'Payment', time: '9:18 AM', initials: 'TA' },
  { name: 'Aisha Bello', item: 'Fabric & delivery', amount: '₦24,700', type: 'Sale', time: 'Yesterday', initials: 'AB' },
  { name: 'Chioma Okafor', item: 'Debt repayment', amount: '+₦5,000', type: 'Payment', time: 'Yesterday', initials: 'CO' },
]

function Logo() {
  return <div className="logo"><span className="logo-mark">S</span><span>SabiLedger</span></div>
}

function Landing({ enter }: { enter: () => void }) {
  return <main className="landing">
    <nav className="land-nav"><Logo/><div className="nav-links"><a href="#how">How it works</a><a href="#features">Features</a><button className="btn ghost" onClick={enter}>Sign in</button><button className="btn primary" onClick={enter}>Get started <Icon name="arrow" size={16}/></button></div></nav>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span>✦</span> Built for the way you do business</div>
        <h1>Turn messy notes into a <em>smarter business.</em></h1>
        <p>SabiLedger uses AI to turn handwritten records and voice notes into clear sales, debts, and customer insights — in seconds.</p>
        <div className="hero-actions"><button className="btn primary big" onClick={enter}>Get started free <Icon name="arrow"/></button><button className="btn outline big" onClick={() => document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' })}><span className="play">▶</span> See how it works</button></div>
        <div className="trusted"><span className="trust-icon"><Icon name="check" size={16}/></span><p><b>Your records stay yours</b><br/>Review every AI entry before it reaches your ledger.</p></div>
      </div>
      <div className="hero-visual">
        <div className="float-card sales-float"><span>This week</span><b>₦284,500</b><small>↗ 18.4% from last week</small></div>
        <div className="phone">
          <div className="phone-top"><span>9:41</span><i></i><span>•••</span></div>
          <div className="phone-head"><Logo/><span className="avatar">AO</span></div>
          <p className="muted">Good morning, Amaka</p><h3>Here’s your business today.</h3>
          <div className="phone-balance"><span>Total sales · May</span><strong>₦842,500</strong><small>↑ 12.5% this month</small></div>
          <div className="quick-grid"><button><Icon name="scan"/><span>Scan note</span></button><button><Icon name="voice"/><span>Speak sale</span></button></div>
          <div className="mini-row"><b>Recent activity</b><span>See all</span></div>
          {transactions.slice(0,3).map(t=><div className="phone-tx" key={t.name}><span className="avatar small">{t.initials}</span><div><b>{t.name}</b><small>{t.item}</small></div><strong>{t.amount}</strong></div>)}
        </div>
        <div className="float-card ai-float"><span className="spark">✦</span><div><b>AI record captured</b><small>Musa paid ₦5,000</small></div><span className="tick">✓</span></div>
        <div className="dots"></div>
      </div>
    </section>
    <section className="how" id="how"><div className="section-title"><span>FROM NOTEBOOK TO LEDGER</span><h2>Four clear steps. You stay in control.</h2><p>SabiLedger organizes the records you already keep, then asks you to approve them before anything changes.</p></div><div className="workflow" aria-label="How SabiLedger turns handwritten notes into ledger entries">
      <article><span className="step-num">01</span><div className="workflow-visual note-mini"><b>Sales — 27/5</b><p>Musa - 2 rice<br/>68,000 / paid 50k</p><p>Chioma - fabric<br/>24,500</p></div><h3>Capture your notebook</h3><p>Take a clear photo of the page. No new process to learn.</p></article>
      <span className="flow-arrow"><Icon name="arrow" size={18}/></span>
      <article><span className="step-num">02</span><div className="workflow-visual extract-mini"><div><span>Musa Abdullahi</span><b>₦68,000</b></div><div className="needs-check"><span>Chioma Okafor</span><b>Check spelling</b></div><div><span>27 May 2024</span><b>3 entries</b></div></div><h3>AI structures each entry</h3><p>Names, dates, items, and amounts become editable transactions.</p></article>
      <span className="flow-arrow"><Icon name="arrow" size={18}/></span>
      <article><span className="step-num">03</span><div className="workflow-visual confirm-mini"><span className="confirm-check"><Icon name="check" size={22}/></span><b>Review complete</b><small>3 transactions ready</small><button>Confirm & save</button></div><h3>Review and confirm</h3><p>Uncertain details are highlighted, so you always make the final call.</p></article>
      <span className="flow-arrow"><Icon name="arrow" size={18}/></span>
      <article><span className="step-num">04</span><div className="workflow-visual ledger-mini"><div><span className="avatar small">MA</span><p><b>Musa Abdullahi</b><small>Balance updated</small></p><strong>₦18,000</strong></div><div><span className="avatar small">CO</span><p><b>Chioma Okafor</b><small>New sale added</small></p><strong>₦14,500</strong></div></div><h3>Your ledger updates</h3><p>Balances, sales, and follow-ups stay organized automatically.</p></article>
    </div></section>
  </main>
}

function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const nav: [View, string, string][] = [['dashboard','dashboard','Overview'],['scan','scan','Notebook scanner'],['voice','voice','Voice assistant'],['customers','customers','Customers'],['reminders','reminders','Reminders'],['insights','insights','Insights']]
  return <aside className="sidebar"><Logo/><div className="shop"><span className="avatar">AO</span><div><b>Amaka’s Store</b><small>Business account</small></div><Icon name="arrow" size={15}/></div><nav>{nav.map(([id,icon,label])=><button key={id} className={view===id?'active':''} onClick={()=>setView(id)}><Icon name={icon}/><span>{label}</span>{id==='reminders'&&<i>3</i>}</button>)}</nav><div className="sidebar-foot"><div className="pro-card"><span>✦</span><b>Grow with Sabi Pro</b><small>Unlock advanced reports and unlimited scans.</small><button>View plans</button></div><button className="profile"><span className="avatar">AO</span><div><b>Amaka Okorie</b><small>amaka@store.ng</small></div></button></div></aside>
}

function AppHeader({ title }: { title: string }) {
  return <header className="app-header"><div><p>Tuesday, 28 May</p><h1>{title}</h1></div><div className="header-actions"><label className="search"><Icon name="search" size={18}/><input placeholder="Search anything..."/></label><button className="icon-btn"><Icon name="bell"/><i></i></button><span className="avatar">AO</span></div></header>
}

function Stat({ label, value, change, tone, icon }: {label:string;value:string;change:string;tone:string;icon:string}) {
  return <article className="stat"><div className={`stat-icon ${tone}`}><Icon name={icon}/></div><div className="stat-label">{label}<button>•••</button></div><strong>{value}</strong><small className={change.startsWith('↑')?'up':''}>{change}</small></article>
}

function Dashboard({ setView }: { setView:(v:View)=>void }) {
  return <><AppHeader title="Good morning, Amaka"/><div className="content">
    <section className="welcome"><div><span className="eyebrow">YOUR BUSINESS TODAY</span><h2>Everything is looking good.</h2><p>You’ve collected 68% of this week’s outstanding debts.</p></div><div className="welcome-actions"><button className="btn outline" onClick={()=>setView('scan')}><Icon name="scan"/> Scan notebook</button><button className="btn primary" onClick={()=>setView('voice')}><Icon name="plus"/> Record sale</button></div></section>
    <div className="stats"><Stat label="Total sales" value="₦842,500" change="↑ 12.5% this month" tone="green" icon="insights"/><Stat label="Outstanding debts" value="₦127,200" change="₦38,000 due this week" tone="amber" icon="reminders"/><Stat label="Payments received" value="₦318,400" change="↑ 8.2% this month" tone="mint" icon="check"/><Stat label="Active customers" value="86" change="+7 new this month" tone="purple" icon="customers"/></div>
    <div className="dash-grid"><section className="panel chart-panel"><div className="panel-head"><div><h3>Sales overview</h3><p>Your sales performance over time</p></div><select><option>Last 7 days</option><option>This month</option></select></div><div className="chart-wrap"><div className="y-axis"><span>₦100k</span><span>₦75k</span><span>₦50k</span><span>₦25k</span><span>₦0</span></div><div className="chart"><div className="grid-lines"></div><svg viewBox="0 0 700 220" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#167a58" stopOpacity=".24"/><stop offset="1" stopColor="#167a58" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 180 C70 155 80 165 140 112 S235 145 290 98 S370 80 430 115 S520 75 570 85 S640 35 700 48 L700 220 L0 220Z"/><path className="line" d="M0 180 C70 155 80 165 140 112 S235 145 290 98 S370 80 430 115 S520 75 570 85 S640 35 700 48"/></svg><div className="x-axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div></section>
      <section className="panel debt-panel"><div className="panel-head"><div><h3>Debt collection</h3><p>This week</p></div><button onClick={()=>setView('customers')}>View all</button></div><div className="donut"><div><strong>68%</strong><span>collected</span></div></div><div className="debt-legend"><div><i></i><span>Collected</span><b>₦82,400</b></div><div><i></i><span>Outstanding</span><b>₦38,000</b></div></div></section>
    </div>
    <section className="panel transactions"><div className="panel-head"><div><h3>Recent transactions</h3><p>Your latest sales and payments</p></div><button>View all <Icon name="arrow" size={15}/></button></div>{transactions.map(t=><div className="transaction" key={t.name}><span className="avatar soft">{t.initials}</span><div className="tx-person"><b>{t.name}</b><small>{t.item}</small></div><span className={`tag ${t.type.toLowerCase()}`}>{t.type}</span><small>{t.time}</small><strong className={t.amount.startsWith('+')?'positive':''}>{t.amount}</strong></div>)}</section>
  </div></>
}

function Scanner() {
  const [saved,setSaved]=useState(false)
  return <><AppHeader title="Notebook scanner"/><div className="content"><div className="page-intro"><div><h2>Turn handwriting into records</h2><p>Upload a notebook photo and let Sabi AI organize the details.</p></div><button className="btn outline"><Icon name="scan"/> Upload another</button></div>
    {saved?<div className="success-state"><span><Icon name="check" size={36}/></span><h2>4 transactions saved</h2><p>Your ledger and customer balances have been updated.</p><button className="btn primary" onClick={()=>setSaved(false)}>Scan another page</button></div>:
    <div className="scanner-grid"><section className="panel note-preview"><div className="panel-head"><div><h3>Uploaded page</h3><p>IMG_2038.jpg · 2.4 MB</p></div><span className="tag payment">AI processed</span></div><div className="paper"><div className="paper-title">Sales — 27/5</div><p>1. Musa - 2 rice 68,000<br/>paid 50k, balance 18k</p><p>2. Chioma - fabrics 24,500<br/>paid 10,000</p><p>3. Tunde paid old debt 12,500</p><p>4. Aisha - delivery 7,200 owing</p></div></section>
    <section className="panel extracted"><div className="panel-head"><div><h3>Review extracted records</h3><p>Confirm the highlighted entry before saving</p></div><span className="ai-badge">✦ 94% confident</span></div>{[
      ['Musa Abdullahi','27 May 2024','2 bags of rice','₦68,000'],
      ['Chioma Okafor','27 May 2024','Ankara fabrics','₦24,500'],
      ['Tunde Ajayi','27 May 2024','Debt repayment','₦12,500'],
      ['Aisha Bello','27 May 2024','Delivery','₦7,200'],
    ].map((r,i)=><div className={`extract-row ${i===1?'uncertain':''}`} key={r[0]}>{i===1&&<span className="uncertain-label">Check spelling</span>}<label>Name<input defaultValue={r[0]}/></label><label>Date<input defaultValue={r[1]}/></label><label>Item<input defaultValue={r[2]}/></label><label>Amount<input defaultValue={r[3]}/></label></div>)}<div className="confirm-box"><input type="checkbox" id="confirm"/><label htmlFor="confirm">I’ve reviewed the extracted entries and they are correct.</label></div><button className="btn primary full" onClick={()=>setSaved(true)}><Icon name="check"/> Confirm & save 4 transactions</button></section></div>}</div></>
}

function Voice() {
  const [recording,setRecording]=useState(false); const [confirmed,setConfirmed]=useState(false)
  return <><AppHeader title="Voice assistant"/><div className="content voice-page"><div className="page-intro"><div><h2>Just say it naturally</h2><p>Record sales and payments in your own words. Sabi understands.</p></div></div><section className="voice-card">
    <div className="language">English (Nigeria) <span>⌄</span></div><div className={`orb ${recording?'recording':''}`}><button onClick={()=>{setRecording(!recording);setConfirmed(false)}}><Icon name={recording?'check':'voice'} size={34}/></button>{recording&&[1,2,3].map(x=><i key={x}/>)}</div><h2>{recording?'Listening...':'Tap to speak'}</h2><p>{recording?'Speak clearly. Tap the button when you’re done.':'Record a sale, payment, or customer debt.'}</p>
    <div className="wave">{[18,34,12,42,27,55,31,45,20,38,16,48,28,36,15,30,22,40,18,32].map((h,i)=><i key={i} style={{height:recording?h:4}}/>)}</div>
    <div className="transcript"><span>TRANSCRIPTION</span><p>“Musa paid <mark>₦5,000</mark>; he still owes <mark>₦2,000</mark>.”</p></div>
    <div className="voice-result"><div className="result-head"><span>✦ Transaction preview</span><small>AI extracted</small></div><div className="result-grid"><label>Customer<b>Musa Abdullahi</b></label><label>Payment received<b>₦5,000</b></label><label>Remaining balance<b className="red">₦2,000</b></label><label>Type<b>Debt repayment</b></label></div></div>
    <button className="btn primary full" onClick={()=>setConfirmed(true)}><Icon name="check"/> {confirmed?'Transaction saved':'Confirm transaction'}</button>
  </section></div></>
}

function Customers() {
  const [selected,setSelected]=useState(0)
  return <><AppHeader title="Customer ledger"/><div className="content"><div className="page-intro"><div><h2>Your customers</h2><p>Track balances, sales, and repayment history in one place.</p></div><button className="btn primary"><Icon name="plus"/> Add customer</button></div><div className="customer-layout"><section className="panel customer-list"><label className="search"><Icon name="search" size={17}/><input placeholder="Search customers"/></label>{customers.map((c,i)=><button className={selected===i?'selected':''} onClick={()=>setSelected(i)} key={c.name}><span className="avatar soft">{c.initials}</span><div><b>{c.name}</b><small>{c.status}</small></div><strong>{c.balance}</strong></button>)}</section><section className="panel customer-detail"><div className="customer-hero"><span className="avatar large">{customers[selected].initials}</span><div><h2>{customers[selected].name}</h2><p>Customer since February 2024 · 14 transactions</p></div><button className="btn outline">Send reminder</button><button className="btn primary">Record payment</button></div><div className="customer-stats"><div><span>Outstanding balance</span><b>{customers[selected].balance}</b></div><div><span>Total purchases</span><b>₦184,500</b></div><div><span>Total repaid</span><b>₦166,000</b></div></div><h3>Repayment history</h3>{transactions.slice(0,3).map((t,i)=><div className="history" key={i}><span className="history-icon"><Icon name="check" size={16}/></span><div><b>{i===1?'Purchase on credit':'Payment received'}</b><small>{i===0?'Today, 9:18 AM':`${18-i*4} May 2024`}</small></div><strong className={i===1?'':'positive'}>{i===1?'₦18,000':'+₦5,000'}</strong></div>)}</section></div></div></>
}

function Reminders() {
  const [sent,setSent]=useState(false)
  return <><AppHeader title="Payment reminders"/><div className="content"><div className="page-intro"><div><h2>Friendly follow-ups, right on time</h2><p>Send clear WhatsApp reminders and professional receipts.</p></div></div><div className="reminder-grid"><section className="panel reminder-compose"><div className="panel-head"><div><h3>Message preview</h3><p>To Musa Abdullahi · +234 803 555 0142</p></div><span className={`tag ${sent?'payment':'sale'}`}>{sent?'Sent':'Draft'}</span></div><div className="whatsapp"><div className="wa-top"><span className="avatar small">MA</span><div><b>Musa Abdullahi</b><small>online</small></div></div><div className="wa-chat"><div className="wa-day">TODAY</div><div className="wa-message">Hello Musa, this is a friendly reminder from <b>Amaka’s Store</b>. Your outstanding balance is <b>₦2,000</b>.<br/><br/>Please pay at your convenience. Thank you for your business!<span>10:42 ✓✓</span></div></div></div><textarea defaultValue="Hello Musa, this is a friendly reminder from Amaka’s Store. Your outstanding balance is ₦2,000. Please pay at your convenience. Thank you for your business!"/><div className="reminder-actions"><button className="btn outline">Preview receipt</button><button className="btn whatsapp-btn" onClick={()=>setSent(true)}>{sent?<Icon name="check"/>:<Icon name="reminders"/>} {sent?'Sent on WhatsApp':'Send on WhatsApp'}</button></div></section><section className="panel queue"><div className="panel-head"><div><h3>Follow-up queue</h3><p>3 customers need attention</p></div></div>{customers.slice(0,3).map((c,i)=><div className="queue-row" key={c.name}><span className="avatar soft">{c.initials}</span><div><b>{c.name}</b><small>{i===0?'Draft ready':c.status}</small></div><strong>{c.balance}</strong><span className={`status-dot ${i===0?'draft':'sent'}`}>{i===0?'Draft':'Sent'}</span></div>)}</section></div></div></>
}

function Insights() {
  return <><AppHeader title="Business insights"/><div className="content"><div className="page-intro"><div><h2>Know what needs your attention</h2><p>AI-powered insights from your sales and collections.</p></div><select className="period"><option>Last 30 days</option></select></div><div className="insight-cards"><article className="insight-alert"><span className="stat-icon amber"><Icon name="bell"/></span><div><small>NEEDS ATTENTION</small><h3>₦38,000 is overdue</h3><p>Across 4 customers. Chioma’s balance is 12 days late.</p></div><button>Review debts <Icon name="arrow" size={15}/></button></article><article className="insight-alert positive-card"><span className="stat-icon green"><Icon name="insights"/></span><div><small>WEEKLY HIGHLIGHT</small><h3>Sales are up 18.4%</h3><p>Saturday was your strongest day with ₦94,500 in sales.</p></div><button>View report <Icon name="arrow" size={15}/></button></article></div><div className="dash-grid"><section className="panel bar-panel"><div className="panel-head"><div><h3>Weekly sales</h3><p>₦284,500 total this week</p></div></div><div className="bars">{[42,58,46,72,64,94,78].map((h,i)=><div key={i}><span style={{height:`${h}%`}} className={i===5?'hot':''}><i>₦{h}k</i></span><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small></div>)}</div></section><section className="panel followups"><div className="panel-head"><div><h3>Customers to follow up</h3><p>Prioritized by Sabi AI</p></div></div>{customers.slice(0,3).map((c,i)=><div key={c.name}><span className="avatar soft">{c.initials}</span><p><b>{c.name}</b><small>{c.status}</small></p><strong>{c.balance}</strong><button>Remind</button></div>)}</section></div></div></>
}

export default function App() {
  const [view,setView]=useState<View>('home')
  if(view==='home') return <Landing enter={()=>setView('dashboard')}/>
  const pages = { dashboard:<Dashboard setView={setView}/>, scan:<Scanner/>, voice:<Voice/>, customers:<Customers/>, reminders:<Reminders/>, insights:<Insights/> }
  return <div className="app-shell"><Sidebar view={view} setView={setView}/><main className="app-main">{pages[view as keyof typeof pages]}<nav className="mobile-nav">{(['dashboard','scan','voice','customers','insights'] as View[]).map(v=><button className={view===v?'active':''} onClick={()=>setView(v)} key={v}><Icon name={v}/><span>{v==='dashboard'?'Home':v}</span></button>)}</nav></main></div>
}
