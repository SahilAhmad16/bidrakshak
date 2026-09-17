# BidRakshak

> **Smart Bid Verification. Transparent Procurement.**

BidRakshak is a modern, full-stack bid compliance and tender analysis platform. It allows organizations and bidders to upload public tender PDF documents, automatically extracts statutory clauses, identifies key compliance requirements (GST, PAN, MSME, OEM Authorization, Financial Turnover, Technical Specifications, and Integrity Pacts), calculates a dynamic 0–100 compliance score, and determines actionable risk tiers (Low, Medium, High).

---

## Key Features

- **Automated Tender PDF Parsing**: Extracts text from standard public procurement documents and RFPs.
- **Rule-Based Compliance Engine**: Evaluates 10 vital tender qualification criteria:
  1. **GST Compliance & Registration** (GSTIN, GSTR-3B filings)
  2. **PAN / Tax Identification** (Direct tax clearance, ITR filings)
  3. **MSME / Udyam Concessions** (EMD exemptions, purchase preference)
  4. **Company / Entity Registration** (Certificate of Incorporation, RoC, Partnership Deeds)
  5. **OEM Authorization (MAF)** (Manufacturer authorization forms, warranty coverage)
  6. **Financial Standing & Turnover** (Audited balance sheets, net worth, solvency)
  7. **Past Performance & Experience** (Work completion orders, client credentials)
  8. **Technical Specifications & Standards** (Compliance matrices, ISO/BIS certificates, datasheets)
  9. **Integrity & Non-Debarment** (Notarized affidavits, blacklisting declarations)
  10. **Tender Security & EMD / PBG** (Earnest money deposit, performance bank guarantees)
- **Dynamic 0–100 Compliance Score**: Objectively computes score based on detected clauses, clarity, and missing mandates.
- **Transparent Risk Categorization**:
  - **Low Risk (80–100)**: Favorable compliance, well-defined specifications.
  - **Medium Risk (50–79)**: Notable ambiguities or documentation requiring pre-bid clarification.
  - **High Risk (0–49)**: Major statutory, technical, or financial clauses missing or contradictory.
- **Database-Driven Dashboard**: Real metrics computed directly from uploaded tenders (Total Tenders, Completed Analysis, Pending, Risk Distribution, Recent Tenders).
- **Secure Authentication**: User registration and login powered by bcrypt password hashing and secure HTTP-only JWT cookies.
- **Document Text Inspector**: Full transparency to inspect raw extracted text alongside verification findings.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database**: MongoDB via Mongoose (with built-in zero-config persistent local fallback)
- **Document Processing**: `pdf-parse` v2
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`

---

## Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 2. Installation

Clone the repository and install dependencies:

```bash
cd bidrakshak
npm install
```

### 3. Environment Variables

Create a `.env.local` file from the provided `.env.example`:

```bash
cp .env.example .env.local
```

Configure your variables:

```env
# MongoDB Connection String (e.g., MongoDB Atlas or local MongoDB)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bidrakshak?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your-secure-jwt-secret-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Zero-Config Development Note**:
> If `MONGODB_URI` is omitted during local development, BidRakshak will automatically utilize its internal resilient local JSON store (`.data/bidrakshak-store.json`), allowing you to test all features immediately without configuring a database.

### 4. Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment to Vercel

BidRakshak is fully configured for deployment on [Vercel](https://vercel.com):

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BidRakshak tender verification platform"
   git remote add origin https://github.com/your-username/bidrakshak.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - In **Environment Variables**, add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string.
     - `JWT_SECRET`: A secure random string.
   - Click **Deploy**.

---

## License

Proprietary. All rights reserved &copy; BidRakshak.
