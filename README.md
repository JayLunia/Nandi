# NURA Jewellery Website

NURA is a contemporary boho crystal jewellery brand built around wearable meaning, real product photography, gifting, and everyday styling. This repository contains a static multi-page ecommerce display website for NURA with editable JSON content, product search, product filters, a persistent cart, WhatsApp order checkout, and India UPI payment readiness.

The project is intentionally built without Node or a build step. It uses HTML, CSS, Bootstrap, jQuery, and JSON so it can be hosted directly on GitHub Pages.

## Live Site

- GitHub repository: `https://github.com/JayLunia/Nandi`
- GitHub Pages URL: `https://jaylunia.github.io/Nandi/`

## Website Pages

- `index.html` - Home page with animated hero, brand highlights, collection edits, ordering system cards, and newsletter form.
- `shop.html` - Product catalogue with JSON-driven products, category filters, search, sorting, quick view, add to bag, buy now, and checkout.
- `story.html` - NURA brand story, content pillars, selection process, atelier note, trust badges, and storefront system details.
- `lookbook.html` - Visual product photography page. Each image links back to the matching shop product.
- `faq.html` - Ordering, payment, product care, gifting, and crystal-language FAQ.

## Core Features

- Multi-page static website ready for GitHub Pages.
- Editable content from `json/site.json`, `json/products.json`, and `json/checkout.json`.
- Product cards generated from JSON, not hard-coded in HTML.
- Search, category filtering, sorting, quick view, add to bag, and buy now actions.
- Cart persists with `localStorage`, so hard refresh does not clear the bag.
- WhatsApp checkout sends customer name, phone, location, pincode, notes, product links, quantity, and total amount.
- UPI section is ready for India payments after a real UPI ID and QR image are added.
- SEO metadata, Open Graph tags, canonical URLs, product structured data, and FAQ structured data.
- Local Bootstrap CSS and local jQuery file, so the site does not depend on npm.

## Project Structure

```text
.
├── index.html
├── shop.html
├── story.html
├── lookbook.html
├── faq.html
├── css/
│   ├── bootstrap.min.css
│   └── style.css
├── js/
│   ├── jquery-3.7.1.min.js
│   └── main.js
├── json/
│   ├── site.json
│   ├── products.json
│   └── checkout.json
└── assets/
    └── images/
        ├── brand/
        ├── products/
        └── payments/
```

## Editing Content

Use `json/site.json` for brand-level content:

- Brand name, logo path, and footer copy.
- Homepage hero text and hero slides.
- Marquee text.
- About cards.
- Collection edit cards.
- Process cards.
- Atelier section.
- Service cards.
- Trust badges.
- FAQ content.
- Footer links.
- Main SEO title, description, keywords, and canonical URL.

Use `json/products.json` for catalogue content:

- Product name, SKU, slug, category, price, and availability.
- Badge, stock label, colour mood, material notes, care notes, and shipping note.
- Short and long product descriptions.
- Product image filename.
- Product SEO title, SEO description, and keywords.
- Lookbook entries and their target product links.

Use `json/checkout.json` for ordering and payment settings:

- WhatsApp number.
- Display phone number.
- Currency and locale.
- Public GitHub Pages URL.
- UPI ID.
- UPI QR image path.
- Shipping and checkout notes.

## Adding A Product

1. Add the product image to `assets/images/products/`.
2. Open `json/products.json`.
3. Copy an existing product object.
4. Change the `id`, `sku`, `slug`, `name`, `category`, `price`, `image`, descriptions, and SEO fields.
5. Make sure the `category` matches one of the category IDs in the same file.
6. Save the JSON and preview `shop.html`.

Do not leave duplicate product IDs. The cart, product links, quick view, and WhatsApp checkout all use the product `id`.

## Payment Setup

WhatsApp checkout is already configured for:

```text
+91 96388 33888
```

UPI is intentionally not live yet. Before accepting direct UPI payments:

1. Replace `assets/images/payments/upi-qr-placeholder.svg` with the real UPI QR image.
2. Update `upiQrImage` in `json/checkout.json` if the filename changes.
3. Add the real UPI ID in `json/checkout.json`.
4. Test a cart checkout and confirm the total shown near the QR is correct.

Until the real UPI ID is added, the direct UPI button stays disabled.

## Local Preview

Do not double-click `index.html`. Browsers can block JSON fetches from local files.

Use any static server. For example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

This does not use Node.

## GitHub Pages Deployment

This site is ready for GitHub Pages because every file is static.

Recommended Pages source:

```text
Branch: gh-pages
Folder: /
```

Alternative source:

```text
Branch: main
Folder: /
```

After pushing changes, GitHub Pages can take a few minutes to publish. If GitHub has an Actions or API outage, the repository may push successfully while the live Pages URL updates later.

## Brand And Content Guidelines

Use careful crystal wording unless materials are verified for every product.

Good wording:

- `crystal-led`
- `stone-detail`
- `crystal-inspired`
- `meaningful`
- `symbolic`
- `intention-led`
- `everyday wearable`

Avoid unsupported claims:

- Guaranteed healing.
- Medical treatment or cure language.
- Certified genuine crystals unless certification exists.
- Waterproof or tarnish-free unless tested.
- Handmade, made in India, or shipping promises unless verified by the brand.

## Maintenance Checklist

- Validate JSON after editing.
- Check that every product image path exists.
- Test `shop.html` search, filters, sorting, quick view, add to bag, buy now, and checkout.
- Test cart persistence after a hard refresh.
- Test WhatsApp checkout message contents.
- Replace the UPI placeholder before accepting payments.
- Keep product copy accurate and avoid unsupported material claims.
