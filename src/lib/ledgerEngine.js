/**
 * SabiLedger Financial Integrity Engine
 * Deterministic balance math, immutable audit trails, and customer reconciliation.
 * (No AI math hallucination — all accounting math is handled here).
 */

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust_01',
    name: 'Madam Chika Provisions',
    phone: '+2348031234567',
    totalDebt: 32000,
    totalPaid: 18000,
    currentBalance: 14000, // owes 14,000
    lastTransactionDate: '2026-10-24',
    status: 'ACTIVE_DEBT',
  },
  {
    id: 'cust_02',
    name: 'Musa Ibrahim (Bakery)',
    phone: '+2348149876543',
    totalDebt: 45000,
    totalPaid: 45000,
    currentBalance: 0, // Cleared
    lastTransactionDate: '2026-10-25',
    status: 'CLEARED',
  },
  {
    id: 'cust_03',
    name: 'Pastor David (Grace Church)',
    phone: '+2349021112233',
    totalDebt: 85000,
    totalPaid: 25000,
    currentBalance: 60000, // owes 60,000
    lastTransactionDate: '2026-10-20',
    status: 'OVERDUE',
  },
  {
    id: 'cust_04',
    name: 'Mama Nkechi Tailoring',
    phone: '+2347065554433',
    totalDebt: 12500,
    totalPaid: 5000,
    currentBalance: 7500,
    lastTransactionDate: '2026-10-26',
    status: 'ACTIVE_DEBT',
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_01',
    customerId: 'cust_01',
    customerName: 'Madam Chika Provisions',
    date: '2026-10-24',
    type: 'DEBT', // Goods taken on credit
    items: ['2 Bags Mama Gold Rice (50kg)', '1 Carton Vegetable Oil'],
    amount: 32000,
    confidence: 0.98,
    source: 'NOTEBOOK_SCAN',
    verified: true,
    verifiedAt: '2026-10-24T14:32:00Z',
    notes: 'Page 14 handwritten credit record'
  },
  {
    id: 'tx_02',
    customerId: 'cust_01',
    customerName: 'Madam Chika Provisions',
    date: '2026-10-25',
    type: 'PAYMENT', // Repayment
    items: ['Cash deposit via shop assistant'],
    amount: 18000,
    confidence: 1.0,
    source: 'CASH_ENTRY',
    verified: true,
    verifiedAt: '2026-10-25T10:15:00Z',
    notes: 'Part-payment recorded by Mama Joy'
  },
  {
    id: 'tx_03',
    customerId: 'cust_03',
    customerName: 'Pastor David (Grace Church)',
    date: '2026-10-20',
    type: 'DEBT',
    items: ['5 Cartons Malta Guinness', '3 Packs Eva Water'],
    amount: 85000,
    confidence: 0.95,
    source: 'NOTEBOOK_SCAN',
    verified: true,
    verifiedAt: '2026-10-20T17:40:00Z',
    notes: 'Church harvest thanksgiving supply'
  },
  {
    id: 'tx_04',
    customerId: 'cust_03',
    customerName: 'Pastor David (Grace Church)',
    date: '2026-10-22',
    type: 'PAYMENT',
    items: ['Bank Transfer (Opay)'],
    amount: 25000,
    confidence: 1.0,
    source: 'TRANSFER_ALERT',
    verified: true,
    verifiedAt: '2026-10-22T09:20:00Z',
    notes: 'Confirmed in bank app'
  }
];

/**
 * Deterministically compute overall shop metrics from transaction list
 */
export function calculateShopMetrics(customers, transactions) {
  const totalReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const totalCollected = transactions
    .filter(t => t.type === 'PAYMENT' && t.verified)
    .reduce((sum, t) => sum + t.amount, 0);
  const activeDebtors = customers.filter(c => c.currentBalance > 0).length;
  const overdueDebtors = customers.filter(c => c.status === 'OVERDUE').length;

  return {
    totalReceivables,
    totalCollected,
    activeDebtors,
    overdueDebtors,
    formattedReceivables: formatNaira(totalReceivables),
    formattedCollected: formatNaira(totalCollected)
  };
}

/**
 * Format any number as clean Nigerian Naira
 */
export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount).replace('NGN', '₦');
}

/**
 * Commit a verified transaction to the ledger
 * Applies deterministic arithmetic to customer record
 */
export function recordTransaction(state, newTx) {
  const { customers, transactions, auditTrail } = state;

  // 1. Locate or create customer
  let customer = customers.find(c => c.id === newTx.customerId || c.name.toLowerCase() === newTx.customerName.toLowerCase());
  let updatedCustomers = [...customers];

  if (!customer) {
    customer = {
      id: `cust_${Date.now().toString(36)}`,
      name: newTx.customerName,
      phone: newTx.customerPhone || '',
      totalDebt: newTx.type === 'DEBT' ? newTx.amount : 0,
      totalPaid: newTx.type === 'PAYMENT' ? newTx.amount : 0,
      currentBalance: newTx.type === 'DEBT' ? newTx.amount : -newTx.amount,
      lastTransactionDate: newTx.date || new Date().toISOString().split('T')[0],
      status: newTx.type === 'DEBT' ? 'ACTIVE_DEBT' : 'CLEARED'
    };
    updatedCustomers.unshift(customer);
  } else {
    // Deterministic balance update
    const prevBalance = customer.currentBalance;
    const delta = newTx.type === 'DEBT' ? newTx.amount : -newTx.amount;
    const newBalance = Math.max(0, prevBalance + delta);

    const updatedCustomer = {
      ...customer,
      totalDebt: newTx.type === 'DEBT' ? customer.totalDebt + newTx.amount : customer.totalDebt,
      totalPaid: newTx.type === 'PAYMENT' ? customer.totalPaid + newTx.amount : customer.totalPaid,
      currentBalance: newBalance,
      lastTransactionDate: newTx.date || new Date().toISOString().split('T')[0],
      status: newBalance === 0 ? 'CLEARED' : newBalance > 50000 ? 'OVERDUE' : 'ACTIVE_DEBT'
    };

    updatedCustomers = updatedCustomers.map(c => c.id === customer.id ? updatedCustomer : c);
    customer = updatedCustomer;
  }

  // 2. Append verified transaction
  const verifiedTx = {
    ...newTx,
    id: newTx.id || `tx_${Date.now().toString(36)}`,
    verified: true,
    verifiedAt: new Date().toISOString()
  };

  const updatedTransactions = [verifiedTx, ...transactions];

  // 3. Create immutable audit log entry
  const auditEntry = {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: `RECORD_${newTx.type}`,
    entityId: verifiedTx.id,
    customerName: customer.name,
    amount: newTx.amount,
    resultingBalance: customer.currentBalance,
    source: newTx.source
  };

  const updatedAudit = [auditEntry, ...(auditTrail || [])];

  return {
    customers: updatedCustomers,
    transactions: updatedTransactions,
    auditTrail: updatedAudit,
    affectedCustomer: customer
  };
}

/**
 * Generate a courteous WhatsApp reminder with one-click wa.me link
 */
export function generateWhatsAppReminder(customer, shopName = "Mama Joy's Provisions") {
  const balance = formatNaira(customer.currentBalance);
  const cleanPhone = (customer.phone || '').replace(/\D/g, '');

  const text = `Good day ${customer.name}! 🌟 This is a gentle reminder from ${shopName}. Your outstanding balance for goods received is ${balance}. Kindly arrange payment when convenient. Thank you for your continued patronship, and God bless your business! 🙏`;

  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : null;

  return {
    customerName: customer.name,
    phone: customer.phone,
    balance,
    messageText: text,
    waLink
  };
}
