# NURA Jewellery Website

Static storefront for NURA, a contemporary boho crystal jewellery brand. The site uses only HTML, CSS, local Bootstrap CSS, jQuery and editable JSON files, so it is ready for GitHub Pages without a Node build step.

## Edit Content

- Site copy, SEO text, story, process, trust, footer links, FAQ and homepage sections: `json/site.json`
- Products, prices, categories, images, availability, care notes and product SEO: `json/products.json`
- WhatsApp number, UPI ID, UPI QR image and India checkout settings: `json/checkout.json`
- Brand logo: `assets/images/brand/nura-logo.JPG`
- Product photos: `assets/images/products/`
- Payment QR image: `assets/images/payments/`
- Styles and animation: `css/style.css`
- Rendering and cart logic: `js/main.js`

## UPI Setup Before Going Live

The current UPI QR is a placeholder. Replace `assets/images/payments/upi-qr-placeholder.svg` with the real QR image and add the real UPI ID in `json/checkout.json`. Until those fields are real, UPI payment is intentionally disabled.

## Content Notes

Use careful crystal language unless each product material is confirmed. Safe wording includes `crystal-led`, `stone-detail`, `crystal-inspired`, `meaningful`, `symbolic`, `intention-led`, and `everyday wearable`.

Avoid medical or unsupported claims such as guaranteed healing, cures, certified genuine crystals, waterproof, tarnish-free, handmade, or shipping promises unless the brand can verify them.

## Publish On GitHub Pages

1. Push this folder to GitHub.
2. In the repository settings, open **Pages**.
3. Use the included GitHub Actions workflow or choose **Deploy from a branch** for the `main` branch.

Do not preview by double-clicking `index.html`; browsers block local JSON fetches. GitHub Pages serves the JSON correctly.
