(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const desktopBreakpoint = 940;
  const navigationOpenLabel = navToggle ? navToggle.getAttribute("aria-label") : "";
  const navigationCloseLabel = document.documentElement.lang.toLowerCase().startsWith("de")
    ? "Navigation schließen"
    : "Close navigation";

  function updateHeader() {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 10);
    }
  }

  function closeNavigation() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", navigationOpenLabel || "Open navigation");
    document.body.classList.remove("nav-open");
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
      nav.classList.toggle("is-open", willOpen);
      navToggle.setAttribute("aria-expanded", String(willOpen));
      navToggle.setAttribute("aria-label", willOpen ? navigationCloseLabel : navigationOpenLabel);
      document.body.classList.toggle("nav-open", willOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNavigation);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > desktopBreakpoint) closeNavigation();
    });

    document.addEventListener("click", function (event) {
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNavigation();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || navToggle.getAttribute("aria-expanded") !== "true") return;
      closeNavigation();
      navToggle.focus();
    });
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  document.querySelectorAll("[role='tablist']").forEach(function (tabList) {
    const tabs = Array.from(tabList.querySelectorAll("[role='tab']"));

    function activateTab(nextTab, moveFocus) {
      tabs.forEach(function (tab) {
        const selected = tab === nextTab;
        const panelId = tab.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (panel) panel.hidden = !selected;
      });

      if (moveFocus) nextTab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateTab(tab, false);
      });

      tab.addEventListener("keydown", function (event) {
        let nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      });
    });
  });

  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox ? lightbox.querySelector("img") : null;
  const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  function closeLightbox() {
    if (!lightbox) return;
    if (typeof lightbox.close === "function") {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }
    document.body.classList.remove("lightbox-open");
  }

  if (lightbox && lightboxImage) {
    document.querySelectorAll(".gallery-shot").forEach(function (shot) {
      shot.addEventListener("click", function () {
        const image = shot.querySelector("img");
        if (!image) return;
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        if (typeof lightbox.showModal === "function") {
          lightbox.showModal();
        } else {
          lightbox.setAttribute("open", "");
        }
        document.body.classList.add("lightbox-open");
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("close", function () {
      document.body.classList.remove("lightbox-open");
    });
  }

  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (otherItem) {
        if (otherItem !== item) otherItem.removeAttribute("open");
      });
    });
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  document.querySelectorAll("[data-current-year]").forEach(function (item) {
    item.textContent = String(new Date().getFullYear());
  });
})();
