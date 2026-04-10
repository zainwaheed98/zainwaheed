(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var headerH = header ? header.offsetHeight : 72;
  var nav = document.querySelector(".nav");
  var navLinks = document.querySelectorAll(".nav__link[href^='#']");
  var sections = document.querySelectorAll("main section[id]");
  var themeToggle = document.querySelector(".theme-toggle");
  var cursorGlow = document.querySelector(".cursor-glow");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Page load */
  function onReady() {
    document.body.classList.add("is-loaded");
    if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
      document.body.classList.add("has-cursor-glow");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  /* Theme */
  var storageKey = "zw-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(storageKey, value);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored === "dark") {
      applyTheme("dark");
      return;
    }
    if (stored === "light") {
      applyTheme("light");
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    }
  }

  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var root = document.documentElement;
      var isDark = root.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      document.body.classList.add("theme-transitioning");
      applyTheme(next);
      setStoredTheme(next);
      window.setTimeout(function () {
        document.body.classList.remove("theme-transitioning");
      }, 400);
    });
  }

  /* Smooth scroll with offset for fixed header */
  function scrollToHash(hash, push) {
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    var y = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
    window.scrollTo({ top: Math.max(0, y), behavior: prefersReducedMotion ? "auto" : "smooth" });
    if (push !== false && history.pushState) {
      history.pushState(null, "", hash);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      scrollToHash(href, true);
      if (nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        var toggle = document.querySelector(".nav__toggle");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
        }
      }
    });
  });

  if (window.location.hash) {
    window.setTimeout(function () {
      scrollToHash(window.location.hash, false);
    }, 100);
  }

  /* Section spy — active nav link */
  function updateActiveNav() {
    var scrollPos = window.scrollY + headerH + 80;
    var current = "";
    sections.forEach(function (sec) {
      var top = sec.offsetTop;
      if (scrollPos >= top) {
        current = "#" + sec.getAttribute("id");
      }
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      link.classList.toggle("is-active", href === current);
    });
  }

  var spyTicking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!spyTicking) {
        window.requestAnimationFrame(function () {
          updateActiveNav();
          spyTicking = false;
        });
        spyTicking = true;
      }
    },
    { passive: true }
  );
  updateActiveNav();

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Gallery filter */
  var filters = document.querySelectorAll(".filter[data-filter]");
  var galleryItems = document.querySelectorAll("#project-gallery .gallery__item");

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filters.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      galleryItems.forEach(function (item) {
        var itemCat = item.getAttribute("data-category");
        var show = cat === "all" || itemCat === cat;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* Mobile nav */
  var navToggle = document.querySelector(".nav__toggle");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  /* Cursor glow */
  if (cursorGlow && !prefersReducedMotion) {
    var gx = window.innerWidth / 2;
    var gy = window.innerHeight / 2;
    var tx = gx;
    var ty = gy;
    var animating = false;

    function stepGlow() {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      cursorGlow.style.transform = "translate(" + gx + "px, " + gy + "px)";
      if (Math.abs(tx - gx) > 0.8 || Math.abs(ty - gy) > 0.8) {
        window.requestAnimationFrame(stepGlow);
      } else {
        animating = false;
      }
    }

    window.addEventListener(
      "mousemove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        if (!animating) {
          animating = true;
          window.requestAnimationFrame(stepGlow);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      function () {
        tx = gx = window.innerWidth / 2;
        ty = gy = window.innerHeight / 2;
        cursorGlow.style.transform = "translate(" + gx + "px, " + gy + "px)";
      },
      { passive: true }
    );

    cursorGlow.style.transform = "translate(" + gx + "px, " + gy + "px)";
  }

  /* Resize — header height */
  window.addEventListener(
    "resize",
    function () {
      if (header) headerH = header.offsetHeight;
    },
    { passive: true }
  );

  /* Work modal — full design + description */
  var workModal = document.getElementById("work-modal");
  var workModalImg = workModal ? workModal.querySelector(".work-modal__img") : null;
  var workModalTitle = document.getElementById("work-modal-title");
  var workModalLabel = document.getElementById("work-modal-label");
  var workModalCopy = document.getElementById("work-modal-copy");
  var modalCloseEls = workModal ? workModal.querySelectorAll("[data-modal-close]") : [];
  var lastFocusedEl = null;
  var modalImgPlaceholder =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600'/%3E";

  function openWorkModal(article) {
    if (!workModal || !workModalImg || !workModalTitle || !workModalLabel || !workModalCopy) return;
    var trigger = article.querySelector(".gallery__link");
    var detail = article.querySelector(".gallery__detail");
    var thumb = article.querySelector(".gallery__media img");
    var nameEl = article.querySelector(".gallery__name");
    var labelEl = article.querySelector(".gallery__label");
    if (!trigger || !detail || !thumb || !nameEl || !labelEl) return;

    var fullSrc = trigger.getAttribute("data-full-src");
    if (!fullSrc) return;

    lastFocusedEl = document.activeElement;
    workModalImg.src = fullSrc;
    workModalImg.alt = thumb.getAttribute("alt") || "";
    workModalTitle.textContent = nameEl.textContent.trim();
    workModalLabel.textContent = labelEl.textContent.trim();
    workModalCopy.innerHTML = detail.innerHTML;

    workModal.removeAttribute("hidden");
    document.body.classList.add("modal-open");

    var closeBtn = workModal.querySelector(".work-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeWorkModal() {
    if (!workModal || !workModalImg) return;
    workModal.setAttribute("hidden", "");
    workModalImg.src = modalImgPlaceholder;
    workModalImg.alt = "";
    document.body.classList.remove("modal-open");
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
    lastFocusedEl = null;
  }

  var projectGallery = document.getElementById("project-gallery");
  if (projectGallery && workModal) {
    projectGallery.addEventListener("click", function (e) {
      var trigger = e.target.closest(".gallery__link");
      if (!trigger || !projectGallery.contains(trigger)) return;
      e.preventDefault();
      var article = trigger.closest(".gallery__item");
      if (article) openWorkModal(article);
    });
  }

  modalCloseEls.forEach(function (el) {
    el.addEventListener("click", function () {
      closeWorkModal();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && workModal && !workModal.hasAttribute("hidden")) {
      closeWorkModal();
    }
  });
})();
