# 🚀 Bright Aside SACCO Management System

Comprehensive SACCO management system with a Google Sheets backend.

## 🛠️ Setup Instructions

### Step 1: Database (Google Sheets)
1. Create a new Google Sheet named `BrightAside DB`.
2. Go to **Extensions > Apps Script**.
3. Copy the content of `Code.gs` from this repository into the script editor.
4. Click **Deploy > New Deployment**.
    - Type: **Web App**
    - Execute as: **Me**
    - Who has access: **Anyone**
5. Copy the **Web App URL**.

### Step 2: Connect Frontend
1. Open the app in your browser (or your GitHub Pages URL).
2. The first time you open it, a **Setup Guide** will appear.
3. Paste the **Web App URL** from Step 1 into the setup box and click **Connect**.
4. The system will automatically seed your Google Sheet with the initial 22 members and settings.

## 🔐 Logins
- **Admin Username:** `admin`
- **Admin Password:** `brightaside2024`
- **Member PIN (Default):** `1234`

## ⚖️ Group Rules (v2.5)
- **Loan Capacity:** 80% of total member savings.
- **Interest Rates:** 
    - 1 Year: 20% interest.
    - 2 Years: 10% interest.
- **Fees:** 1% Insurance fee on principal.
- **Grace Period:** 2 weeks after issuance before first payment.
- **Fines:** KSh 50/week base + cumulative 50% penalty on previous unpaid fines.
- **Schedule:** Payments are due by **Sunday** of each week.

## 📦 Deployment
This repository is configured to deploy to **GitHub Pages** automatically via GitHub Actions.
1. Go to **Settings > Pages** in this repository.
2. Select **GitHub Actions** as the source.
3. Every push to the `main` branch will build and update the site.
