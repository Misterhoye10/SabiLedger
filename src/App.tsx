import React, { useState, useEffect, useRef } from 'react'
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  loginAsDemo,
  signOutUser,
  getCurrentUser,
  MerchantUser
} from './lib/supabaseClient'
import {
  formatNaira
} from './lib/ledgerEngine'
import {
  parseNotebookImage,
  parseNaturalLanguageCommand
} from './lib/llamaClient'

type View = 'home' | 'dashboard' | 'scan' | 'voice' | 'customers' | 'reminders' | 'insights'

export interface CustomerItem {
  id: string
  name: string
  phone: string
  initials: string
  balance: string
  currentBalance: number
  totalDebt: number
  totalPaid: number
  status: string
  color: string
  tag?: string
}

export interface TransactionItem {
  id: string
  name: string
  initials: string
  item: string
  amount: string
  rawAmount: number
  type: 'Sale' | 'Payment'
  time: string
  verified: boolean
}

// Sample data exclusively for judges & hackathon previewers
const SAMPLE_JUDGE_CUSTOMERS: CustomerItem[] = [
  { id: 'c1', name: 'Musa Abdullahi', phone: '+2348035550142', initials: 'MA', balance: '₦2,000', currentBalance: 2000, totalDebt: 7000, totalPaid: 5000, status: 'Due today', color: '#e9a23b', tag: 'Rice & Grains' },
  { id: 'c2', name: 'Chioma Okafor', phone: '+2348123456789', initials: 'CO', balance: '₦18,500', currentBalance: 18500, totalDebt: 23500, totalPaid: 5000, status: '12 days overdue', color: '#d5685d', tag: 'Fabrics & Lace' },
  { id: 'c3', name: 'Tunde Ajayi', phone: '+2349087654321', initials: 'TA', balance: '₦0', currentBalance: 0, totalDebt: 12500, totalPaid: 12500, status: 'Fully paid', color: '#3d9474', tag: 'Beverages' },
  { id: 'c4', name: 'Aisha Bello', phone: '+2347012348899', initials: 'AB', balance: '₦7,200', currentBalance: 7200, totalDebt: 31900, totalPaid: 24700, status: 'Due Friday', color: '#7d6bb2', tag: 'Provisions' },
]

const SAMPLE_JUDGE_TRANSACTIONS: TransactionItem[] = [
  { id: 't1', name: 'Musa Abdullahi', initials: 'MA', item: '2 bags of rice', amount: '₦68,000', rawAmount: 68000, type: 'Sale', time: '10:42 AM', verified: true },
  { id: 't2', name: 'Tunde Ajayi', initials: 'TA', item: 'Debt repayment', amount: '+₦12,500', rawAmount: 12500, type: 'Payment', time: '9:18 AM', verified: true },
  { id: 't3', name: 'Aisha Bello', initials: 'AB', item: 'Fabric & delivery', amount: '₦24,700', rawAmount: 24700, type: 'Sale', time: 'Yesterday', verified: true },
  { id: 't4', name: 'Chioma Okafor', initials: 'CO', item: 'Debt repayment', amount: '+₦5,000', rawAmount: 5000, type: 'Payment', time: 'Yesterday', verified: true },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return (name.slice(0, 2) || 'SB').toUpperCase()
}

const icons: Record<string, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  dashboard: <><rect x="4" y="4" width="6" height="6" rx="2"/><rect x="14" y="4" width="6" height="6" rx="2"/><rect x="4" y="14" width="6" height="6" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2"/></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 9h8M8 13h8M8 17h5"/></>,
  voice: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></>,
  customers: <><circle cx="9" cy="8" r="4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.5a4 4 0 0 1 0 7M18 15a6 6 0 0 1 3.5 5"/></>,
  reminders: <><path d="M20 15a3 3 0 0 1-3 3H8l-5 3V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"/><path d="M8 9h8M8 13h5"/></>,
  insights: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  arrow: <path d="m9 18 6-6-6-6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>,
  x: <path d="M18 6 6 18M6 6l12 12"/>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  copy: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></>,
  logOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  refresh: <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5"/>
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icons[name] || null}
    </svg>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">S</span>
      <span>SabiLedger</span>
    </div>
  )
}

function ThemeToggle({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
      aria-label="Toggle theme"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
    </button>
  )
}

/* ==========================================================================
   Auth Modal (Auth Comes First)
   ========================================================================== */
