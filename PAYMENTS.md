# PAYMENTS.md — PumpRoute monetization setup (Allen's ~5-minute step)

## 1. Payment QR (2 min)
Replace `pay-qr.svg` (site root) with your Payment QR image (keep filename or update `index.html`).

## 2. Unlock codes (1 min)
`app.js` line ~4:
```js
const PRO_CODES = ['NEGOSYO-149', 'NS-DEMO'];   // ← your codes
```

## 3. Honest limitation + upgrade path (read this)
The full workbook is served from `/full/PumpRoute.xlsx` (blocked in robots.txt but technically a public URL — a buyer could share the direct link). Fine for $49-at-this-scale. When sales justify it (say 20+/mo):
1. Create Gumroad/LemonSqueezy product "PumpRoute $49" with the xlsx as auto-delivered content.
2. Point the CTA straight at their checkout (replace the modal flow) — or keep the modal and set `FULL_URL` to a rotating private link.
3. Consider per-buyer watermarking (openpyxl footer cell = buyer name) for sharing resistance.

## 4. Pricing rationale
$49 ≈ $2.60 — deep impulse zone for a store owner, above the ₱99 "walang kwenta" floor, 10x+ cheaper than POS subscriptions. The demo does the selling: dashboard + alerts visible in 30 seconds of use.

## 5. Fulfilment
GCash notif → message code → buyer downloads. ~1 min/sale until Gumroad auto-delivery.

## 6. Growth (the real lever)
- FB: Sari-Sari Store Owners / Online Sellers PH groups — post the FREE DEMO (not the paid), let the dashboard upsell.
- TikTok/Reels idea: screen-record the dashboard updating as sales get logged — hypnotic for negosyo content.
- Bundle story with InvoicePH/TaxCalcPH: "buong sistema ng maliit na negosyo" cross-sell.
