
# 🌍 FairChain — Blockchain-Based Supply Chain Verification

## 📌 Overview

**FairChain** is a decentralized verification platform built on the **Stellar Testnet** that ensures transparency and trust in supply chains.

The platform allows:

* 🏭 Factories to be verified
* 👨‍⚖️ Multiple auditors to submit verification records
* 🛒 Buyers to view reputation and verification history

All data is stored on the blockchain using **Stellar’s `manageData` operation**, making it **tamper-proof and publicly verifiable**.

---

## 🚀 Current Progress (Completed Features)

### ✅ 1. Blockchain Integration

* Connected to **Stellar Testnet**
* Successfully submitting transactions using:

  * `TransactionBuilder`
  * `manageData` operations

---

### ✅ 2. Multi-Auditor Verification System

* Auditors can:

  * Input **factory name**
  * Input **auditor name**
  * Use their **secret key**
* Each verification is stored as:

```
verify_timestamp → "FactoryName|AuditorName"
```

---

### ✅ 3. Reputation System

* Aggregates blockchain data to show:

  * Total number of verifications per factory
  * Unique auditors verifying that factory

Example output:

```
🏭 Hawassa Textile
✅ Verifications: 10
👨‍⚖️ Auditors: NGO-1, NGO-2
```

---

### ✅ 4. Buyer View (Search Functionality)

* Buyers can:

  * Search by factory name
  * View verification count
  * See which auditors verified it

---

### ✅ 5. Full Blockchain History

* Displays:

  * All verification records
  * Timestamp of each verification
* Pulled using:

```
server.operations().forAccount()
```

---

### ✅ 6. Frontend UI

* Built using:

  * HTML
  * CSS (custom styling)
  * JavaScript
* Includes:

  * Auditor login
  * Submission form
  * Search system
  * History viewer

---

## 🧠 Technical Stack

* **Blockchain:** Stellar Testnet
* **Frontend:** HTML, CSS, JavaScript
* **SDK:** Stellar SDK (JavaScript)
* **Data Storage:** Stellar `manageData` entries
* **Security:** Secret key-based transaction signing

---

## ⚙️ How It Works

1. Auditor logs in using **secret key**
2. Submits verification for a factory
3. Data is stored on blockchain as encoded value
4. App retrieves and decodes data
5. Displays:

   * Reputation
   * History
   * Auditor diversity

---

## 🧪 How to Run Locally

```
npm install
```

Then run a local server:

```
npx serve .
```

Or use **Live Server (VS Code)**

---

## 📅 7-Day Development Plan (Remaining Work)

### 🔥 Day 1–2: Data Accuracy Improvements

* Filter results by **searched factory name**
* Prevent duplicate spam submissions
* Add basic validation rules

---

### 🔥 Day 3–4: UI/UX Improvements

* Improve design (cards, layout, spacing)
* Add loading indicators
* Add success/error animations

---

### 🔥 Day 5: Security Enhancements

* Hide secret key input (password type)
* Add warnings for key usage
* Prevent empty/invalid submissions

---

### 🔥 Day 6: Advanced Features

* Add **factory-based accounts (not just names)**
* Separate:

  * Auditor accounts
  * Factory accounts
* Improve data structure

---

### 🔥 Day 7: Finalization & Presentation

* Clean code and comments
* Record demo video
* Prepare pitch:

  * Problem
  * Solution
  * Demo
  * Future impact

---

## 💡 Future Improvements

* 🌐 Deploy as a web app (Netlify/Vercel)
* 🔐 Wallet-based authentication (no manual secret key)
* 📊 Analytics dashboard
* 🏢 NGO / Organization verification badges
* 📱 Mobile-friendly UI

---

## 🎯 Project Goal

To create a **transparent, decentralized system** where:

* Supply chains are verifiable
* Fraud is reduced
* Buyers can trust product origins

---

## 👥 Team Contribution

This project is actively being developed with:

* Core blockchain logic implemented ✅
* Functional prototype completed ✅
* UI + feature expansion in progress 🚧

---

## 📌 Status

🟢 **Working Prototype (MVP Complete)**
🚀 Moving toward **final polished version before deadline**
