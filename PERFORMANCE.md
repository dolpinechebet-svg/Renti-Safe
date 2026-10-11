# Performance notes

- App Router pages render as Server Components by default; client code is limited to interactive forms, cookie notice, WhatsApp link, and lazy chat panel.
- Town, campus, and article routes are statically generated; media is private and only loaded on report pages.
- No animation, icon, consent, or chat-widget vendor bundles; the WhatsApp CTA is a normal `wa.me` link.
- Global styling uses a single system font stack, avoiding font downloads and layout shifts.
- Image uploads are resized in the browser before upload; video uploads are limited to 50 MB and show progress.
- Verify the production deployment on mobile using Lighthouse. Targets: performance 90+, LCP <2.5s, CLS <0.1, first-load JS <120 KB. This prototype has not been measured on a deployed Vercel build.
