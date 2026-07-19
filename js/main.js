$(function () {
  const state = {
    site: null,
    products: [],
    categories: [],
    lookbook: [],
    activeFilter: "all",
    searchTerm: "",
    sort: "featured",
    heroIndex: 0,
    cart: JSON.parse(localStorage.getItem("nura-cart") || "[]"),
    favorites: JSON.parse(localStorage.getItem("nura-favorites") || "[]")
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price);

  const imageUrl = (path) => path;

  $.when($.getJSON("json/site.json"), $.getJSON("json/products.json"))
    .done(function (siteResponse, productResponse) {
      state.site = siteResponse[0];
      const productData = productResponse[0];
      state.products = productData.products || [];
      state.categories = productData.categories || [];
      state.lookbook = productData.lookbook || [];

      hydrateSite();
      renderFilters();
      renderProducts();
      updateCart();
      bindEvents();
      revealOnScroll();
      setTimeout(() => $("#loader").addClass("hide"), 650);
    })
    .fail(function () {
      $("#loader").addClass("hide");
      $("main").prepend(
        '<section class="section-shell json-warning"><p class="eyebrow">Preview setup</p><h1>Open through GitHub Pages.</h1><p>The browser blocked the JSON product files because this was opened directly from your computer. Once the same folder is published on GitHub Pages, products load normally from <code>json/products.json</code>. For local preview without Node, use the VS Code Live Server extension.</p></section>'
      );
    });

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
    $(".primary-link").text(hero.primaryCta);
    $(".secondary-link").text(hero.secondaryCta);

    if (slides.length) {
      setHeroSlide(0);
      window.setInterval(() => {
        setHeroSlide((state.heroIndex + 1) % slides.length);
      }, 5200);
    }

    const marqueeItems = [...site.marquee, ...site.marquee]
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join("");
    $("#marqueeTrack").html(marqueeItems);

    $("#collectionGrid").html(
      site.collections
        .map(
          (item) => `
            <article class="collection-card">
              <img src="${imageUrl(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
              <div>
                <p class="eyebrow">${escapeHtml(item.kicker)}</p>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.copy)}</p>
              </div>
            </article>
          `
        )
        .join("")
    );

    $("#atelierEyebrow").text(site.atelier.eyebrow);
    $("#atelierTitle").text(site.atelier.title);
    $("#atelierCopy").text(site.atelier.copy);
    $("#atelierStats").html(
      site.atelier.stats
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
      <figure class="floating-piece large">
        <img src="${imageUrl(site.atelier.images[0])}" alt="${escapeHtml(site.atelier.title)}" loading="lazy">
      </figure>
      <figure class="floating-piece small">
        <img src="${imageUrl(site.atelier.images[1])}" alt="${escapeHtml(site.atelier.secondaryAlt)}" loading="lazy">
      </figure>
    `);

    $("#lookbookGrid").html(
      state.lookbook
        .map(
          (item) => `
            <article class="lookbook-tile reveal">
              <img src="${imageUrl(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.caption)}</p>
              </div>
            </article>
          `
        )
        .join("")
    );

    $("#serviceGrid").html(
      site.services
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

    $("#siteFooter").html(`
      <div class="footer-brand">
        <img src="${imageUrl(site.brand.logo)}" alt="${escapeHtml(site.brand.name)} logo">
        <p>${escapeHtml(site.brand.footerCopy)}</p>
      </div>
      ${site.footerColumns
        .map(
          (column) => `
            <div class="footer-column">
              <h3>${escapeHtml(column.title)}</h3>
              ${column.links
                .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
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
    $("#heroBg").css("background-image", `url("${slide.image}")`);
    $("#heroShowcase").html(`
      <article class="hero-card">
        <img src="${imageUrl(slide.image)}" alt="${escapeHtml(slide.title)}">
        <div>
          <p class="eyebrow">${escapeHtml(slide.kicker)}</p>
          <h3>${escapeHtml(slide.title)}</h3>
          <p>${escapeHtml(slide.copy)}</p>
          <div class="slide-controls">
            ${slides
              .map(
                (_, slideIndex) =>
                  `<button class="slide-dot ${slideIndex === index ? "active" : ""}" type="button" data-slide="${slideIndex}" aria-label="Show hero slide ${
                    slideIndex + 1
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
    $("#filterPills").html(
      state.categories
        .map(
          (category) => `
            <button class="filter-pill ${
              category.id === state.activeFilter ? "active" : ""
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
        [product.name, product.category, product.description, product.materials, product.color]
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
    const products = getVisibleProducts();

    if (!products.length) {
      $("#productGrid").html('<p class="cart-empty">No pieces match that search yet.</p>');
      return;
    }

    $("#productGrid").html(
      products
        .map(
          (product) => `
            <article class="product-card" data-id="${escapeHtml(product.id)}">
              <div class="product-media">
                <img src="${imageUrl(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
                <span class="badge">${escapeHtml(product.badge)}</span>
                <button class="favorite-toggle ${
                  state.favorites.includes(product.id) ? "active" : ""
                }" type="button" data-favorite="${escapeHtml(product.id)}" aria-label="Save ${
            escapeHtml(product.name)
          }">&hearts;</button>
                <span class="stock-tag">${escapeHtml(product.stock)}</span>
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
                  <button class="add-to-bag" type="button" data-add="${escapeHtml(product.id)}">Add to bag</button>
                  <button class="quick-open" type="button" data-quick="${escapeHtml(product.id)}">View</button>
                </div>
              </div>
            </article>
          `
        )
        .join("")
    );

    requestAnimationFrame(() => {
      $(".product-card").each(function (index) {
        const card = $(this);
        setTimeout(() => card.addClass("visible"), index * 70);
      });
    });
  }

  function bindEvents() {
    $(window).on("scroll", onScroll);
    onScroll();

    $(document).on("click", ".slide-dot", function () {
      setHeroSlide(Number($(this).data("slide")));
    });

    $(document).on("click", ".filter-pill", function () {
      state.activeFilter = $(this).data("filter");
      renderFilters();
      renderProducts();
      revealOnScroll();
    });

    $("#sortProducts").on("change", function () {
      state.sort = $(this).val();
      renderProducts();
    });

    $("#searchInput").on("input", function () {
      state.searchTerm = $(this).val();
      renderProducts();
    });

    $("#clearSearch").on("click", function () {
      state.searchTerm = "";
      $("#searchInput").val("");
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

    $(document).on("click", "[data-quick]", function () {
      openQuickView($(this).data("quick"));
    });

    $(document).on("click", "[data-favorite]", function () {
      toggleFavorite($(this).data("favorite"));
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

    $("#closeQuickView").on("click", closeQuickView);

    $("#quickView").on("click", function (event) {
      if (event.target === this) closeQuickView();
    });

    $("#newsletterForm").on("submit", function (event) {
      event.preventDefault();
      showToast("You are on the private drop list.");
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

  function addToCart(productId) {
    const existing = state.cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ id: productId, quantity: 1 });
    }
    persistCart();
    updateCart();
    const product = findProduct(productId);
    showToast(`${product.name} added to bag.`);
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
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    $("#cartCount").text(totalItems);

    if (!state.cart.length) {
      $("#cartItems").html('<p class="cart-empty">Your bag is ready for a statement piece.</p>');
      $("#cartTotal").text(formatPrice(0));
      return;
    }

    let total = 0;
    $("#cartItems").html(
      state.cart
        .map((item) => {
          const product = findProduct(item.id);
          if (!product) return "";
          total += product.price * item.quantity;
          return `
            <article class="cart-line">
              <img src="${imageUrl(product.image)}" alt="${escapeHtml(product.name)}">
              <div>
                <h3>${escapeHtml(product.name)}</h3>
                <p>${formatPrice(product.price)} each</p>
                <div class="quantity-control" aria-label="Quantity controls">
                  <button type="button" data-decrease="${escapeHtml(product.id)}">-</button>
                  <span>${item.quantity}</span>
                  <button type="button" data-increase="${escapeHtml(product.id)}">+</button>
                </div>
              </div>
              <button class="remove-line" type="button" data-remove="${escapeHtml(product.id)}" aria-label="Remove ${
            escapeHtml(product.name)
          }">&times;</button>
            </article>
          `;
        })
        .join("")
    );
    $("#cartTotal").text(formatPrice(total));
  }

  function toggleFavorite(productId) {
    if (state.favorites.includes(productId)) {
      state.favorites = state.favorites.filter((id) => id !== productId);
    } else {
      state.favorites.push(productId);
    }
    localStorage.setItem("nura-favorites", JSON.stringify(state.favorites));
    renderProducts();
  }

  function openQuickView(productId) {
    const product = findProduct(productId);
    if (!product) return;

    $("#quickViewBody").html(`
      <div class="quick-view-media">
        <img src="${imageUrl(product.image)}" alt="${escapeHtml(product.name)}">
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
        </div>
        <button class="add-to-bag" type="button" data-add="${escapeHtml(product.id)}">Add to bag</button>
      </div>
    `);

    document.getElementById("quickView").showModal();
  }

  function closeQuickView() {
    document.getElementById("quickView").close();
  }

  function openCart() {
    $("#cartDrawer, #pageScrim").addClass("open");
    $("body").addClass("locked");
  }

  function closeCart() {
    $("#cartDrawer, #pageScrim").removeClass("open");
    $("body").removeClass("locked");
  }

  function persistCart() {
    localStorage.setItem("nura-cart", JSON.stringify(state.cart));
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