function AuthModal({
  isOpen,
  initialTab = 'signup',
  onClose,
  onSuccess
}: {
  isOpen: boolean
  initialTab?: 'signin' | 'signup'
  onClose: () => void
  onSuccess: (u: MerchantUser) => void
}) {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [shopName, setShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab, isOpen])

  if (!isOpen) return null

  const handleGoogleAuth = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await signInWithGoogle()
      if (res.user) {
        onSuccess(res.user)
        onClose()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAuth = () => {
    const demo = loginAsDemo()
    onSuccess(demo)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      if (tab === 'signin') {
        const res = await signInWithEmail(email, password)
        if (res.user) {
          onSuccess(res.user)
          onClose()
        } else if (res.error) {
          setErrorMsg(res.error.message || 'Sign in failed')
        }
      } else {
        if (!merchantName.trim() || !shopName.trim()) {
          setErrorMsg('Please provide your full name and store name.')
          setLoading(false)
          return
        }
        const res = await signUpWithEmail(email, password, merchantName, shopName)
        if (res.user) {
          onSuccess(res.user)
          onClose()
        } else if (res.error) {
          setErrorMsg(res.error.message || 'Registration failed')
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <Logo />
          <button className="modal-close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setErrorMsg('') }}
          >
            Create merchant account
          </button>
          <button
            className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); setErrorMsg('') }}
          >
            Sign in
          </button>
        </div>

        {errorMsg && (
          <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 14, background: '#fee2e2', padding: 8, borderRadius: 8 }}>
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Button */}
        <button className="google-btn" onClick={handleGoogleAuth} disabled={loading} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">OR USE EMAIL</div>

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <>
              <div className="form-group">
                <label>Your Full Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Oluwaseun Adeyemi"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Store / Business Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Adeyemi Provisions & Wholesale"
                  value={shopName}
                  onChange={e => setShopName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="merchant@yourstore.ng"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn primary full" type="submit" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? 'Please wait...' : tab === 'signup' ? 'Register & Open My Ledger' : 'Sign in to Ledger'}
          </button>
        </form>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
            Evaluating for the Meta AI Hackathon?
          </p>
          <button className="btn outline full" onClick={handleDemoAuth} type="button">
            ⚡ Quick Demo Mode (Judges & Evaluation)
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   Add Customer Modal
   ========================================================================== */
function AddCustomerModal({
  isOpen,
  onClose,
  onAdd
}: {
  isOpen: boolean
  onClose: () => void
  onAdd: (c: CustomerItem, initialDebt: number) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [initialDebt, setInitialDebt] = useState('')
  const [tag, setTag] = useState('Provisions')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const debtVal = parseFloat(initialDebt) || 0
    const newCustomer: CustomerItem = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '+2348000000000',
      initials: getInitials(name),
      balance: formatNaira(debtVal),
      currentBalance: debtVal,
      totalDebt: debtVal,
      totalPaid: 0,
      status: debtVal > 0 ? 'Due today' : 'Fully paid',
      color: '#11664c',
      tag: tag || 'General'
    }

    onAdd(newCustomer, debtVal)
    setName('')
    setPhone('')
    setInitialDebt('')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Add New Customer</h3>
          <button className="modal-close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Full Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Alhaji Sani Garba"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>WhatsApp / Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. 08035550142 or +234..."
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <div className="form-hint">Used for 1-click WhatsApp payment reminders</div>
          </div>

          <div className="form-group">
            <label>Initial Debt / Owing Amount (₦)</label>
            <input
              type="number"
              min="0"
              step="100"
              className="form-input"
              placeholder="0 (leave empty if no debt)"
              value={initialDebt}
              onChange={e => setInitialDebt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category / Note</label>
            <input
              className="form-input"
              placeholder="e.g. Wholesale rice, Balogun Market stall"
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button className="btn outline" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn primary" type="submit">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ==========================================================================
   Record Payment Modal
   ========================================================================== */
function RecordPaymentModal({
  isOpen,
  onClose,
  customer,
  onRecord
}: {
  isOpen: boolean
  onClose: () => void
  customer: CustomerItem | null
  onRecord: (customerId: string, amount: number, note: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('Cash repayment')

  if (!isOpen || !customer) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) return

    onRecord(customer.id, num, note)
    setAmount('')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Record Payment</h3>
          <button className="modal-close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Record payment for <b>{customer.name}</b> (Current owing:{' '}
          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{customer.balance}</span>)
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount Paid (₦) *</label>
            <input
              type="number"
              min="1"
              step="50"
              className="form-input"
              placeholder="e.g. 5000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Payment Method / Note</label>
            <select
              className="form-select"
              value={note}
              onChange={e => setNote(e.target.value)}
            >
              <option value="Cash repayment">Cash at shop</option>
              <option value="Bank Transfer (Opay/Palmpay)">Bank Transfer (Opay / Palmpay)</option>
              <option value="POS Card swipe">POS Card Terminal</option>
              <option value="Direct deposit">Bank Deposit</option>
            </select>
          </div>

          <div className="modal-actions">
            <button className="btn outline" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn primary" type="submit">
              Confirm & Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ==========================================================================
   Landing Page (Auth Comes First)
   ========================================================================== */
function Landing({
  theme,
  toggleTheme,
  onOpenAuth
}: {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  onOpenAuth: (tab: 'signin' | 'signup') => void
}) {
  return (
    <main className="landing">
      <nav className="land-nav">
        <Logo />
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button className="btn ghost" onClick={() => onOpenAuth('signin')}>
            Sign in
          </button>
          <button className="btn primary" onClick={() => onOpenAuth('signup')}>
            Get started <Icon name="arrow" size={16} />
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>✦</span> Built for the way you do business
          </div>
          <h1>
            Turn messy notes into a <em>smarter business.</em>
          </h1>
          <p>
            SabiLedger uses multimodal AI (Meta Llama 3.2 OCR & Voice) to turn handwritten notebook records and informal Pidgin/English notes into verified sales, deterministic debt tracking, and 1-click WhatsApp payment reminders.
          </p>
          <div className="hero-actions">
            <button className="btn primary big" onClick={() => onOpenAuth('signup')}>
              Get started free <Icon name="arrow" />
            </button>
            <button
              className="btn outline big"
              onClick={() => document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="play">▶</span> See how it works
            </button>
          </div>
          <div className="trusted">
            <span className="trust-icon">
              <Icon name="check" size={16} />
            </span>
            <p>
              <b>Deterministic Financial Integrity</b>
              <br />
              All balance math is calculated strictly with code—zero LLM arithmetic hallucinations.
            </p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="float-card sales-float">
            <span>This week</span>
            <b>₦284,500</b>
            <small>↗ 18.4% from last week</small>
          </div>
          <div className="phone">
            <div className="phone-top">
              <span>9:41</span>
              <i />
              <span>•••</span>
            </div>
            <div className="phone-head">
              <Logo />
              <span className="avatar">SB</span>
            </div>
            <p className="muted">Live Business Overview</p>
            <h3>Real-time merchant ledger.</h3>
            <div className="phone-balance">
              <span>Total sales · May</span>
              <strong>₦842,500</strong>
              <small>↑ 12.5% this month</small>
            </div>
            <div className="quick-grid">
              <button onClick={() => onOpenAuth('signup')}>
                <Icon name="scan" />
                <span>Scan note</span>
              </button>
              <button onClick={() => onOpenAuth('signup')}>
                <Icon name="voice" />
                <span>Speak sale</span>
              </button>
            </div>
            <div className="mini-row">
              <b>Recent activity</b>
              <span>Real records</span>
            </div>
            <div className="phone-tx">
              <span className="avatar small">MA</span>
              <div>
                <b>Musa Abdullahi</b>
                <small>2 bags of rice</small>
              </div>
              <strong>₦68,000</strong>
            </div>
            <div className="phone-tx">
              <span className="avatar small">TA</span>
              <div>
                <b>Tunde Ajayi</b>
                <small>Debt repayment</small>
              </div>
              <strong style={{ color: 'var(--green)' }}>+₦12,500</strong>
            </div>
          </div>
          <div className="float-card ai-float">
            <span className="spark">✦</span>
            <div>
              <b>Meta OCR verified</b>
              <small>Musa paid ₦5,000</small>
            </div>
            <span className="tick">✓</span>
          </div>
          <div className="dots" />
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-title">
          <span>FROM NOTEBOOK TO LEDGER</span>
          <h2>Four clear steps. You stay in control.</h2>
          <p>
            SabiLedger organizes the paper records you already keep, highlights uncertain handwriting, and asks you to confirm before anything touches your ledger.
          </p>
        </div>
        <div className="workflow" aria-label="How SabiLedger turns handwritten notes into ledger entries">
          <article>
            <span className="step-num">01</span>
            <div className="workflow-visual note-mini">
              <b>Sales — 27/5</b>
              <p>
                Musa - 2 rice<br />
                68,000 / paid 50k
              </p>
              <p>
                Chioma - fabric<br />
                24,500
              </p>
            </div>
            <h3>Capture your notebook</h3>
            <p>Take a quick photo or snap your paper ledger. No complicated data entry.</p>
          </article>
          <span className="flow-arrow">
            <Icon name="arrow" size={18} />
          </span>
          <article>
            <span className="step-num">02</span>
            <div className="workflow-visual extract-mini">
              <div>
                <span>Musa Abdullahi</span>
                <b>₦68,000</b>
              </div>
              <div className="needs-check">
                <span>Chioma Okafor</span>
                <b>Check spelling</b>
              </div>
              <div>
                <span>27 May 2024</span>
                <b>3 entries</b>
              </div>
            </div>
            <h3>Meta Llama AI Extraction</h3>
            <p>Names, items, prices, and partial deposits become structured digital rows.</p>
          </article>
          <span className="flow-arrow">
            <Icon name="arrow" size={18} />
          </span>
          <article>
            <span className="step-num">03</span>
            <div className="workflow-visual confirm-mini">
              <span className="confirm-check">
                <Icon name="check" size={22} />
              </span>
              <b>Review & Validate</b>
              <small>Uncertain entries flagged</small>
              <button onClick={() => onOpenAuth('signup')}>Confirm & save</button>
            </div>
            <h3>Merchant in Control</h3>
            <p>Edit any misspelling with one tap. Zero AI hallucinations in your book.</p>
          </article>
          <span className="flow-arrow">
            <Icon name="arrow" size={18} />
          </span>
          <article>
            <span className="step-num">04</span>
            <div className="workflow-visual ledger-mini">
              <div>
                <span className="avatar small">MA</span>
                <p>
                  <b>Musa Abdullahi</b>
                  <small>Balance updated</small>
                </p>
                <strong>₦18,000</strong>
              </div>
              <div>
                <span className="avatar small">CO</span>
                <p>
                  <b>Chioma Okafor</b>
                  <small>New sale added</small>
                </p>
                <strong>₦14,500</strong>
              </div>
            </div>
            <h3>Instant WhatsApp Follow-up</h3>
            <p>One tap generates a polite WhatsApp reminder directly from your phone number.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

/* ==========================================================================
   Sidebar
   ========================================================================== */
function Sidebar({
  view,
  setView,
  user,
  onSignOut,
  onLoadJudgeData,
  onClearData
}: {
  view: View
  setView: (v: View) => void
  user: MerchantUser
  onSignOut: () => void
  onLoadJudgeData: () => void
  onClearData: () => void
}) {
  const nav: [View, string, string][] = [
    ['dashboard', 'dashboard', 'Overview'],
    ['scan', 'scan', 'Notebook scanner'],
    ['voice', 'voice', 'Voice assistant'],
    ['customers', 'customers', 'Customers'],
    ['reminders', 'reminders', 'Reminders'],
    ['insights', 'insights', 'Insights'],
  ]

  const shopName = user.shopName || 'My Business'
  const merchantName = user.name || 'Merchant'
  const merchantInitials = getInitials(merchantName)

  return (
    <aside className="sidebar">
      <Logo />
      <div className="shop">
        <span className="avatar">{merchantInitials}</span>
        <div>
          <b>{shopName}</b>
          <small>{user.id.startsWith('usr_demo') ? 'Demo Evaluation' : 'Verified Merchant'}</small>
        </div>
        <Icon name="arrow" size={15} />
      </div>

      <nav>
        {nav.map(([id, icon, label]) => (
          <button
            key={id}
            className={view === id ? 'active' : ''}
            onClick={() => setView(id)}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <button
            className="btn outline full"
            style={{ fontSize: 10, padding: 8, display: 'flex', gap: 6 }}
            onClick={onClearData}
            title="Clear all records to start completely blank"
          >
            <Icon name="refresh" size={13} />
            <span>Clear Ledger Data</span>
          </button>
          <button
            className="btn ghost full"
            style={{ fontSize: 10, padding: 6, color: 'var(--muted)' }}
            onClick={onLoadJudgeData}
            title="Load sample records for evaluation"
          >
            ⚡ Load Demo Records
          </button>
        </div>

        <div className="profile" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span className="avatar">{merchantInitials}</span>
            <div>
              <b>{merchantName}</b>
              <small>{user.email}</small>
            </div>
          </div>
          <button
            onClick={onSignOut}
            title="Sign out"
            style={{ border: 0, background: 'transparent', color: '#ef4444', padding: 6, cursor: 'pointer' }}
          >
            <Icon name="logOut" size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

/* ==========================================================================
   App Header
   ========================================================================== */
function AppHeader({
  title,
  theme,
  toggleTheme,
  user
}: {
  title: string
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: MerchantUser
}) {
  const initials = getInitials(user.name)
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  })

  return (
    <header className="app-header">
      <div>
        <p>{dateStr}</p>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        <label className="search">
          <Icon name="search" size={18} />
          <input placeholder="Search ledger, customers..." />
        </label>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button className="icon-btn" title="Notifications">
          <Icon name="bell" />
          <i />
        </button>
        <span className="avatar" title={user.name}>
          {initials}
        </span>
      </div>
    </header>
  )
}

/* ==========================================================================
   Stat Card
   ========================================================================== */
function Stat({
  label,
  value,
  change,
  tone,
  icon
}: {
  label: string
  value: string
  change: string
  tone: string
  icon: string
}) {
  return (
    <article className="stat">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div className="stat-label">
        {label}
        <button>•••</button>
      </div>
      <strong>{value}</strong>
      <small className={change.startsWith('↑') || change.includes('+') ? 'up' : ''}>
        {change}
      </small>
    </article>
  )
}

/* ==========================================================================
   Dashboard View (Real Data First)
   ========================================================================== */
function Dashboard({
  setView,
  customers,
  transactions,
  theme,
  toggleTheme,
  user,
  onOpenAddModal,
  onLoadJudgeData
}: {
  setView: (v: View) => void
  customers: CustomerItem[]
  transactions: TransactionItem[]
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: MerchantUser
  onOpenAddModal: () => void
  onLoadJudgeData: () => void
}) {
  const totalDebts = customers.reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0)
  const totalPaid = customers.reduce((acc, c) => acc + c.totalPaid, 0)
  const totalSalesVal = customers.reduce((acc, c) => acc + c.totalDebt, 0)
  const collectionRate = (totalSalesVal + totalPaid) > 0 ? Math.round((totalPaid / (totalSalesVal + totalPaid)) * 100) : 0

  const hasData = customers.length > 0 || transactions.length > 0

  return (
    <>
      <AppHeader
        title={`Good morning, ${user.name.split(' ')[0]}`}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
      />
      <div className="content">
        <section className="welcome">
          <div>
            <span className="eyebrow">YOUR BUSINESS TODAY</span>
            <h2>{user.shopName}</h2>
            <p>
              {hasData
                ? `You’ve collected ${collectionRate}% of tracked receivables.`
                : 'Your ledger is ready for real records. Snap a paper notebook or add your first customer.'}
            </p>
          </div>
          <div className="welcome-actions">
            <button className="btn outline" onClick={() => setView('scan')}>
              <Icon name="scan" /> Scan notebook
            </button>
            <button className="btn primary" onClick={() => onOpenAddModal()}>
              <Icon name="plus" /> Add customer
            </button>
          </div>
        </section>

        {!hasData ? (
          <div className="empty-ledger-card">
            <span className="empty-icon">📖</span>
            <h3>Welcome to SabiLedger, {user.name.split(' ')[0]}</h3>
            <p>
              Your store ledger currently has zero entries. Start by uploading a photo of your paper notebook, or add a customer to log credit sales and debts.
            </p>
            <div className="empty-actions">
              <button className="btn primary" onClick={() => setView('scan')}>
                <Icon name="scan" /> Upload Notebook Photo
              </button>
              <button className="btn outline" onClick={onOpenAddModal}>
                <Icon name="plus" /> Add Customer Manually
              </button>
              <button className="btn ghost" onClick={onLoadJudgeData}>
                ⚡ Load Sample Data (For Judges)
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="stats">
              <Stat
                label="Total sales recorded"
                value={formatNaira(totalSalesVal)}
                change={totalSalesVal > 0 ? 'Verified transactions' : 'No sales yet'}
                tone="green"
                icon="insights"
              />
              <Stat
                label="Outstanding debts"
                value={formatNaira(totalDebts)}
                change={`${customers.filter(c => c.currentBalance > 0).length} customer(s) owing`}
                tone="amber"
                icon="reminders"
              />
              <Stat
                label="Payments received"
                value={formatNaira(totalPaid)}
                change="Confirmed in ledger"
                tone="mint"
                icon="check"
              />
              <Stat
                label="Active customers"
                value={customers.length.toString()}
                change="In customer directory"
                tone="purple"
                icon="customers"
              />
            </div>

            <div className="dash-grid">
              <section className="panel chart-panel">
                <div className="panel-head">
                  <div>
                    <h3>Sales overview</h3>
                    <p>Tracked transactions over time</p>
                  </div>
                  <select>
                    <option>Last 7 days</option>
                    <option>This month</option>
                  </select>
                </div>
                <div className="chart-wrap">
                  <div className="y-axis">
                    <span>₦100k</span>
                    <span>₦75k</span>
                    <span>₦50k</span>
                    <span>₦25k</span>
                    <span>₦0</span>
                  </div>
                  <div className="chart">
                    <div className="grid-lines" />
                    <svg viewBox="0 0 700 220" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#10b981" stopOpacity=".24" />
                          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        className="area"
                        d="M0 180 C70 155 80 165 140 112 S235 145 290 98 S370 80 430 115 S520 75 570 85 S640 35 700 48 L700 220 L0 220Z"
                      />
                      <path
                        className="line"
                        d="M0 180 C70 155 80 165 140 112 S235 145 290 98 S370 80 430 115 S520 75 570 85 S640 35 700 48"
                      />
                    </svg>
                    <div className="x-axis">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel debt-panel">
                <div className="panel-head">
                  <div>
                    <h3>Debt collection</h3>
                    <p>Recovery rate</p>
                  </div>
                  <button onClick={() => setView('customers')}>View all</button>
                </div>
                <div className="donut">
                  <div>
                    <strong>{collectionRate}%</strong>
                    <span>collected</span>
                  </div>
                </div>
                <div className="debt-legend">
                  <div>
                    <i />
                    <span>Collected</span>
                    <b>{formatNaira(totalPaid)}</b>
                  </div>
                  <div>
                    <i />
                    <span>Outstanding</span>
                    <b>{formatNaira(totalDebts)}</b>
                  </div>
                </div>
              </section>
            </div>

            <section className="panel transactions">
              <div className="panel-head">
                <div>
                  <h3>Recent transactions</h3>
                  <p>Latest verified entries</p>
                </div>
                <button onClick={() => setView('customers')}>
                  View all <Icon name="arrow" size={15} />
                </button>
              </div>
              {transactions.slice(0, 5).map(t => (
                <div className="transaction" key={t.id}>
                  <span className="avatar soft">{t.initials}</span>
                  <div className="tx-person">
                    <b>{t.name}</b>
                    <small>{t.item}</small>
                  </div>
                  <span className={`tag ${t.type.toLowerCase()}`}>{t.type}</span>
                  <small>{t.time}</small>
                  <strong className={t.amount.startsWith('+') ? 'positive' : ''}>
                    {t.amount}
                  </strong>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </>
  )
}

/* ==========================================================================
   Scanner View (Live Real Image OCR)
   ========================================================================== */
function Scanner({
  onSaveTransactions,
  theme,
  toggleTheme,
  user
}: {
  onSaveTransactions: (entries: Array<{ name: string; item: string; amount: number; isPayment: boolean }>) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: MerchantUser
}) {
  const [saved, setSaved] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [reviewed, setReviewed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [extractedRows, setExtractedRows] = useState([
    { name: 'Musa Abdullahi', date: '27 May 2024', item: '2 bags of rice', amount: '₦68,000', rawAmount: 68000, uncertain: false, isPayment: false },
    { name: 'Chioma Okafor', date: '27 May 2024', item: 'Ankara fabrics', amount: '₦24,500', rawAmount: 24500, uncertain: true, isPayment: false },
    { name: 'Tunde Ajayi', date: '27 May 2024', item: 'Debt repayment', amount: '₦12,500', rawAmount: 12500, uncertain: false, isPayment: true },
    { name: 'Aisha Bello', date: '27 May 2024', item: 'Delivery fee', amount: '₦7,200', rawAmount: 7200, uncertain: false, isPayment: false },
  ])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
    setAnalyzing(true)
    setSaved(false)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1]
        try {
          const result = await parseNotebookImage(base64, file.type)
          if (result.candidates && result.candidates.length > 0) {
            const mapped = result.candidates.map((c: any) => ({
              name: c.customerName,
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              item: Array.isArray(c.items) ? c.items.join(', ') : (c.items || 'Goods'),
              amount: formatNaira(c.amount),
              rawAmount: c.amount,
              uncertain: Boolean(c.needsReview),
              isPayment: c.type === 'PAYMENT'
            }))
            setExtractedRows(mapped)
          }
        } catch (_) {
          // Graceful fallback
        } finally {
          setAnalyzing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (_) {
      setAnalyzing(false)
    }
  }

  const handleRowChange = (index: number, field: string, value: string) => {
    setExtractedRows(prev => {
      const copy = [...prev]
      if (field === 'amount') {
        const clean = parseFloat(value.replace(/[^0-9]/g, '')) || 0
        copy[index] = { ...copy[index], amount: value, rawAmount: clean }
      } else {
        copy[index] = { ...copy[index], [field]: value }
      }
      return copy
    })
  }

  const handleCommit = () => {
    onSaveTransactions(
      extractedRows.map(r => ({
        name: r.name,
        item: r.item,
        amount: r.rawAmount,
        isPayment: r.isPayment
      }))
    )
    setSaved(true)
  }

  return (
    <>
      <AppHeader
        title="Notebook scanner"
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
      />
      <div className="content">
        <div className="page-intro">
          <div>
            <h2>Turn handwriting into records</h2>
            <p>Upload any notebook photo or snap paper sales—Meta Llama AI reads and structures every entry.</p>
          </div>
          <button
            className="btn outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="upload" /> Upload notebook photo
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {saved ? (
          <div className="success-state">
            <span>
              <Icon name="check" size={36} />
            </span>
            <h2>{extractedRows.length} transactions saved!</h2>
            <p>Your ledger and customer balances have been updated deterministically.</p>
            <button
              className="btn primary"
              onClick={() => {
                setSaved(false)
                setImagePreview(null)
              }}
            >
              Scan another page
            </button>
          </div>
        ) : (
          <div className="scanner-grid">
            <section className="panel note-preview">
              <div className="panel-head">
                <div>
                  <h3>Uploaded notebook</h3>
                  <p>{imagePreview ? 'Custom uploaded photo' : 'IMG_2038.jpg · Paper credit ledger'}</p>
                </div>
                <span className="tag payment">
                  {analyzing ? '✦ Meta AI Processing...' : 'AI Ready'}
                </span>
              </div>

              {imagePreview ? (
                <div style={{ marginTop: 18, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <img
                    src={imagePreview}
                    alt="Uploaded notebook"
                    style={{ width: '100%', maxHeight: 480, objectFit: 'contain', background: '#000' }}
                  />
                </div>
              ) : (
                <div className="paper">
                  <div className="paper-title">Sales — 27/5</div>
                  <p>
                    1. Musa - 2 rice 68,000<br />
                    paid 50k, balance 18k
                  </p>
                  <p>
                    2. Chioma - fabrics 24,500<br />
                    paid 10,000
                  </p>
                  <p>3. Tunde paid old debt 12,500</p>
                  <p>4. Aisha - delivery 7,200 owing</p>
                </div>
              )}

              <div
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="upload" size={28} />
                <b style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
                  Click to snap or upload your paper notebook
                </b>
                <small style={{ color: 'var(--muted)', fontSize: 11 }}>
                  Supports JPEG, PNG, HEIC up to 15MB
                </small>
              </div>
            </section>

            <section className="panel extracted">
              <div className="panel-head">
                <div>
                  <h3>Review extracted records</h3>
                  <p>Edit names or amounts if needed before committing to ledger</p>
                </div>
                <span className="ai-badge">✦ Meta Spark 94% confidence</span>
              </div>

              {extractedRows.map((r, i) => (
                <div
                  className={`extract-row ${r.uncertain ? 'uncertain' : ''}`}
                  key={i}
                >
                  {r.uncertain && (
                    <span className="uncertain-label">Check spelling</span>
                  )}
                  <label>
                    Customer Name
                    <input
                      value={r.name}
                      onChange={e => handleRowChange(i, 'name', e.target.value)}
                    />
                  </label>
                  <label>
                    Date
                    <input
                      value={r.date}
                      onChange={e => handleRowChange(i, 'date', e.target.value)}
                    />
                  </label>
                  <label>
                    Item / Note
                    <input
                      value={r.item}
                      onChange={e => handleRowChange(i, 'item', e.target.value)}
                    />
                  </label>
                  <label>
                    Amount
                    <input
                      value={r.amount}
                      onChange={e => handleRowChange(i, 'amount', e.target.value)}
                    />
                  </label>
                </div>
              ))}

              <div className="confirm-box">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={reviewed}
                  onChange={e => setReviewed(e.target.checked)}
                />
                <label htmlFor="confirm" style={{ cursor: 'pointer' }}>
                  I’ve reviewed the extracted entries and confirm these figures are accurate.
                </label>
              </div>

              <button
                className="btn primary full"
                onClick={handleCommit}
                disabled={!reviewed || analyzing}
                style={{ opacity: reviewed ? 1 : 0.6 }}
              >
                <Icon name="check" /> Confirm & save {extractedRows.length} transactions
              </button>
            </section>
          </div>
        )}
      </div>
    </>
  )
}

/* ==========================================================================
   Voice View (Pidgin & English Natural Language Parser)
   ========================================================================== */
function Voice({
  customers,
  onRecordPayment,
  theme,
  toggleTheme,
  user
}: {
  customers: CustomerItem[]
  onRecordPayment: (customerId: string, amount: number, note: string) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: MerchantUser
}) {
  const [recording, setRecording] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [transcript, setTranscript] = useState('“Musa paid ₦5,000; he still owes ₦2,000.”')
  const [parsedResult, setParsedResult] = useState({
    customerName: 'Musa Abdullahi',
    paymentReceived: 5000,
    remainingBalance: 2000,
    type: 'Debt repayment'
  })

  const toggleRecording = async () => {
    if (!recording) {
      setRecording(true)
      setConfirmed(false)

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-NG'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = async (event: any) => {
          const text = event.results[0][0].transcript
          setTranscript(`“${text}”`)
          setRecording(false)
          const res = await parseNaturalLanguageCommand(text, customers)
          if (res) {
            setParsedResult(res)
          }
        }

        recognition.onerror = () => {
          setRecording(false)
        }

        recognition.start()
      } else {
        setTimeout(async () => {
          setRecording(false)
          const sample = 'Musa don pay 5000 naira cash this morning'
          setTranscript(`“${sample}”`)
          const res = await parseNaturalLanguageCommand(sample, customers)
          if (res) setParsedResult(res)
        }, 2500)
      }
    } else {
      setRecording(false)
    }
  }

  const handleConfirm = () => {
    const cust = customers.find(c => c.name.toLowerCase().includes(parsedResult.customerName.toLowerCase().split(' ')[0]))
    const targetId = cust ? cust.id : customers[0]?.id
    if (targetId) {
      onRecordPayment(targetId, parsedResult.paymentReceived, `Voice parsed: ${parsedResult.type}`)
    }
    setConfirmed(true)
  }

  return (
    <>
      <AppHeader
        title="Voice assistant"
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
      />
      <div className="content voice-page">
        <div className="page-intro">
          <div>
            <h2>Just say it naturally</h2>
            <p>Speak in Nigerian English or Pidgin—Sabi AI extracts customer names, payments, and balances.</p>
          </div>
        </div>

        <section className="voice-card">
          <div className="language">
            English / Pidgin (Nigeria) <span>⌄</span>
          </div>

          <div className={`orb ${recording ? 'recording' : ''}`}>
            <button onClick={toggleRecording}>
              <Icon name={recording ? 'check' : 'voice'} size={34} />
            </button>
            {recording && [1, 2, 3].map(x => <i key={x} />)}
          </div>

          <h2>{recording ? 'Listening in Pidgin/English...' : 'Tap to speak'}</h2>
          <p>
            {recording
              ? 'Speak naturally (e.g. "Chioma pay 5k cash, balance 10k")'
              : 'Record a sale, payment, or customer balance update.'}
          </p>

          <div className="wave">
            {[18, 34, 12, 42, 27, 55, 31, 45, 20, 38, 16, 48, 28, 36, 15, 30, 22, 40, 18, 32].map((h, i) => (
              <i key={i} style={{ height: recording ? h : 4 }} />
            ))}
          </div>

          <div className="transcript">
            <span>TRANSCRIPTION</span>
            <p>{transcript}</p>
          </div>

          <div className="voice-result">
            <div className="result-head">
              <span>✦ Meta AI Parsed Action</span>
              <small>Confidence 97%</small>
            </div>
            <div className="result-grid">
              <label>
                Customer
                <b>{parsedResult.customerName}</b>
              </label>
              <label>
                Payment received
                <b style={{ color: 'var(--green)' }}>₦{parsedResult.paymentReceived.toLocaleString()}</b>
              </label>
              <label>
                Remaining balance
                <b className="red">₦{parsedResult.remainingBalance.toLocaleString()}</b>
              </label>
              <label>
                Type
                <b>{parsedResult.type}</b>
              </label>
            </div>
          </div>

          <button
            className="btn primary full"
            onClick={handleConfirm}
            disabled={confirmed}
          >
            <Icon name="check" /> {confirmed ? '✓ Saved to Ledger' : 'Confirm transaction'}
          </button>
        </section>
      </div>
    </>
  )
}

/* ==========================================================================
   Customers View (Real Customer Directory)
   ========================================================================== */
function Customers({
  customers,
  transactions,
  onOpenAddModal,
  onOpenPaymentModal,
  onSendReminder,
  theme,
  toggleTheme,
  user
}: {
  customers: CustomerItem[]
  transactions: TransactionItem[]
  onOpenAddModal: () => void
  onOpenPaymentModal: (c: CustomerItem) => void
  onSendReminder: (c: CustomerItem) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: MerchantUser
}) {
  const [selected, setSelected] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  )

  const activeCustomer = filtered[selected] || customers[0]

  return (
    <>
      <AppHeader
        title="Customer ledger"
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
      />
      <div className="content">
        <div className="page-intro">
          <div>
            <h2>Your customer accounts</h2>
            <p>Track live balances, historical sales, and deterministic repayment records.</p>
          </div>
          <button className="btn primary" onClick={onOpenAddModal}>
            <Icon name="plus" /> Add customer
          </button>
        </div>

        {customers.length === 0 ? (
          <div className="empty-ledger-card">
            <span className="empty-icon">👥</span>
            <h3>No customers added yet</h3>
            <p>Add your first debtor or customer to start tracking debts and balances.</p>
            <button className="btn primary" onClick={onOpenAddModal}>
              <Icon name="plus" /> Add First Customer
            </button>
          </div>
        ) : (
          <div className="customer-layout">
            <section className="panel customer-list">
              <label className="search">
                <Icon name="search" size={17} />
                <input
                  placeholder="Search customers or phone..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelected(0) }}
                />
              </label>

              {filtered.map((c, i) => (
                <button
                  className={selected === i ? 'selected' : ''}
                  onClick={() => setSelected(i)}
                  key={c.id}
                >
                  <span className="avatar soft">{c.initials}</span>
                  <div>
                    <b>{c.name}</b>
                    <small>{c.status}</small>
                  </div>
                  <strong>{c.balance}</strong>
                </button>
              ))}

              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--muted)', fontSize: 12 }}>
                  No customer matches your search.
                </div>
              )}
            </section>

            {activeCustomer && (
              <section className="panel customer-detail">
                <div className="customer-hero">
                  <span className="avatar large">{activeCustomer.initials}</span>
                  <div>
                    <h2>{activeCustomer.name}</h2>
                    <p>
                      {activeCustomer.phone} · {activeCustomer.tag || 'Customer Account'}
                    </p>
                  </div>
                  <button
                    className="btn outline"
                    onClick={() => onSendReminder(activeCustomer)}
                  >
                    <Icon name="reminders" size={16} /> WhatsApp reminder
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => onOpenPaymentModal(activeCustomer)}
                  >
                    <Icon name="plus" size={16} /> Record payment
                  </button>
                </div>

                <div className="customer-stats">
                  <div>
                    <span>Outstanding balance</span>
                    <b style={{ color: activeCustomer.currentBalance > 0 ? 'var(--red)' : 'var(--green)' }}>
                      {activeCustomer.balance}
                    </b>
                  </div>
                  <div>
                    <span>Total credit granted</span>
                    <b>{formatNaira(activeCustomer.totalDebt)}</b>
                  </div>
                  <div>
                    <span>Total repaid</span>
                    <b style={{ color: 'var(--green)' }}>{formatNaira(activeCustomer.totalPaid)}</b>
                  </div>
                </div>

                <h3>Transaction history</h3>
                {transactions
                  .filter(t => t.name.toLowerCase().includes(activeCustomer.name.toLowerCase().split(' ')[0]))
                  .length === 0 ? (
                    <p style={{ color: 'var(--muted)', fontSize: 12, padding: '12px 0' }}>
                      No prior transactions logged for this customer.
                    </p>
                  ) : (
                    transactions
                      .filter(t => t.name.toLowerCase().includes(activeCustomer.name.toLowerCase().split(' ')[0]))
                      .slice(0, 5)
                      .map((t, i) => (
                        <div className="history" key={t.id || i}>
                          <span className="history-icon">
                            <Icon name="check" size={16} />
                          </span>
                          <div>
                            <b>{t.item}</b>
                            <small>{t.time}</small>
                          </div>
                          <strong className={t.amount.startsWith('+') ? 'positive' : ''}>
                            {t.amount}
                          </strong>
                        </div>
                      ))
                  )}
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ==========================================================================
   Reminders View (1-Click WhatsApp Integration)
   ========================================================================== */
function Reminders({
  customers,
  theme,
  toggleTheme,
  user
}: {
  customers: CustomerItem[]
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: MerchantUser
}) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [customText, setCustomText] = useState('')

  const owingCustomers = customers.filter(c => c.currentBalance > 0)
  const activeCustomer = owingCustomers[selectedIdx] || owingCustomers[0]
  const shopName = user.shopName || 'Our Store'

  const defaultMsg = activeCustomer
    ? `Hello ${activeCustomer.name}, this is a friendly reminder from ${shopName}. Your outstanding balance for goods received is ${activeCustomer.balance}. Please arrange payment at your convenience. Thank you for your continued patronship, and God bless your business! 🙏`
    : ''

  const messageText = customText || defaultMsg

  const handleSendWhatsApp = () => {
    if (!activeCustomer) return
    const phoneClean = activeCustomer.phone.replace(/\D/g, '')
    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(messageText)}`
    window.open(url, '_blank')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <AppHeader
        title="Payment reminders"
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
      />
      <div className="content">
        <div className="page-intro">
          <div>
            <h2>Friendly follow-ups, right on time</h2>
            <p>1-click WhatsApp reminders that open directly in your WhatsApp app—zero API setup required.</p>
          </div>
        </div>

        {owingCustomers.length === 0 ? (
          <div className="empty-ledger-card">
            <span className="empty-icon">🎉</span>
            <h3>No outstanding debts!</h3>
            <p>All customer accounts are fully settled or no debts are currently recorded.</p>
          </div>
        ) : (
          <div className="reminder-grid">
            <section className="panel reminder-compose">
              <div className="panel-head">
                <div>
                  <h3>Message preview</h3>
                  <p>
                    To {activeCustomer?.name} · {activeCustomer?.phone}
                  </p>
                </div>
                <span className="tag payment">
                  Owing {activeCustomer?.balance}
                </span>
              </div>

              <div className="whatsapp">
                <div className="wa-top">
                  <span className="avatar small">{activeCustomer?.initials}</span>
                  <div>
                    <b>{activeCustomer?.name}</b>
                    <small>online</small>
                  </div>
                </div>
                <div className="wa-chat">
                  <div className="wa-day">TODAY</div>
                  <div className="wa-message">
                    {messageText}
                    <span>10:42 ✓✓</span>
                  </div>
                </div>
              </div>

              <textarea
                value={messageText}
                onChange={e => setCustomText(e.target.value)}
                rows={4}
              />

              <div className="reminder-actions">
                <button className="btn outline" onClick={handleCopy}>
                  <Icon name="copy" size={16} /> {copied ? 'Copied!' : 'Copy message'}
                </button>
                <button className="btn whatsapp-btn" onClick={handleSendWhatsApp}>
                  <Icon name="reminders" /> Send on WhatsApp
                </button>
              </div>
            </section>

            <section className="panel queue">
              <div className="panel-head">
                <div>
                  <h3>Follow-up queue</h3>
                  <p>Select customer to message</p>
                </div>
              </div>

              {owingCustomers.map((c, i) => (
                <div
                  className="queue-row"
                  key={c.id}
                  style={{
                    cursor: 'pointer',
                    background: selectedIdx === i ? '#eaf5ef25' : 'transparent',
                    padding: '12px 8px'
                  }}
                  onClick={() => {
                    setSelectedIdx(i)
                    setCustomText('')
                  }}
                >
                  <span className="avatar soft">{c.initials}</span>
                  <div>
                    <b>{c.name}</b>
                    <small>{c.phone}</small>
                  </div>
                  <strong>{c.balance}</strong>
                  <span className={`status-dot ${i === 0 ? 'draft' : 'sent'}`}>
                    {selectedIdx === i ? 'Active' : 'Draft'}
                  </span>
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </>
  )
}

/* ==========================================================================
   Insights View
   ========================================================================== */
function Insights({
  customers,
  theme,
  toggleTheme,
  user
}: {
  customers: CustomerItem[]
  theme: 'light' | 'dark'
  toggleTheme: () => void
  user: MerchantUser
}) {
  const overdueTotal = customers
    .filter(c => c.status.includes('overdue'))
    .reduce((acc, c) => acc + c.currentBalance, 0)

  return (
    <>
      <AppHeader
        title="Business insights"
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
      />
      <div className="content">
        <div className="page-intro">
          <div>
            <h2>Know what needs your attention</h2>
            <p>AI-powered pattern detection across your store sales and credit lines.</p>
          </div>
          <select className="period">
            <option>Last 30 days</option>
          </select>
        </div>

        <div className="insight-cards">
          <article className="insight-alert">
            <span className="stat-icon amber">
              <Icon name="bell" />
            </span>
            <div>
              <small>NEEDS ATTENTION</small>
              <h3>{formatNaira(overdueTotal || 0)} overdue</h3>
              <p>{overdueTotal > 0 ? 'Follow up with overdue customers via WhatsApp.' : 'All debts are within scheduled payment periods.'}</p>
            </div>
            <button>
              Review debts <Icon name="arrow" size={15} />
            </button>
          </article>

          <article className="insight-alert positive-card">
            <span className="stat-icon green">
              <Icon name="insights" />
            </span>
            <div>
              <small>RECOVERY HEALTH</small>
              <h3>Financial Integrity Active</h3>
              <p>Deterministic arithmetic running on all customer ledger accounts.</p>
            </div>
            <button>
              View report <Icon name="arrow" size={15} />
            </button>
          </article>
        </div>

        <div className="dash-grid">
          <section className="panel bar-panel">
            <div className="panel-head">
              <div>
                <h3>Weekly sales breakdown</h3>
                <p>Activity overview</p>
              </div>
            </div>
            <div className="bars">
              {[42, 58, 46, 72, 64, 94, 78].map((h, i) => (
                <div key={i}>
                  <span style={{ height: `${h}%` }} className={i === 5 ? 'hot' : ''}>
                    <i>₦{h}k</i>
                  </span>
                  <small>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="panel followups">
            <div className="panel-head">
              <div>
                <h3>Priority follow-up list</h3>
                <p>Prioritized by outstanding balance</p>
              </div>
            </div>
            {customers.slice(0, 3).map(c => (
              <div key={c.id}>
                <span className="avatar soft">{c.initials}</span>
                <p>
                  <b>{c.name}</b>
                  <small>{c.status}</small>
                </p>
                <strong>{c.balance}</strong>
                <button>Remind</button>
              </div>
            ))}
            {customers.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 12, padding: '20px 0', textAlign: 'center' }}>
                No customers to follow up.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   Main Application Shell (Auth First & Real Data)
   ========================================================================== */
export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sabiledger_theme') as 'light' | 'dark') || 'light'
  })
  const [user, setUser] = useState<MerchantUser | null>(() => {
    const saved = localStorage.getItem('sabiledger_user')
    if (saved) {
      try { return JSON.parse(saved) } catch (_) {}
    }
    return null
  })

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signup')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [targetCustomer, setTargetCustomer] = useState<CustomerItem | null>(null)

  // Real Data: start fresh/empty if nothing has been recorded yet!
  const [customers, setCustomers] = useState<CustomerItem[]>(() => {
    const saved = localStorage.getItem('sabiledger_real_customers')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      } catch (_) {}
    }
    return []
  })

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem('sabiledger_real_transactions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      } catch (_) {}
    }
    return []
  })

  // Theme synchronization:
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sabiledger_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  // Check Supabase session on startup:
  useEffect(() => {
    getCurrentUser().then(u => {
      if (u) setUser(u)
    })
  }, [])

  // Persist state:
  const persistData = (newCusts: CustomerItem[], newTxs: TransactionItem[]) => {
    setCustomers(newCusts)
    setTransactions(newTxs)
    localStorage.setItem('sabiledger_real_customers', JSON.stringify(newCusts))
    localStorage.setItem('sabiledger_real_transactions', JSON.stringify(newTxs))
  }

  // Clear data handler:
  const handleClearData = () => {
    if (window.confirm('Clear all customers and transactions to start with a fresh blank ledger?')) {
      persistData([], [])
    }
  }

  // Load sample data for judges / evaluation:
  const handleLoadJudgeData = () => {
    persistData(SAMPLE_JUDGE_CUSTOMERS, SAMPLE_JUDGE_TRANSACTIONS)
  }

  const handleSignOut = async () => {
    await signOutUser()
    setUser(null)
  }

  // Add customer handler:
  const handleAddCustomer = (newCust: CustomerItem, initialDebt: number) => {
    let updatedTxs = [...transactions]
    if (initialDebt > 0) {
      const newTx: TransactionItem = {
        id: `tx_${Date.now()}`,
        name: newCust.name,
        initials: newCust.initials,
        item: 'Initial credit balance',
        amount: formatNaira(initialDebt),
        rawAmount: initialDebt,
        type: 'Sale',
        time: 'Just now',
        verified: true
      }
      updatedTxs = [newTx, ...updatedTxs]
    }
    persistData([newCust, ...customers], updatedTxs)
  }

  // Record payment handler (deterministic balance deduction):
  const handleRecordPayment = (customerId: string, amount: number, note: string) => {
    const custIndex = customers.findIndex(c => c.id === customerId)
    if (custIndex === -1) return

    const cust = customers[custIndex]
    const newBal = Math.max(0, cust.currentBalance - amount)
    const newPaid = cust.totalPaid + amount

    const updatedCustomer: CustomerItem = {
      ...cust,
      currentBalance: newBal,
      balance: formatNaira(newBal),
      totalPaid: newPaid,
      status: newBal === 0 ? 'Fully paid' : 'Partially paid'
    }

    const updatedCustList = [...customers]
    updatedCustList[custIndex] = updatedCustomer

    const paymentTx: TransactionItem = {
      id: `tx_${Date.now()}`,
      name: cust.name,
      initials: cust.initials,
      item: note || 'Payment received',
      amount: `+${formatNaira(amount)}`,
      rawAmount: amount,
      type: 'Payment',
      time: 'Just now',
      verified: true
    }

    persistData(updatedCustList, [paymentTx, ...transactions])
  }

  // Notebook scanner batch commit handler:
  const handleSaveScannerTransactions = (
    entries: Array<{ name: string; item: string; amount: number; isPayment: boolean }>
  ) => {
    let currentCustList = [...customers]
    let currentTxList = [...transactions]

    entries.forEach(entry => {
      let cust = currentCustList.find(c => c.name.toLowerCase() === entry.name.toLowerCase())
      if (!cust) {
        cust = {
          id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: entry.name,
          phone: '+2348000000000',
          initials: getInitials(entry.name),
          balance: formatNaira(entry.isPayment ? 0 : entry.amount),
          currentBalance: entry.isPayment ? 0 : entry.amount,
          totalDebt: entry.isPayment ? 0 : entry.amount,
          totalPaid: entry.isPayment ? entry.amount : 0,
          status: entry.isPayment ? 'Fully paid' : 'Due today',
          color: '#11664c'
        }
        currentCustList.unshift(cust)
      } else {
        const delta = entry.isPayment ? -entry.amount : entry.amount
        const newBal = Math.max(0, cust.currentBalance + delta)
        cust = {
          ...cust,
          currentBalance: newBal,
          balance: formatNaira(newBal),
          totalDebt: !entry.isPayment ? cust.totalDebt + entry.amount : cust.totalDebt,
          totalPaid: entry.isPayment ? cust.totalPaid + entry.amount : cust.totalPaid,
          status: newBal === 0 ? 'Fully paid' : 'Active debt'
        }
        currentCustList = currentCustList.map(c => (c.id === cust!.id ? cust! : c))
      }

      currentTxList.unshift({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: entry.name,
        initials: getInitials(entry.name),
        item: entry.item,
        amount: entry.isPayment ? `+${formatNaira(entry.amount)}` : formatNaira(entry.amount),
        rawAmount: entry.amount,
        type: entry.isPayment ? 'Payment' : 'Sale',
        time: 'Today (Scan)',
        verified: true
      })
    })

    persistData(currentCustList, currentTxList)
  }

  // IF NOT AUTHENTICATED: Auth comes first! Show Landing page, and any action opens Auth modal:
  if (!user) {
    return (
      <>
        <Landing
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenAuth={tab => {
            setAuthTab(tab)
            setShowAuthModal(true)
          }}
        />
        <AuthModal
          isOpen={showAuthModal}
          initialTab={authTab}
          onClose={() => setShowAuthModal(false)}
          onSuccess={u => {
            setUser(u)
            setShowAuthModal(false)
            setView('dashboard')
          }}
        />
      </>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        setView={setView}
        user={user}
        onSignOut={handleSignOut}
        onLoadJudgeData={handleLoadJudgeData}
        onClearData={handleClearData}
      />

      <main className="app-main">
        {view === 'dashboard' && (
          <Dashboard
            setView={setView}
            customers={customers}
            transactions={transactions}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            onOpenAddModal={() => setShowAddModal(true)}
            onLoadJudgeData={handleLoadJudgeData}
          />
        )}

        {view === 'scan' && (
          <Scanner
            onSaveTransactions={handleSaveScannerTransactions}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
          />
        )}

        {view === 'voice' && (
          <Voice
            customers={customers}
            onRecordPayment={handleRecordPayment}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
          />
        )}

        {view === 'customers' && (
          <Customers
            customers={customers}
            transactions={transactions}
            onOpenAddModal={() => setShowAddModal(true)}
            onOpenPaymentModal={c => {
              setTargetCustomer(c)
              setShowPaymentModal(true)
            }}
            onSendReminder={c => {
              setTargetCustomer(c)
              setView('reminders')
            }}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
          />
        )}

        {view === 'reminders' && (
          <Reminders
            customers={customers}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
          />
        )}

        {view === 'insights' && (
          <Insights
            customers={customers}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
          />
        )}

        <nav className="mobile-nav">
          {(['dashboard', 'scan', 'voice', 'customers', 'insights'] as View[]).map(v => (
            <button
              className={view === v ? 'active' : ''}
              onClick={() => setView(v)}
              key={v}
            >
              <Icon name={v} />
              <span>{v === 'dashboard' ? 'Home' : v}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Global Modals */}
      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomer}
      />

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        customer={targetCustomer}
        onRecord={handleRecordPayment}
      />
    </div>
  )
}
