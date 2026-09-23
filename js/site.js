(function () {
  "use strict";

  // After publication, set this to the official Jelly Forms Microsoft listing URL.
  // Leave empty while the listing is pending; all download links then show the release status.
  const MICROSOFT_STORE_URL = "";

  const isGerman = document.documentElement.lang.toLowerCase().startsWith("de");
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const desktopBreakpoint = 980;

  if (nav && navToggle) {
    const openLabel = navToggle.getAttribute("aria-label") ||
      (isGerman ? "Navigation öffnen" : "Open navigation");
    const closeLabel = navToggle.dataset.closeLabel ||
      (isGerman ? "Navigation schließen" : "Close navigation");

    function setNavigationOpen(open) {
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? closeLabel : openLabel);
      document.body.classList.toggle("nav-open", open);
    }

    navToggle.addEventListener("click", function () {
      setNavigationOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavigationOpen(false);
      });
    });

    document.addEventListener("click", function (event) {
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      setNavigationOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || navToggle.getAttribute("aria-expanded") !== "true") return;
      setNavigationOpen(false);
      navToggle.focus();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > desktopBreakpoint) setNavigationOpen(false);
    });

    // Mobile navigation remains visible until its controls are ready to use.
    if (header) header.classList.add("nav-ready");
  }

  const dialog = document.getElementById("screenshot-dialog");
  const dialogImage = dialog && dialog.querySelector(".lightbox-image");
  const dialogCaption = dialog && dialog.querySelector(".lightbox-caption");
  const dialogClose = dialog && dialog.querySelector(".lightbox-close");
  let screenshotTrigger = null;

  // The original image links remain usable when native dialogs are unavailable.
  if (dialog && dialogImage && typeof dialog.showModal === "function") {
    function restoreScreenshotPage() {
      // A queued close event must not clear a subsequently reopened dialog.
      if (dialog.open) return;
      document.body.classList.remove("modal-open");
      if (screenshotTrigger && screenshotTrigger.isConnected) {
        screenshotTrigger.focus({ preventScroll: true });
      }
      screenshotTrigger = null;
    }

    function closeScreenshot() {
      if (dialog.open) dialog.close();
      restoreScreenshotPage();
    }

    document.querySelectorAll("a.screenshot-link").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (dialog.open) return;
        const image = link.querySelector("img");
        dialogImage.src = link.href;
        dialogImage.alt = image ? image.alt : "";
        if (dialogCaption) dialogCaption.textContent = link.dataset.caption || dialogImage.alt;
        dialog.showModal();
        event.preventDefault();
        screenshotTrigger = link;
        document.body.classList.add("modal-open");
        if (dialogClose) dialogClose.focus({ preventScroll: true });
      });
    });

    if (dialogClose) {
      dialogClose.addEventListener("click", closeScreenshot);
    }

    dialog.addEventListener("click", function (event) {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) {
        closeScreenshot();
      }
    });

    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeScreenshot();
    });

    // Retain cleanup for any other native or programmatic dismissal.
    dialog.addEventListener("close", restoreScreenshotPage);
  }

  const languageLinks = Array.from(document.querySelectorAll(".language-link")).map(function (link) {
    return { link: link, href: link.getAttribute("href") };
  });

  function updateLanguageLinks() {
    let section = null;
    try {
      section = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    } catch (_) {
      // An invalid URL fragment should not interrupt the rest of the page.
    }
    languageLinks.forEach(function (item) {
      const url = new URL(item.href, document.baseURI);
      url.hash = section ? window.location.hash : "";
      item.link.href = url.href;
    });
  }

  window.addEventListener("hashchange", updateLanguageLinks);
  updateLanguageLinks();

  let storeUrl = null;
  try {
    const candidate = new URL(MICROSOFT_STORE_URL);
    const microsoftHosts = ["appsource.microsoft.com", "marketplace.microsoft.com", "store.office.com"];
    if (candidate.protocol === "https:" && microsoftHosts.includes(candidate.hostname) &&
        !candidate.username && !candidate.password && !candidate.port) {
      storeUrl = candidate.href;
    }
  } catch (_) {
    // An empty or invalid listing keeps the accurate, pending-release state.
  }

  if (storeUrl) {
    document.querySelectorAll("[data-store-link]").forEach(function (link) {
      link.href = storeUrl;
      if (link.dataset.liveLabel) link.textContent = link.dataset.liveLabel;
    });
    document.querySelectorAll("[data-store-pending]").forEach(function (item) {
      item.hidden = true;
    });
    document.querySelectorAll("[data-store-live]").forEach(function (item) {
      item.hidden = false;
    });
  }

  document.querySelectorAll("[data-current-year]").forEach(function (item) {
    item.textContent = String(new Date().getFullYear());
  });
})();

(function () {
  "use strict";
  const form = document.getElementById("contact-form");
  if (!form || !window.fetch || !window.AbortController) return;
  const german = document.documentElement.lang.toLowerCase().startsWith("de");
  const panel = document.querySelector("[data-contact-panel]");
  const fields = form.querySelector("fieldset");
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById("contact-form-status");
  const buttonText = button.textContent;
  let sending = false;
  panel.hidden = false;
  function setStatus(state, message) {
    status.dataset.state = state;
    status.textContent = message;
  }
  form.addEventListener("input", function (event) {
    if (typeof event.target.setCustomValidity === "function") event.target.setCustomValidity("");
  });
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (sending) return;
    for (const input of form.querySelectorAll("input, textarea")) {
      input.setCustomValidity(input.value.trim() ? "" : (german ? "Bitte fülle dieses Feld aus." : "Please fill in this field."));
    }
    if (!form.reportValidity()) return;
    const value = name => form.elements.namedItem(name).value.trim();
    // Keep the exact contract used by OtherWebsite/js/custom.js (HttpTrigger2).
    const requestData = {
      Betreff: value("subject"), Anschreiben: value("description"),
      Vorname: value("vorname"), Nachname: value("nachname"), Firma: value("firma"),
      Telefonnummer: value("phone"), Mail: value("email")
    };
    sending = true;
    fields.disabled = true;
    form.setAttribute("aria-busy", "true");
    button.textContent = german ? "Wird gesendet …" : "Sending …";
    setStatus("sending", german ? "Deine Nachricht wird gesendet." : "Sending your message.");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("https://websiteform.azurewebsites.net/api/HttpTrigger2", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData), signal: controller.signal
      });
      if (!response.ok) throw new Error("Contact request failed");
      form.reset();
      setStatus("success", german ? "Danke! Deine Nachricht wurde gesendet." : "Thank you! Your message has been sent.");
    } catch (_) {
      setStatus("error", german
        ? "Der Versand konnte nicht bestätigt werden. Deine Eingaben bleiben erhalten. Du kannst es erneut versuchen oder mir an m.redl@michael-redl.com schreiben."
        : "Delivery could not be confirmed. Your entries have been kept. You can try again or email me at m.redl@michael-redl.com.");
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      fields.disabled = false;
      form.removeAttribute("aria-busy");
      button.textContent = buttonText;
    }
  });
})();
