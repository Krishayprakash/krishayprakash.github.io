# Krishay Prakash Store

This is a separate static storefront for GitHub Pages. The existing portfolio remains in the repository root; the store lives in `/shop/`.

## Files
- `index.html`: store page
- `style.css`: store appearance
- `script.js`: catalogue rendering and cart logic
- `products.json`: editable products and services
- `assets/`: add product images here

## Add or activate an item
Edit `products.json`. Example:

```json
{
  "id": "sample-book",
  "name": "Sample Book",
  "category": "Books",
  "description": "Short product description.",
  "price": 299,
  "type": "physical",
  "image": "assets/sample-book.jpg",
  "active": true
}
```

Allowed categories: `Books`, `Merchandise`, `Services`. Use a unique `id`. Set `active` to `true` only after confirming the price, stock/availability, delivery/fulfilment terms and product details. Prices are in INR.

## Important: payments and orders
This version deliberately does **not** collect card details, UPI PINs or payment credentials, and does not claim to accept payments. The cart works in the visitor's browser. Checkout currently creates a copyable order enquiry only. It is not a live order-management system and does not take payment.

To accept UPI/cards, the store needs a merchant account approved by an Indian payment provider and a secure server-side integration (for example, a small backend/serverless function). Never put gateway secret keys in `script.js`, `products.json`, or any public GitHub file. Since the site owner is under 18, the payment provider's age and KYC requirements must be handled by a parent/guardian as required by the provider.

## Publish
Upload the repository contents to GitHub, keeping the `shop` folder in the repository root. GitHub Pages should then serve:
`https://krishayprakash.github.io/shop/`

The main portfolio's navigation now includes a Shop link.
