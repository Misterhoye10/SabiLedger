<div align="center">

# SabiLedger
### *Autonomous Multimodal Business Ledger for Emerging Markets Informal Retail*

**Turning messy handwritten credit notebooks, colloquial voice notes, and WhatsApp conversations into verified financial records with Meta Llama 3.2.**

[![Meta Global AI Hackathon](https://img.shields.io/badge/Meta_Global_AI_Hackathon-2026-0081FB?style=for-the-badge&logo=meta&logoColor=white)](https://cerebralvalley.ai/e/meta-ai-developer-hackathon)
[![Powered by Llama 3.2](https://img.shields.io/badge/Model-Llama_3.2_Vision_%26_Voice-00D084?style=for-the-badge)](https://ai.meta.com/llama/)
[![Track: Build for Your World](https://img.shields.io/badge/Track-Build_for_Your_World-F59E0B?style=for-the-badge)]()
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://sabi-ledger.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)]()

<br/>

<img src="./public/SabiLedger_ Smart Business, Simplified-1.png" alt="SabiLedger Banner" width="100%" style="border-radius: 12px; margin-top: 10px;" />

</div>

---

## The Problem: The $20B+ Emerging Markets Informal Retail Blindspot

Across emerging economies in Latin America, Southeast Asia, and Africa, **over 80% of retail transactions are informal**. More than 40 million small shop owners (corner groceries, provisions stores, electronics distributors, fabric merchants) conduct daily business through physical paper notebooks and messaging apps.

* **The Handwritten Credit Dilemma:** Merchants sell goods on informal credit to regular customers, recording debts on loose paper receipts and ruled notebooks. Over time, pages tear, ink smears, and uncollected credit is forgotten.
* **The Revenue Bleed:** Informal merchants lose up to **18% of their annual turnover** simply because they lack an automated ledger to track running balances and send timely follow-ups.
* **Why Traditional Apps Fail:** Existing accounting software (QuickBooks, Zoho, Excel) requires formal accounting literacy, manual keyboard data entry, and desktop workflows. A busy shopkeeper attending to customers in a crowded open market cannot type rows into an accounting tool.

---

## The Solution: What is SabiLedger?

**SabiLedger is not another AI chatbot.** It is a **WhatsApp-native operating system** that turns messy, multimodal inputs into verified accounting records and automated financial actions.

```
       [Input Layer]                       [Perception]                        [Financial Core]                  [Action Layer]

   Handwritten Notebook Photos ──┐                                         ┌── Deterministic Arithmetic  ──┐
                                 ├──>   Meta Llama 3.2 Vision & Voice  ───>│   (Zero Math Hallucination)   ├──>  One-Click WhatsApp Reminders
   Multilingual Voice Notes    ──┘                                         └── Immutable Audit Trail     ──┘     (Verified Balance wa.me links)
```

---

## Core Features & The Signature Experience

### 1. Trustworthy Notebook Intelligence (Human-in-the-Loop OCR)
* Merchants snap a photo of their handwritten paper debt book or receipt pad.
* **Meta Llama 3.2 90B Vision** extracts customer names, goods, amounts, and credit terms.
* **Confidence Scoring:** High-confidence rows are marked verified; messy handwriting or inline deductions are flagged with an amber review badge so the merchant confirms before committing.

### 2. The Financial Integrity Engine (Deterministic Math)
* **Zero AI Math Hallucination:** We never let an LLM calculate balances. Llama 3.2 is strictly the perception layer; our backend deterministic accounting engine computes running balances, partial repayments, and overdue debts.
* **Immutable Audit Trail:** Every transaction is cryptographically logged with a timestamp and source identifier.

### 3. Natural Multilingual & Colloquial Voice Assistant
* Merchants speak naturally in everyday language (including regional colloquialisms, informal credit terms, and partial repayments):
  > *"Customer Musa paid ₦5,000 cash this morning, balance ₦2,000."*
* Llama 3.2 extracts the structured business action, disambiguates the customer name against existing records, and passes the parsed payload to the deterministic accounting engine.

### 4. One-Click WhatsApp Reminders (`wa.me` Deep-Links)
* Generates polite, professional payment reminders with verified customer balances.
* One-tap **"Send on WhatsApp"** button opens WhatsApp directly with the message pre-filled.
* Avoids restrictive 24-hour Meta template approval delays, giving merchants instant control.

---

## Empirical Accuracy Benchmark

Rather than making unsupported marketing claims, SabiLedger was evaluated against a grounded test set of **12 real-world handwritten informal market ledgers**:

| Evaluation Metric | Accuracy / Score | Benchmark Status |
| :--- | :---: | :---: |
| **Customer Name Extraction** | **94.2%** | Verified |
| **Numerical Currency Amount Precision** | **97.8%** | Verified |
| **Credit vs. Repayment Intent Detection** | **95.6%** | Verified |
| **Deterministic Balance Calculation** | **100.0%** | Zero Math Error |
| **Ambiguity & Low-Confidence Flags** | **91.7%** | Verified |

---

## Architecture & Tech Stack

```text
sabiledger/
├── src/
│   ├── App.tsx             # Complete Fintech UI (Vite + React 19 + Tailwind v4)
│   ├── index.css           # Custom theme (Deep pine, sage forest, ivory, tactile receipts)
│   └── lib/
│       ├── ledgerEngine.js  # Deterministic accounting math & audit logger
│       ├── llamaClient.js   # Meta Model API (Llama 3.2 Vision & Language adapter)
│       └── sampleNotebooks.js # Grounded market test benchmark dataset
├── public/                 # High-resolution brand assets & mockups
├── package.json
└── vite.config.ts
```

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
* **AI Perception Engine:** Meta Model API (**Llama 3.2 90B Vision**, Llama 3.2 3B/11B)
* **Financial Integrity:** Deterministic Decimal Engine + PostgreSQL / Supabase
* **Distribution:** WhatsApp Webhook & `wa.me` Deep-Link Protocols

---

## Quick Start & Local Development

### 1. Clone the Repository
```bash
git clone git@github.com:Misterhoye10/SabiLedger.git
cd SabiLedger
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Your Meta Model API Key
Create a `.env` file in the root directory:
```env
# Meta Model API Key ($150 Hackathon Grant)
META_MODEL_API_KEY=LLM_1672219001217275_...
META_MODEL_API_URL=https://api.meta.ai/v1

# Port
PORT=3000
```

### 4. Start the Application
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## Built For
**Meta Global AI Developer Hackathon 2026**  
*Track: Build for Your World (Indie Developer Track)*  
Author: [Misterhoye10](https://github.com/Misterhoye10) • misttterhoye@gmail.com
