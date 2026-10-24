# CalmPop — Mock Payment System & Subscription Flow Guide

> **DEMO MODE — NO REAL PAYMENTS**: This project is a frontend demonstration. No actual money is transferred, no external payment gateway (Razorpay, Stripe, UPI APIs, Bank APIs) is integrated or contacted, and no real card numbers or bank credentials are ever requested or stored.

---

## 1. Quick Start & Demonstration Overview

### Running Locally
CalmPop runs via Vite:
```bash
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### Key Navigation Routes
The application uses dynamic client-side view routing (`window.navigateView` and hash changes):
- **Landing Page & Pricing**: `http://localhost:5173/#home` or `http://localhost:5173/#pricing`
- **Mock Checkout**: `http://localhost:5173/#checkout`
- **Company Admin Dashboard**: `http://localhost:5173/#admin`
- **Platform Superadmin Portal**: `http://localhost:5173/#superadmin`
- **Mock Printable Receipt**: `http://localhost:5173/#receipt`

---

## 2. Indian Rupee (INR) Pricing Model

All pricing is displayed in Indian Rupees using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`. All dollar signs have been removed from the platform.

| Plan | Monthly / Employee | Annual Equivalent / Emp / Mo | Employee Limit | Included Features |
|---|---:|---:|---:|---|
| **Starter** | ₹349 | ₹279.20 | 25 seats | 100+ Question Pool, Automated Cadence, Stress Index |
| **Growth** | ₹599 | ₹479.20 | 100 seats | Dept Heatmaps, Custom Cadence, Games Hub, Slack/Teams Bot |
| **Enterprise** | Custom (₹999 demo base) | Custom (₹799.20 demo base) | 500+ seats | Dedicated Psychologist, SAML SSO, Custom Pools, BAA |

### Calculation Examples:
- **Starter (10 seats, Monthly)**: `10 × ₹349 = ₹3,490 / month`
- **Starter (10 seats, Annual)**: `10 × ₹279.20 × 12 = ₹33,504 / year` (Saves 20%)
- **Taxes**: 18% standard GST is calculated and displayed on checkout.

---

## 3. End-to-End Demonstration Walkthrough

### Step 1: Registration Flow
1. Click **Get Started** in the top navigation or any pricing card.
2. Fill in company details:
   - Company Name: *e.g., Zenith Dynamics Pvt Ltd*
   - Work Email: *admin@zenithdynamics.in*
   - Location: *Bengaluru, Karnataka, India*
   - Administrator Name: *Kavita Nair*
   - Administrator Email: *kavita@zenithdynamics.in*
   - Plan & Billing: Choose **Growth**, **Annual**, and seat allocation (e.g. 45 seats).
3. Click **Proceed to Simulated Checkout**.

### Step 2: Interactive Mock Checkout
The checkout features a dedicated two-column desktop / stacked mobile layout:
- **Left Column**: Full order breakdown with CalmPop logo, company name, selected plan, seats, billing cycle, subtotal, 18% GST tax, and total in INR, along with a prominent demo disclaimer.
- **Right Column**: Interactive payment methods:
  - **UPI**: Selection of GPay, PhonePe, Paytm, BHIM, mock UPI ID input, and decorative simulated QR code.
  - **Card**: Visual corporate credit card preview with placeholder test card (`4111 2222 3333 4242`).
  - **Net Banking**: Fictional bank options (HDFC, ICICI, SBI, Axis, Kotak, PNB).
  - **Demo Wallet**: Corporate credit balance of ₹50,000 for instant simulated debit.
- **Demo Controls Panel (Development Only)**:
  - `🟢 Simulate Success`: Leads to simulated registration completion, generates a unique Company ID (e.g., `CP-ORG-84219`) and Mock Transaction ID (e.g., `DEMO-CP-8F42A1`).
  - `🔴 Simulate Failure`: Simulates a declined transaction (`ERR_DEMO_CARD_DECLINED`), explains failure, prevents subscription activation, and provides a retry button.
  - `🟡 Simulate Cancellation`: Cancels checkout, preserves unactivated state, and offers options to resume or return.

### Step 3: Mock Printable Receipt
- Displays simulated invoice number, transaction ID, date, seat count, subtotal, GST, and total in INR.
- Marked with a prominent watermark: **`DEMO RECEIPT — NO MONEY WAS TRANSFERRED`**.
- Includes a **Print / Save as PDF** button triggering native browser printing (`window.print()`).

### Step 4: Company Admin Dashboard (`#admin`)
Full administration interface pre-seeded with **Strata Labs** (`CP-ORG-78214`) or newly registered demo companies:
- **Overview**: Active seat utilization, weekly survey completion rate, stress index, and recent check-ins.
- **Employees**:
  - Add, edit, or deactivate employee records.
  - Search and filter by department.
  - **Strict Plan Seat Limit Enforcement**: If an administrator attempts to add employees exceeding their plan limit, the system alerts them and prompts for a plan upgrade.
- **Stress Reports**: Departmental trend charts (illustrative, non-diagnostic).
- **Survey Schedule**: Configurable survey delivery day, time, and timezone.
- **Game Activity**: Polished empty state ready for future games, linking to Moments of Calm Box Breathing.
- **Subscription & Billing**: Plan details, active seats, simulated renewal date, mock payment history table with receipt triggers, simulated plan upgrade modal, and simulated cancellation flow.
- **Company Settings**: Organization profile and contact information.

### Step 5: Platform Superadmin Portal (`#superadmin`)
Platform owner view with demo administrator role:
- Platform KPIs: Total Demo Companies, Active Demo Subscriptions, Simulated Success/Failure Counts, and Simulated INR Volume.
- **Company Management**: Search companies, view details, and toggle Suspend/Activate status.
- **Configurable INR Pricing**: Live editor for Starter and Growth monthly prices, annual prices, and employee limits. Updating pricing immediately updates the pricing section and checkout calculator across the app!
- **Global Transaction Audit Log**: Complete history of simulated transactions.
- **Reset Demo Data**: Development button to reset localStorage back to initial factory state.

---

## 4. Client-Side Persistence

All demonstration data is saved in browser `localStorage` under key `calmpop_mock_db_v2`:
- Companies, subscriptions, employee records, survey schedules, and simulated transactions persist across page reloads.
- Passwords are never stored or transmitted.
- To factory reset at any time, click **Reset Demo Data** in the Superadmin Dashboard or run `window.mockStore.resetDemoData()` in the browser DevTools console.
