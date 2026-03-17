# CartEvent Business Model

> **"Freemium Agency"** - Free marketplace to build trust, paid consultation to earn revenue.

---

## 🎯 Core Strategy

| Engine | Cost | Purpose |
|--------|------|---------|
| **Marketplace** (Self-Service) | 100% Free | Volume, trust, vendor loyalty |
| **Consultation** (Premium) | Commission-based | Revenue generation |

**Your Role:** The Gatekeeper. Mediate connections for free, charge only when you do the heavy lifting.

---

## 🔄 Two Operational Flows

### Flow A: Consultation (Revenue Engine)

```
User clicks "Get Custom Quote" → Submits requirements → You call & verify →
Hunt perfect vendor → Negotiate & close deal → Earn commission
```

| Party | Pays |
|-------|------|
| Vendor | 5-15% success commission |
| User | ₹0 (Free service) |

### Flow B: Listing & Callback (Growth Engine)

```
User browses → Selects vendor → Clicks "Check Availability" →
You verify with vendor → Connect both parties
```

| Party | Pays |
|-------|------|
| Vendor | ₹0 |
| User | Token amount only (escrow) |

---

## 💰 Token System

### Purpose
- **Not revenue** - purely trust mechanism
- Prevents fake bookings & last-minute cancellations
- Held in escrow, released to vendor after event

### Formula
```
Token = MAX(Min Token, MIN(Order Value × %, Max Token))
```

### Token by Category

| Category | Min Order | Token % | Min | Max |
|----------|-----------|---------|-----|-----|
| Photography & Videography | ₹5,000 | 20% | ₹500 | ₹2,000 |
| Decoration | ₹8,000 | 20% | ₹500 | ₹3,000 |
| Catering | ₹15,000 | 15% | ₹1,000 | ₹5,000 |
| Venue | ₹20,000 | 15% | ₹1,500 | ₹5,000 |
| Makeup Artist | ₹2,000 | 25% | ₹500 | ₹1,500 |
| DJ & Entertainment | ₹5,000 | 20% | ₹500 | ₹2,000 |
| Sound & Lights | ₹3,000 | 25% | ₹500 | ₹1,500 |
| Artists/Performers | ₹8,000 | 20% | ₹500 | ₹3,000 |
| Event Planner | ₹20,000 | 15% | ₹1,500 | ₹5,000 |

### Examples

```
Catering: ₹450/plate × 100 plates = ₹45,000 order
Token = 15% of ₹45,000 = ₹6,750 → Capped at ₹5,000 ✓

MUA: ₹3,000 party makeup × 1 = ₹3,000 order
Token = 25% of ₹3,000 = ₹750 ✓

Photography: ₹2,000/hr × 4 hrs = ₹8,000 order
Token = 20% of ₹8,000 = ₹1,600 ✓
```

---

## ⚖️ Cancellation Policy

### User Cancels

| Timing | Refund | Vendor Gets |
|--------|--------|-------------|
| >30 days | 80% | 20% |
| 15-30 days | 50% | 50% |
| 7-15 days | 25% | 75% |
| <7 days | 0% | 100% |

### Vendor Cancels

| Timing | User Gets | Vendor Penalty |
|--------|-----------|----------------|
| >30 days | 100% + 25% credit | 25% of token |
| 15-30 days | 100% + 50% credit | 50% of token |
| 7-15 days | 100% + 75% credit | 75% of token |
| <7 days | 100% + 100% credit | 100% of token |

---

## 📊 Revenue Tracking

| ID | Flow | User | Vendor | Deal Value | Revenue | Status |
|----|------|------|--------|------------|---------|--------|
| TXN_001 | Consultation | Priya S. | Royal Hall | ₹2,00,000 | ₹20,000 (10%) | Pending |
| TXN_002 | Listing | Rahul K. | DJ Mike | ₹15,000 | ₹0 | N/A |
| TXN_003 | Consultation | Amit B. | Candid Pix | ₹50,000 | ₹5,000 (10%) | Received |

---

## ✅ Why This Works

| Benefit | How |
|---------|-----|
| **Easy vendor acquisition** | "List free, leads free. Pay only for custom clients." |
| **High user trust** | You mediate every connection |
| **Simple operations** | No complex billing for small fees |
| **Scalable revenue** | Consultation commissions on high-value deals |

---

## 🔧 Implementation Config

```javascript
const TOKEN_CONFIG = {
  'photography-videography': { minOrder: 5000,  pct: 0.20, min: 500,  max: 2000 },
  'decorator':               { minOrder: 8000,  pct: 0.20, min: 500,  max: 3000 },
  'caterer':                 { minOrder: 15000, pct: 0.15, min: 1000, max: 5000 },
  'venue':                   { minOrder: 20000, pct: 0.15, min: 1500, max: 5000 },
  'mua':                     { minOrder: 2000,  pct: 0.25, min: 500,  max: 1500 },
  'dj-entertainment':        { minOrder: 5000,  pct: 0.20, min: 500,  max: 2000 },
  'sound-lights':            { minOrder: 3000,  pct: 0.25, min: 500,  max: 1500 },
  'artists':                 { minOrder: 8000,  pct: 0.20, min: 500,  max: 3000 },
  'event-planner':           { minOrder: 20000, pct: 0.15, min: 1500, max: 5000 }
};

function calculateToken(category, orderValue) {
  const c = TOKEN_CONFIG[category];
  if (orderValue < c.minOrder) return { error: `Min order: ₹${c.minOrder}` };
  return Math.max(c.min, Math.min(orderValue * c.pct, c.max));
}
```

---

## 🎯 Key Numbers

| Metric | Value |
|--------|-------|
| Absolute min token | ₹500 |
| Max token (any category) | ₹5,000 |
| Consultation commission | 5-15% |
| Listing fee | ₹0 |
| Lead fee | ₹0 |

---
