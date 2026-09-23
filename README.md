# Jelly Forms website

Static HTML, CSS and JavaScript. No build step or package installation is required.

- `index.html`: German website.
- `index-eng.html`: English website.
- `css/styles.css`: shared responsive styles.
- `js/site.js`: navigation, screenshot previews, language links and store availability.
- `images/`: the current jellyfish app icon, Michael’s profile photo, and screenshots of the current Jelly Forms app captured with demo data and German controls. Both pages note the demo data and language; Jelly Forms supports both English and German.

## Publish the Microsoft store link

When the official Jelly Forms listing is live, set `MICROSOFT_STORE_URL` near the top of `js/site.js` to its HTTPS URL. Supported listing hosts are `appsource.microsoft.com`, `marketplace.microsoft.com` and `store.office.com`.

With an empty or invalid URL, the website clearly shows that the store release is pending. With a valid URL, the main calls to action link to the listing and the release notice, getting-started copy and availability FAQ switch to the published state in both languages. Do not use a placeholder listing URL.

The website remains usable without JavaScript: navigation, language switching, feature content, FAQ and links to the full screenshots all work. Store availability defaults to the pending state without JavaScript; update the static links and availability copy in both HTML files at publication if that fallback should also advertise the live listing.

The Jelly Forms app is free; the website distinguishes that from the Microsoft 365 / SharePoint access required to use it.

`LeanFormsCode/` is reference material for the application and is not part of the website implementation. It was not modified for this redesign.

## Brand and personal contact

The Jelly Forms PNG and SVG are copied unchanged from `LeanFormsCode/src/extensions/leanForms/assets/logo2.png` and `form-icon.svg`. The personal profile and photo come from [michael-redl.com](https://michael-redl.com/). Contact details use Michael’s existing business email, `m.redl@michael-redl.com`.

The canonical URLs, sitemap and CNAME continue to use the existing `leanforms.eu` domain. Renaming the app does not change its hosting domain.
