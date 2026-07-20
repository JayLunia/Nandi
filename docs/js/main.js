$(function () {
  const CART_KEY = "nura-cart";
  const FAVORITES_KEY = "nura-favorites";

  const state = {
    page: $("body").data("page") || "home",
    site: null,
    checkout: {
      currency: "INR",
      locale: "en-IN",
      merchantName: "NURA Jewellery",
      whatsappNumber: "919638833888",
      whatsappDisplay: "+91 96388 33888",
      upiId: "",
      upiQrImage: "assets/images/payments/upi-qr-placeholder.svg",
      publicSiteUrl: "https://jaylunia.github.io/Nandi/"
    },
    products: [],
    categories: [],
    lookbook: [],
    activeFilter: "all",
    searchTerm: "",
    sort: "featured",
    heroIndex: 0,
    cart: readStorage(CART_KEY, []),
    favorites: readStorage(FAVORITES_KEY, [])
  };

  const pageMeta = {
    home: {
      path: "",
      title: "NURA Jewellery | Contemporary Boho Crystal Jewellery for Everyday Wear",
      description:
        "Shop NURA contemporary boho crystal jewellery designed to be worn, loved and lived in. Explore necklaces, bracelets, earrings, pendants and meaningful gift-ready pieces."
    },
    shop: {
      path: "shop.html",
      title: "Shop NURA Jewellery | Boho Crystal Necklaces, Bracelets and Earrings",
      description:
        "Browse the NURA jewellery shop for crystal-led necklaces, bracelets, earrings, pendants, rings and curated gift-ready pieces with WhatsApp and UPI checkout options."
    },
    story: {
      path: "story.html",
      title: "NURA Story | Contemporary Boho Crystal Jewellery Brand",
      description:
        "Learn about NURA, a contemporary boho crystal jewellery brand made for everyday styling, meaningful gifting and personal expression."
    },
    lookbook: {
      path: "lookbook.html",
      title: "NURA Lookbook | Crystal Jewellery Product Photography and Styling",
      description:
        "Explore NURA jewellery styling ideas with necklaces, bracelets, earrings, pendants and gift-ready pieces for everyday and special moments."
    },
    faq: {
      path: "faq.html",
      title: "NURA FAQ | Ordering, WhatsApp Checkout and UPI Payment",
      description:
        "Find NURA jewellery order information, WhatsApp checkout details, India UPI payment notes, product care guidance and crystal jewellery wording."
    }
  };

  const imageUrl = (path) => {
    if (!path) return "";
    if (/^(https?:|data:|\/|assets\/)/i.test(path)) return path;
    return `assets/images/products/${path}`;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat(state.checkout.locale || "en-IN", {
      style: "currency",
      currency: state.checkout.currency || "INR",
      maximumFractionDigits: 0
    }).format(Number(price) || 0);

  ensureSharedChrome();

  const siteData = window.NURA_SITE_DATA || null;
  const productData = window.NURA_PRODUCTS_DATA || null;
  const checkoutData = window.NURA_CHECKOUT_DATA || null;

  if (siteData && productData && checkoutData) {
    state.site = siteData;
    state.checkout = { ...state.checkout, ...(checkoutData || {}) };
    state.products = productData.products || [];
    state.categories = productData.categories || [];
    state.lookbook = productData.lookbook || [];

    hydrateSeo();
    hydrateSite();
    renderFilters();
    renderProducts();
    renderCheckoutConfig();
    updateCart();
    bindEvents();
    revealOnScroll();
    injectStructuredData();
    handleInitialHash();
    setTimeout(() => $("#loader").addClass("hide"), 650);
  } else {
    $("#loader").addClass("hide");
    $("main").prepend(
      '<section class="section-shell json-warning"><p class="eyebrow">NURA</p><h1>Content is loading.</h1><p>Please refresh the page or open the shop again in a moment.</p></section>'
    );
  }

  function hydrateSeo() {
    const seo = state.site?.seo || {};
    const currentPageMeta = pageMeta[state.page] || pageMeta.home;
    const title = currentPageMeta.title || seo.title;
    const description = currentPageMeta.description || seo.description;
    const canonicalUrl = pageUrl(currentPageMeta.path);

    if (title) document.title = title;
    updateMeta("description", description);
    updateMeta("keywords", seo.keywords);
    updateMeta("robots", "index, follow");
    updateMetaProperty("og:title", title);
    updateMetaProperty("og:description", description);
    updateMetaProperty("og:url", canonicalUrl);
    updateMetaProperty("og:image", absoluteUrl(state.site.brand.logo));
    $("link[rel='canonical']").attr("href", canonicalUrl);
  }

  function hydrateSite() {
    const site = state.site;
    const hero = site.hero;
    const slides = hero.slides || [];

    $("#heroEyebrow").text(hero.eyebrow);
    if (Array.isArray(hero.titleLines) && hero.titleLines.length) {
      $("#heroTitle").html(hero.titleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join(""));
    } else {
      $("#heroTitle").text(hero.title);
    }
    $("#heroCopy").text(hero.copy);
    $("[data-hero-primary]").text(hero.primaryCta).attr("href", hero.primaryHref || "shop.html");
    $("[data-hero-secondary]").text(hero.secondaryCta).attr("href", hero.secondaryHref || "story.html");

    if (slides.length) {
      setHeroSlide(0);
      window.setInterval(() => {
        setHeroSlide((state.heroIndex + 1) % slides.length);
      }, 5200);
    }

    const marqueeItems = [...(site.marquee || []), ...(site.marquee || [])]
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join("");
    $("#marqueeTrack").html(marqueeItems);

    $("#aboutEyebrow").text(site.about?.eyebrow || "About NURA");
    $("#aboutTitle").text(site.about?.title || "Crystal jewellery with everyday meaning.");
    $("#aboutGrid").html(
      (site.about?.cards || [])
        .map(
          (item) => `
            <article class="story-card">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.copy)}</p>
            </article>
          `
        )
        .join("")
    );

    $("#collectionGrid").html(
      (site.collections || [])
        .map(
          (item) => `
            <a class="collection-card" href="${shopHref({ category: item.targetCategory || "all" })}" data-shop-category="${escapeHtml(
            item.targetCategory || "all"
          )}">
              <img src="${imageUrl(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
              <div>
                <p class="eyebrow">${escapeHtml(item.kicker)}</p>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.copy)}</p>
              </div>
            </a>
          `
        )
        .join("")
    );

    $("#processEyebrow").text(site.process?.eyebrow || "How it works");
    $("#processTitle").text(site.process?.title || "Choose, style and order with ease.");
    $("#processGrid").html(
      (site.process?.steps || [])
        .map(
          (item, index) => `
            <article class="process-card">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.copy)}</p>
            </article>
          `
        )
        .join("")
    );

    $("#atelierEyebrow").text(site.atelier.eyebrow);
    $("#atelierTitle").text(site.atelier.title);
    $("#atelierCopy").text(site.atelier.copy);
    $("#atelierStats").html(
      (site.atelier.stats || [])
        .map(
          (stat) => `
            <div class="stat-card">
              <strong>${escapeHtml(stat.value)}</strong>
              <span>${escapeHtml(stat.label)}</span>
            </div>
          `
        )
        .join("")
    );
    $("#atelierStage").html(`
      <div class="orbit-line" aria-hidden="true"></div>
      <a class="floating-piece large" href="${productHref("amethyst-drop-collar")}" data-shop-product="amethyst-drop-collar">
        <img src="${imageUrl(site.atelier.images[0])}" alt="${escapeHtml(site.atelier.title)}" loading="lazy">
      </a>
      <a class="floating-piece small" href="${productHref("bracelet-color-bar")}" data-shop-product="bracelet-color-bar">
        <img src="${imageUrl(site.atelier.images[1])}" alt="${escapeHtml(site.atelier.secondaryAlt)}" loading="lazy">
      </a>
    `);

    $("#lookbookGrid").html(
      state.lookbook
        .map(
          (item) => `
            <a class="lookbook-tile reveal" href="${productHref(item.targetProduct || "")}" data-shop-product="${escapeHtml(item.targetProduct || "")}">
              <img src="${imageUrl(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.caption)}</p>
              </div>
            </a>
          `
        )
        .join("")
    );

    $("#serviceGrid").html(
      (site.services || [])
        .map(
          (item) => `
            <article class="service-card">
              <span aria-hidden="true">${escapeHtml(item.symbol)}</span>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.copy)}</p>
            </article>
          `
        )
        .join("")
    );

    $("#trustEyebrow").text(site.trust?.eyebrow || "Worn, loved and shared");
    $("#trustTitle").text(site.trust?.title || "Made to feel honest, easy and personal.");
    $("#trustCopy").text(site.trust?.copy || "");
    $("#trustBadges").html(
      (site.trust?.badges || [])
        .map((badge) => `<span>${escapeHtml(badge)}</span>`)
        .join("")
    );

    $("#faqGrid").html(
      (site.faqs || [])
        .map(
          (item) => `
            <article class="faq-card">
              <h3>${escapeHtml(item.question)}</h3>
              <p>${escapeHtml(item.answer)}</p>
            </article>
          `
        )
        .join("")
    );

    $("#siteFooter").html(`
      <div class="footer-brand">
        <img src="${imageUrl(site.brand.logo)}" alt="${escapeHtml(site.brand.name)} logo">
        <p>${escapeHtml(site.brand.footerCopy)}</p>
      </div>
      ${(site.footerColumns || [])
        .map(
          (column) => `
            <div class="footer-column">
              <h3>${escapeHtml(column.title)}</h3>
              ${(column.links || [])
              .map((link) => `<a href="${safeHref(link.href)}">${escapeHtml(link.label)}</a>`)
              .join("")}
            </div>
          `
        )
        .join("")}
    `);
  }

  function setHeroSlide(index) {
    const slides = state.site.hero.slides || [];
    const slide = slides[index];
    if (!slide) return;

    state.heroIndex = index;
    $("#heroBg").css("background-image", `url("${imageUrl(slide.image)}")`);
    $("#heroShowcase").html(`
      <article class="hero-card">
        <a class="hero-image-link" href="${productHref(slide.targetProduct || "")}" data-shop-product="${escapeHtml(slide.targetProduct || "")}">
          <img src="${imageUrl(slide.image)}" alt="${escapeHtml(slide.title)}">
        </a>
        <div>
          <p class="eyebrow">${escapeHtml(slide.kicker)}</p>
          <h3>${escapeHtml(slide.title)}</h3>
          <p>${escapeHtml(slide.copy)}</p>
          <div class="slide-controls">
            ${slides
        .map(
          (_, slideIndex) =>
            `<button class="slide-dot ${slideIndex === index ? "active" : ""}" type="button" data-slide="${slideIndex}" aria-label="Show hero slide ${slideIndex + 1
            }"></button>`
        )
        .join("")}
          </div>
        </div>
      </article>
      <aside class="availability-panel">
        <span>Featured price</span>
        <strong>${formatPrice(slide.price)}</strong>
        <span>Drop status</span>
        <strong>${escapeHtml(slide.status)}</strong>
      </aside>
    `);
  }

  function renderFilters() {
    if (!$("#filterPills").length) return;

    $("#filterPills").html(
      state.categories
        .map(
          (category) => `
            <button class="filter-pill ${category.id === state.activeFilter ? "active" : ""
            }" type="button" data-filter="${escapeHtml(category.id)}">
              ${escapeHtml(category.label)}
            </button>
          `
        )
        .join("")
    );
  }

  function getVisibleProducts() {
    const term = state.searchTerm.trim().toLowerCase();
    let list = state.products.filter((product) => {
      const filterMatch = state.activeFilter === "all" || product.category === state.activeFilter;
      const searchMatch =
        !term ||
        [
          product.name,
          product.sku,
          product.category,
          product.categoryLabel,
          product.description,
          product.longDescription,
          product.materials,
          product.care,
          product.shippingNote,
          product.whatsappText,
          product.color,
          product.badge,
          product.stock,
          product.keywords
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return filterMatch && searchMatch;
    });

    if (state.sort === "price-low") {
      list = list.sort((a, b) => a.price - b.price);
    } else if (state.sort === "price-high") {
      list = list.sort((a, b) => b.price - a.price);
    } else if (state.sort === "name") {
      list = list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list = list.sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));
    }

    return list;
  }

  function renderProducts() {
    if (!$("#productGrid").length) return;

    const products = getVisibleProducts();

    if (!products.length) {
      $("#productGrid").html('<p class="cart-empty">No pieces match that search yet.</p>');
      return;
    }

    $("#productGrid").html(
      products
        .map((product) => {
          const isSaved = state.favorites.includes(product.id);
          const isAvailable = product.available !== false;
          return `
            <article class="product-card card" id="product-${escapeHtml(product.id)}" data-id="${escapeHtml(product.id)}">
              <div class="product-media">
                <a class="product-image-button" href="${productHref(product.id)}" data-product-link="${escapeHtml(
            product.id
          )}" aria-label="Open ${escapeHtml(product.name)} details">
                  <img src="${imageUrl(product.image)}" alt="${escapeHtml(product.alt || product.name)}" loading="lazy">
                </a>
                <span class="badge">${escapeHtml(product.badge)}</span>
                <button class="favorite-toggle ${isSaved ? "active" : ""}" type="button" data-favorite="${escapeHtml(
            product.id
          )}" aria-label="${isSaved ? "Remove" : "Save"} ${escapeHtml(product.name)}">&hearts;</button>
                <span class="stock-tag">${escapeHtml(isAvailable ? product.stock : "Unavailable")}</span>
              </div>
              <div class="product-info">
                <span class="product-kicker">${escapeHtml(product.categoryLabel)}</span>
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description)}</p>
                <div class="product-foot">
                  <span class="price">${formatPrice(product.price)}</span>
                  <span>${escapeHtml(product.color)}</span>
                </div>
                <div class="product-actions">
                  <button class="add-to-bag" type="button" data-add="${escapeHtml(product.id)}" ${isAvailable ? "" : "disabled"
            }>Add to bag</button>
                  <button class="buy-now" type="button" data-buy="${escapeHtml(product.id)}" ${isAvailable ? "" : "disabled"
            }>Buy now</button>
                  <a class="quick-open" href="${productHref(product.id)}" data-product-link="${escapeHtml(product.id)}">View</a>
                </div>
              </div>
            </article>
          `;
        })
        .join("")
    );

    requestAnimationFrame(() => {
      $(".product-card").each(function (index) {
        const card = $(this);
        setTimeout(() => card.addClass("visible"), index * 70);
      });
    });
  }

  function renderCheckoutConfig() {
    const checkout = state.checkout;
    $("#checkoutNote").text(checkout.shipping?.note || checkout.paymentNote || "Order details are prepared for India checkout.");
    $("#upiQrImage")
      .attr("src", imageUrl(checkout.upiQrImage))
      .attr("alt", `${checkout.merchantName || "NURA"} UPI QR code`);
    refreshCheckoutLinks();
  }

  function bindEvents() {
    $(window).on("scroll", onScroll);
    $(window).on("hashchange", function () {
      handleInitialHash();
      markActiveNavigation();
    });
    onScroll();
    markActiveNavigation();

    $(document).on("click", ".slide-dot", function () {
      setHeroSlide(Number($(this).data("slide")));
    });

    $(document).on("click", ".filter-pill", function () {
      state.activeFilter = $(this).data("filter");
      state.searchTerm = "";
      syncSearchInputs();
      renderFilters();
      renderProducts();
      revealOnScroll();
    });

    $("#sortProducts").on("change", function () {
      state.sort = $(this).val();
      renderProducts();
    });

    $("#searchInput, #shopSearchInput").on("input", function () {
      state.searchTerm = $(this).val();
      if (state.searchTerm.trim()) {
        state.activeFilter = "all";
        renderFilters();
      }
      syncSearchInputs(this);
      renderProducts();
      if (this.id === "searchInput" && state.searchTerm.trim().length >= 2) {
        window.clearTimeout(bindEvents.headerSearchTimer);
        bindEvents.headerSearchTimer = window.setTimeout(() => {
          $("#searchPanel").removeClass("open");
          goToShop({ search: state.searchTerm });
        }, 450);
      }
    });

    $("#searchInput").on("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        $("#searchPanel").removeClass("open");
        goToShop({ search: state.searchTerm });
      }
    });

    $("#clearSearch").on("click", function () {
      state.searchTerm = "";
      syncSearchInputs();
      renderProducts();
    });

    $(".search-toggle").on("click", function () {
      $("#searchPanel").toggleClass("open");
      if ($("#searchPanel").hasClass("open")) {
        $("#searchInput").trigger("focus");
      }
    });

    $("#menuToggle").on("click", function () {
      $("#mobileMenu").toggleClass("open");
    });

    $("#mobileMenu a").on("click", function () {
      $("#mobileMenu").removeClass("open");
    });

    $(document).on("click", "[data-add]", function () {
      addToCart($(this).data("add"));
    });

    $(document).on("click", "[data-buy]", function () {
      buyNow($(this).data("buy"));
    });

    $(document).on("click", "[data-product-link]", function (event) {
      event.preventDefault();
      showProductInShop($(this).data("product-link"), { openDetails: true, updateHash: true });
    });

    $(document).on("click", "[data-favorite]", function (event) {
      event.stopPropagation();
      toggleFavorite($(this).data("favorite"));
    });

    $(document).on("click", "[data-shop-product]", function (event) {
      const productId = $(this).data("shop-product");
      if (!productId) return;
      event.preventDefault();
      showProductInShop(productId, { updateHash: true });
    });

    $(document).on("click", "[data-shop-category]", function (event) {
      event.preventDefault();
      showCategoryInShop($(this).data("shop-category"));
    });

    $(document).on("mousemove", ".product-card", function (event) {
      const rect = this.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      $(this).css("transform", `translateY(0) rotateX(${(-y / rect.height) * 3}deg) rotateY(${(x / rect.width) * 3}deg)`);
    });

    $(document).on("mouseleave", ".product-card", function () {
      $(this).css("transform", "");
    });

    $("#openCart").on("click", openCart);
    $("#closeCart, #pageScrim").on("click", closeCart);

    $(document).on("click", "[data-increase]", function () {
      changeQuantity($(this).data("increase"), 1);
    });

    $(document).on("click", "[data-decrease]", function () {
      changeQuantity($(this).data("decrease"), -1);
    });

    $(document).on("click", "[data-remove]", function () {
      removeFromCart($(this).data("remove"));
    });

    $("#checkoutDetails input, #checkoutDetails textarea").on("input", function () {
      validateCustomerForm({ quiet: true });
      refreshCheckoutLinks();
    });

    $("#whatsappCheckout").on("click", function (event) {
      if (!validateCheckoutReady("WhatsApp")) {
        event.preventDefault();
        return;
      }
      $(this).attr("href", getWhatsAppUrl("WhatsApp order"));
    });

    $("#upiPayLink").on("click", function (event) {
      if (!validateCheckoutReady("UPI") || !state.checkout.upiId) {
        event.preventDefault();
        showToast(state.checkout.upiId ? "Add customer details first." : "Add the real UPI ID in js/checkout-data.js first.");
        return;
      }
      $(this).attr("href", getUpiUrl());
    });

    $("#upiConfirmWhatsapp").on("click", function (event) {
      if (!validateCheckoutReady("UPI confirmation")) {
        event.preventDefault();
        return;
      }
      $(this).attr("href", getWhatsAppUrl("UPI payment confirmation"));
    });

    $("#closeQuickView").on("click", closeQuickView);

    $("#quickView").on("click", function (event) {
      if (event.target === this) closeQuickView();
    });

    $("#newsletterForm").on("submit", function (event) {
      event.preventDefault();
      showToast("You are on the private NURA drop list.");
      this.reset();
    });
  }

  function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    $("#scrollProgress").css("width", `${progress}%`);
    $("#siteHeader").toggleClass("scrolled", window.scrollY > 20);
    revealOnScroll();
  }

  function revealOnScroll() {
    $(".reveal").each(function () {
      const top = this.getBoundingClientRect().top;
      if (top < window.innerHeight - 70) {
        $(this).addClass("in-view");
      }
    });
  }

  function addToCart(productId, options = {}) {
    const product = findProduct(productId);
    if (!product) return;
    if (product.available === false) {
      showToast(`${product.name} is currently unavailable.`);
      return;
    }

    const existing = state.cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ id: productId, quantity: 1 });
    }
    persistCart();
    updateCart();
    if (!options.silent) showToast(`${product.name} added to bag.`);
  }

  function buyNow(productId) {
    const product = findProduct(productId);
    if (!product) return;
    if (product.available === false) {
      showToast(`${product.name} is currently unavailable.`);
      return;
    }
    addToCart(productId, { silent: true });
    closeQuickView();
    openCart();
    $("#checkoutPanel").addClass("pulse");
    window.setTimeout(() => $("#checkoutPanel").removeClass("pulse"), 900);
    showToast(`${product.name} is ready for checkout.`);
  }

  function changeQuantity(productId, delta) {
    const item = state.cart.find((line) => line.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    persistCart();
    updateCart();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter((item) => item.id !== productId);
    persistCart();
    updateCart();
  }

  function updateCart() {
    const lines = getCartLines();
    if (lines.length !== state.cart.length) {
      state.cart = lines.map((line) => ({ id: line.product.id, quantity: line.quantity }));
      persistCart();
    }

    const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);
    $("#cartCount").text(totalItems);

    if (!lines.length) {
      $("#cartItems").html('<p class="cart-empty">Your bag is ready for a statement piece.</p>');
      $("#cartTotal").text(formatPrice(0));
      $("#upiTotal").text(formatPrice(0));
      refreshCheckoutLinks();
      return;
    }

    $("#cartItems").html(
      lines
        .map(
          (line) => `
            <article class="cart-line">
              <a href="${productHref(line.product.id)}" data-product-link="${escapeHtml(line.product.id)}">
                <img src="${imageUrl(line.product.image)}" alt="${escapeHtml(line.product.alt || line.product.name)}">
              </a>
              <div>
                <h3>${escapeHtml(line.product.name)}</h3>
                <p>${formatPrice(line.product.price)} each</p>
                <div class="quantity-control" aria-label="Quantity controls">
                  <button type="button" data-decrease="${escapeHtml(line.product.id)}">-</button>
                  <span>${line.quantity}</span>
                  <button type="button" data-increase="${escapeHtml(line.product.id)}">+</button>
                </div>
              </div>
              <button class="remove-line" type="button" data-remove="${escapeHtml(line.product.id)}" aria-label="Remove ${escapeHtml(line.product.name)
            }">&times;</button>
            </article>
          `
        )
        .join("")
    );
    $("#cartTotal").text(formatPrice(getCartTotal()));
    $("#upiTotal").text(formatPrice(getCartTotal()));
    refreshCheckoutLinks();
  }

  function toggleFavorite(productId) {
    if (state.favorites.includes(productId)) {
      state.favorites = state.favorites.filter((id) => id !== productId);
    } else {
      state.favorites.push(productId);
    }
    writeStorage(FAVORITES_KEY, state.favorites);
    renderProducts();
  }

  function openQuickView(productId) {
    const product = findProduct(productId);
    if (!product) return;

    $("#quickViewBody").html(`
      <div class="quick-view-media">
        <img src="${imageUrl(product.image)}" alt="${escapeHtml(product.alt || product.name)}">
      </div>
      <div class="quick-view-copy">
        <p class="eyebrow">${escapeHtml(product.categoryLabel)}</p>
        <h2>${escapeHtml(product.name)}</h2>
        <p>${escapeHtml(product.longDescription || product.description)}</p>
        <div class="detail-list">
          <div><span>Price</span><strong>${formatPrice(product.price)}</strong></div>
          <div><span>Materials</span><strong>${escapeHtml(product.materials)}</strong></div>
          <div><span>Color mood</span><strong>${escapeHtml(product.color)}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(product.stock)}</strong></div>
          <div><span>Care</span><strong>${escapeHtml(product.care || "Confirm care details on WhatsApp.")}</strong></div>
        </div>
        <div class="quick-actions">
          <button class="add-to-bag" type="button" data-add="${escapeHtml(product.id)}" ${product.available !== false ? "" : "disabled"
      }>Add to bag</button>
          <button class="buy-now" type="button" data-buy="${escapeHtml(product.id)}" ${product.available !== false ? "" : "disabled"
      }>Buy now</button>
          <a href="${productHref(product.id)}" data-product-link="${escapeHtml(product.id)}">View product</a>
        </div>
      </div>
    `);

    const modal = document.getElementById("quickView");
    if (modal && !modal.open) modal.showModal();
  }

  function closeQuickView() {
    const modal = document.getElementById("quickView");
    if (modal && modal.open) modal.close();
  }

  function openCart() {
    $("#cartDrawer, #pageScrim").addClass("open");
    $("body").addClass("locked");
  }

  function closeCart() {
    $("#cartDrawer, #pageScrim").removeClass("open");
    $("body").removeClass("locked");
  }

  function getCartLines() {
    return state.cart
      .map((item) => {
        const product = findProduct(item.id);
        const quantity = Number(item.quantity) || 0;
        return product && quantity > 0 ? { product, quantity, lineTotal: product.price * quantity } : null;
      })
      .filter(Boolean);
  }

  function getCartTotal() {
    return getCartLines().reduce((sum, line) => sum + line.lineTotal, 0);
  }

  function getCustomerInfo() {
    return {
      name: $("#customerName").val().trim(),
      phone: $("#customerPhone").val().trim(),
      location: $("#customerLocation").val().trim(),
      pincode: $("#customerPincode").val().trim(),
      note: $("#customerNote").val().trim()
    };
  }

  function validateCheckoutReady(label) {
    if (!state.cart.length || !getCartLines().length) {
      showToast("Add at least one product to the bag first.");
      return false;
    }

    if (!validateCustomerForm()) {
      showToast(`Fix the highlighted details for ${label}.`);
      return false;
    }
    return true;
  }

  function validateCustomerForm(options = {}) {
    const customer = getCustomerInfo();
    const cleanPhone = customer.phone.replace(/\D/g, "");
    const hasValidPhone =
      /^(\+91[\s-]?)?[6-9][0-9\s-]{9,13}$/.test(customer.phone) &&
      ((cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)) ||
        (cleanPhone.length === 12 && cleanPhone.startsWith("91") && /^[6-9]/.test(cleanPhone.slice(2))));
    const hasValidPincode = !customer.pincode || /^[1-9][0-9]{5}$/.test(customer.pincode);

    const errors = {
      customerName: customer.name ? "" : "Name is required.",
      customerPhone: hasValidPhone ? "" : "Enter a valid India mobile number.",
      customerLocation: customer.location ? "" : "Delivery location is required.",
      customerPincode: hasValidPincode ? "" : "Enter a valid 6 digit India pincode."
    };

    Object.entries(errors).forEach(([id, message]) => setFieldError(id, message));
    const isValid = Object.values(errors).every((message) => !message);
    if (!isValid && !options.quiet) {
      const firstErrorId = Object.keys(errors).find((id) => errors[id]);
      if (firstErrorId) document.getElementById(firstErrorId)?.focus();
    }
    return isValid;
  }

  function setFieldError(fieldId, message) {
    const field = $(`#${fieldId}`);
    const error = $(`#${fieldId}Error`);
    field.toggleClass("invalid", Boolean(message));
    error.text(message);
  }

  function refreshCheckoutLinks() {
    const total = getCartTotal();
    const hasCart = total > 0;
    $("#whatsappCheckout").attr("href", getWhatsAppUrl("WhatsApp order")).toggleClass("disabled", !hasCart);
    $("#upiConfirmWhatsapp").attr("href", getWhatsAppUrl("UPI payment confirmation")).toggleClass("disabled", !hasCart);

    if (state.checkout.upiId) {
      $("#upiIdDisplay").text(`UPI ID: ${state.checkout.upiId}`);
      $("#upiPayLink").attr("href", getUpiUrl()).attr("aria-disabled", "false").removeClass("disabled");
    } else {
      $("#upiIdDisplay").text("Add UPI ID in js/checkout-data.js before going live.");
      $("#upiPayLink").attr("href", "#").attr("aria-disabled", "true").addClass("disabled");
    }
  }

  function buildWhatsAppMessage(paymentMode) {
    const customer = getCustomerInfo();
    const lines = getCartLines();
    const orderId = `NURA-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now()
      .toString()
      .slice(-6)}`;
    const orderLines = lines
      .map(
        (line, index) =>
          `${index + 1}. ${line.product.name}\nQuantity: ${line.quantity}\nPrice: ${formatPrice(line.product.price)} each\nLine total: ${formatPrice(
            line.lineTotal
          )}\nProduct link: ${productLink(line.product)}\nNote: ${line.product.whatsappText || "Confirm product details before dispatch"}`
      )
      .join("\n\n");

    return [
      `Hello ${state.checkout.merchantName || "NURA Jewellery"}, I want to place an order.`,
      `Order ID: ${orderId}`,
      "",
      "Customer details:",
      `Name: ${customer.name || "-"}`,
      `Phone: ${customer.phone || "-"}`,
      `Delivery location: ${customer.location || "-"}`,
      `Pincode: ${customer.pincode || "-"}`,
      `Notes: ${customer.note || "-"}`,
      "",
      "Products:",
      orderLines || "-",
      "",
      `Grand total: ${formatPrice(getCartTotal())}`,
      `Payment option: ${paymentMode}`,
      state.checkout.shipping?.label ? `Shipping: ${state.checkout.shipping.label}` : "Shipping: India delivery",
      "",
      "Please confirm product availability, delivery charge if any, and payment verification."
    ].join("\n");
  }

  function getWhatsAppUrl(paymentMode) {
    const number = String(state.checkout.whatsappNumber || "").replace(/\D/g, "");
    return `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppMessage(paymentMode))}`;
  }

  function getUpiUrl() {
    const total = getCartTotal();
    const upiId = state.checkout.upiId || "";
    const merchant = state.checkout.merchantName || "NURA Jewellery";
    const note = `NURA order ${Date.now().toString().slice(-6)}`;
    const params = new URLSearchParams({
      pa: upiId,
      pn: merchant,
      am: String(total),
      cu: state.checkout.currency || "INR",
      tn: note
    });
    return `upi://pay?${params.toString()}`;
  }

  function persistCart() {
    state.cart = state.cart.filter((item) => item && item.id && item.quantity > 0);
    writeStorage(CART_KEY, state.cart);
  }

  function findProduct(productId) {
    return state.products.find((product) => product.id === productId);
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.text(message).addClass("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.removeClass("show"), 2200);
  }

  function showProductInShop(productId, options = {}) {
    const product = findProduct(productId);
    if (!product) return;

    if (!hasShopSection()) {
      window.location.href = productHref(productId);
      return;
    }

    state.activeFilter = "all";
    state.searchTerm = "";
    syncSearchInputs();
    renderFilters();
    renderProducts();
    scrollToShop();

    if (options.updateHash && window.history?.pushState) {
      window.history.pushState(null, "", `#product-${productId}`);
    }

    window.setTimeout(() => {
      const card = $(`[data-id="${productId}"]`);
      card.addClass("spotlight");
      if (options.openDetails) openQuickView(productId);
      window.setTimeout(() => card.removeClass("spotlight"), 1800);
    }, 260);
  }

  function showCategoryInShop(categoryId) {
    if (!hasShopSection()) {
      window.location.href = shopHref({ category: categoryId || "all" });
      return;
    }

    state.activeFilter = categoryId || "all";
    state.searchTerm = "";
    syncSearchInputs();
    renderFilters();
    renderProducts();
    scrollToShop();
  }

  function handleInitialHash() {
    const hash = window.location.hash || "";
    if (!hash) return;

    const [targetHash, queryString] = hash.split("?");
    if (targetHash === "#shop" && queryString) {
      const params = new URLSearchParams(queryString);
      const search = params.get("search");
      const category = params.get("category");
      if (category) {
        state.activeFilter = category;
        renderFilters();
        renderProducts();
      }
      if (search) {
        state.activeFilter = "all";
        state.searchTerm = search;
        syncSearchInputs();
        renderFilters();
        renderProducts();
      }
    }

    if (targetHash.startsWith("#product-")) {
      const productId = targetHash.replace("#product-", "");
      if (!hasShopSection()) {
        window.location.href = productHref(productId);
        return;
      }
      window.setTimeout(() => showProductInShop(productId), 300);
      return;
    }

    const target = document.querySelector(targetHash);
    if (target) {
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }

  function scrollToShop() {
    if (!hasShopSection()) {
      window.location.href = shopHref();
      return;
    }

    const targetTop = Math.max(0, $("#shop").offset().top - 92);
    $("html, body").stop(true).animate({ scrollTop: targetTop }, 550);
  }

  function syncSearchInputs(source) {
    const inputs = $("#searchInput, #shopSearchInput");
    if (source) {
      inputs.not(source).val(state.searchTerm);
      return;
    }
    inputs.val(state.searchTerm);
  }

  function productLink(product) {
    return pageUrl(`shop.html#product-${product.id}`);
  }

  function getPublicBaseUrl() {
    const configured = state.checkout.publicSiteUrl || state.site?.seo?.canonicalUrl;
    if (configured) return configured.endsWith("/") ? configured : `${configured}/`;
    const basePath = window.location.pathname.endsWith("/")
      ? window.location.pathname
      : window.location.pathname.replace(/[^/]*$/, "");
    return `${window.location.origin}${basePath}`;
  }

  function pageUrl(path = "") {
    try {
      return new URL(path || "./", getPublicBaseUrl()).href;
    } catch (error) {
      return path || getPublicBaseUrl();
    }
  }

  function shopHref(options = {}) {
    if (options.productId) return `shop.html#product-${encodeURIComponent(options.productId)}`;
    if (options.search) return `shop.html#shop?search=${encodeURIComponent(options.search)}`;
    if (options.category) return `shop.html#shop?category=${encodeURIComponent(options.category)}`;
    return "shop.html#shop";
  }

  function productHref(productId) {
    if (!productId) return "shop.html#shop";
    return hasShopSection() ? `#product-${productId}` : `shop.html#product-${productId}`;
  }

  function goToShop(options = {}) {
    if (!hasShopSection()) {
      window.location.href = shopHref(options);
      return;
    }

    if (options.search) {
      state.activeFilter = "all";
      state.searchTerm = options.search;
      syncSearchInputs();
      renderFilters();
      renderProducts();
    }
    scrollToShop();
  }

  function hasShopSection() {
    return $("#shop").length > 0;
  }

  function absoluteUrl(path) {
    try {
      return new URL(imageUrl(path), getPublicBaseUrl()).href;
    } catch (error) {
      return imageUrl(path);
    }
  }

  function injectStructuredData() {
    const products = state.products.map((product) => ({
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      image: absoluteUrl(product.image),
      description: product.seoDescription || product.longDescription || product.description,
      category: product.categoryLabel,
      brand: {
        "@type": "Brand",
        name: state.site.brand.name
      },
      offers: {
        "@type": "Offer",
        priceCurrency: state.checkout.currency || "INR",
        price: String(product.price),
        availability:
          product.available === false
            ? "https://schema.org/OutOfStock"
            : product.stock === "Limited" || product.stock === "Few left"
              ? "https://schema.org/LimitedAvailability"
              : "https://schema.org/InStock",
        url: productLink(product)
      }
    }));

    const graph = [
      {
        "@type": "Organization",
        name: state.checkout.merchantName || state.site.brand.name,
        url: getPublicBaseUrl(),
        logo: absoluteUrl(state.site.brand.logo),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: state.checkout.whatsappDisplay || "+91 96388 33888",
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "hi"]
        }
      },
      {
        "@type": "WebSite",
        name: state.site.seo?.title || "NURA Jewellery",
        url: getPublicBaseUrl(),
        potentialAction: {
          "@type": "SearchAction",
          target: pageUrl("shop.html#shop?search={search_term_string}"),
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "ItemList",
        name: "NURA Jewellery product collection",
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: product
        }))
      }
    ];

    if (state.page === "faq" && state.site.faqs?.length) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: state.site.faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      });
    }

    $("#nuraStructuredData").remove();
    $("<script>", {
      id: "nuraStructuredData",
      type: "application/ld+json",
      text: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graph
      })
    }).appendTo("head");
  }

  function updateMeta(name, content) {
    if (!content) return;
    let meta = $(`meta[name="${name}"]`);
    if (!meta.length) {
      meta = $("<meta>", { name }).appendTo("head");
    }
    meta.attr("content", content);
  }

  function updateMetaProperty(property, content) {
    if (!content) return;
    let meta = $(`meta[property="${property}"]`);
    if (!meta.length) {
      meta = $("<meta>", { property }).appendTo("head");
    }
    meta.attr("content", content);
  }

  function safeHref(href) {
    const value = String(href || "#");
    if (/^(#|https?:\/\/|mailto:|tel:|\.?\/|[a-z0-9_-]+\.html(?:#.*)?$)/i.test(value)) return escapeHtml(value);
    return "#";
  }

  function ensureSharedChrome() {
    if (!$("#loader").length) {
      $("body").prepend(`
        <div class="loader" id="loader" aria-hidden="true">
          <img src="assets/images/brand/nura-logo.JPG" alt="" />
          <span></span>
        </div>
      `);
    }

    if (!$("#scrollProgress").length) {
      $("#loader").after('<div class="scroll-progress" id="scrollProgress"></div>');
    }

    if (!$("#siteHeader").length) {
      $("#scrollProgress").after(`
        <header class="site-header" id="siteHeader">
          <a class="brand-mark" href="index.html" aria-label="NURA home">
            <img src="assets/images/brand/nura-logo.JPG" alt="NURA logo" />
          </a>

          <nav class="nav-links" aria-label="Primary navigation">
            <a href="story.html" data-nav-page="story">Story</a>
            <a href="shop.html" data-nav-page="shop">Shop</a>
            <a href="story.html#process" data-nav-page="story">How it works</a>
            <a href="lookbook.html" data-nav-page="lookbook">Lookbook</a>
            <a href="faq.html" data-nav-page="faq">FAQ</a>
          </nav>

          <div class="header-actions">
            <button class="icon-button search-toggle" type="button" aria-label="Open search">
              <span></span>
            </button>
            <button class="cart-button" type="button" id="openCart" aria-label="Open cart">
              <span class="cart-dot" id="cartCount">0</span>
              Bag
            </button>
            <button class="menu-toggle" type="button" id="menuToggle" aria-label="Open menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>

        <aside class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation">
          <a href="story.html" data-nav-page="story">Story</a>
          <a href="shop.html" data-nav-page="shop">Shop</a>
          <a href="story.html#process" data-nav-page="story">How it works</a>
          <a href="lookbook.html" data-nav-page="lookbook">Lookbook</a>
          <a href="faq.html" data-nav-page="faq">FAQ</a>
        </aside>

        <div class="search-panel" id="searchPanel" aria-label="Product search">
          <label for="searchInput">Search NURA pieces</label>
          <div>
            <input id="searchInput" type="search" placeholder="Try crystal, bracelet, pendant..." />
            <button type="button" id="clearSearch">Clear</button>
          </div>
        </div>
      `);
    }

    if (!$("#siteFooter").length) {
      $("main").after('<footer class="site-footer" id="siteFooter"></footer>');
    }

    if (!$("#cartDrawer").length) {
      $("body").append(`
        <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping bag">
          <div class="cart-head">
            <div>
              <p class="eyebrow">Your edit</p>
              <h2>Shopping bag</h2>
            </div>
            <button type="button" id="closeCart" aria-label="Close cart">&times;</button>
          </div>
          <div class="cart-items" id="cartItems"></div>
          <div class="cart-total">
            <span>Total</span>
            <strong id="cartTotal">₹0</strong>
          </div>
          <div class="checkout-panel" id="checkoutPanel">
            <div class="checkout-heading">
              <p class="eyebrow">Checkout</p>
              <h3>India payment options</h3>
              <p id="checkoutNote">Add your details once. NURA will receive every product link, quantity and total.</p>
            </div>

            <form class="customer-form" id="checkoutDetails">
              <label>
                <span>Name</span>
                <input id="customerName" type="text" autocomplete="name" placeholder="Customer name" required aria-describedby="customerNameError" />
                <small class="field-error" id="customerNameError"></small>
              </label>
              <label>
                <span>Phone</span>
                <input id="customerPhone" type="tel" autocomplete="tel" placeholder="+91 mobile number" pattern="(\\+91[\\s-]?)?[6-9][0-9\\s-]{9,13}" required aria-describedby="customerPhoneError" />
                <small class="field-error" id="customerPhoneError"></small>
              </label>
              <label class="wide">
                <span>Delivery location</span>
                <textarea id="customerLocation" rows="3" placeholder="Address, city and state" required aria-describedby="customerLocationError"></textarea>
                <small class="field-error" id="customerLocationError"></small>
              </label>
              <label>
                <span>Pincode</span>
                <input id="customerPincode" type="text" inputmode="numeric" autocomplete="postal-code" placeholder="Pincode" pattern="[1-9][0-9]{5}" aria-describedby="customerPincodeError" />
                <small class="field-error" id="customerPincodeError"></small>
              </label>
              <label>
                <span>Notes</span>
                <input id="customerNote" type="text" placeholder="Gift note or timing" />
              </label>
            </form>

            <div class="payment-grid">
              <article class="payment-card">
                <span class="payment-label">1. WhatsApp order</span>
                <h4>Send order to NURA</h4>
                <p>Includes customer details, product links, quantity and total amount.</p>
                <a class="payment-action primary" id="whatsappCheckout" href="#" target="_blank" rel="noopener">Send on WhatsApp</a>
              </article>

              <article class="payment-card upi-card">
                <span class="payment-label">2. Direct UPI</span>
                <h4>Scan and pay</h4>
                <img id="upiQrImage" src="assets/images/payments/upi-qr-placeholder.svg" alt="NURA UPI QR code" />
                <div class="upi-summary">
                  <span>Payable total</span>
                  <strong id="upiTotal">₹0</strong>
                </div>
                <p id="upiIdDisplay">Add UPI ID in js/checkout-data.js before going live.</p>
                <a class="payment-action" id="upiPayLink" href="#" aria-disabled="true">Open UPI app</a>
                <a class="payment-action secondary" id="upiConfirmWhatsapp" href="#" target="_blank" rel="noopener">Confirm on WhatsApp</a>
              </article>
            </div>
          </div>
        </aside>
        <div class="page-scrim" id="pageScrim"></div>

        <dialog class="quick-view" id="quickView">
          <button class="modal-close" type="button" id="closeQuickView" aria-label="Close quick view">&times;</button>
          <div class="quick-view-body" id="quickViewBody"></div>
        </dialog>

        <div class="toast" id="toast" role="status" aria-live="polite"></div>
      `);
    }
  }

  function markActiveNavigation() {
    const currentHash = window.location.hash || "";
    $("[data-nav-page]").each(function () {
      const href = String($(this).attr("href") || "");
      const hrefHash = href.includes("#") ? `#${href.split("#")[1]}` : "";
      const matchesPage = $(this).data("nav-page") === state.page;
      $(this).toggleClass("active", matchesPage && (!hrefHash || hrefHash === currentHash));
    });
  }

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return fallback;
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      showToast("Your browser blocked saving this bag.");
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
