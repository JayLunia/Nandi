# NURA Jewelry Website

Static ecommerce display for the NURA jewelry brand.

## Edit Content

- Main site text: `json/site.json`
- Products, prices, categories, and lookbook: `json/products.json`
- Styles and animation: `css/style.css`
- Rendering logic: `js/main.js`

## Publish On GitHub Pages

1. Upload every file in this folder to a GitHub repository.
2. In GitHub, open the repository settings.
3. Go to **Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Choose the `main` branch and `/root`.
6. Save.

GitHub will give you a live URL like:

```text
https://your-username.github.io/your-repo-name/
```

Do not preview this by double-clicking `index.html`; browsers block local JSON fetches. GitHub Pages serves the JSON correctly.
