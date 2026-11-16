# Beauty & Wellness Store (Next.js)
1. `npm install`  2. copy `.env.example` to `.env` and set `DATABASE_URL`
3. `npx prisma migrate dev --name init`  4. `npm run db:seed`  5. `npm run dev`
Sign in at `/admin` with ADMIN_EMAIL / ADMIN_PASSWORD (created by the seed). Set AUTH_SECRET. Change the WhatsApp number in Admin > Settings.
Orders are saved as PENDING/UNPAID; stock is reserved when an admin confirms an order.

## Application routes
The storefront and admin use separate Next.js root layouts. Public pages live in `src/app/(store)` and retain their existing URLs. Admin pages live in `src/app/(admin)/admin`, with an independent, noindex admin layout and a responsive back-office shell. API routes, sitemap/robots metadata routes, and server actions remain outside the route groups.

Admin pages and actions require a server-verified session. Sign in at `/admin/login`; the Products, Orders, and Newsletter subscribers lists are paginated in groups of 20. Newsletter exports are available to signed-in admin users from Marketing.

After pulling this update run `npx prisma migrate dev` to apply pending database migrations. No reseed is required. Image uploads need the three CLOUDINARY_* variables.

## Email
Email delivery uses Resend. Set `RESEND_API_KEY` and a verified sender address in `RESEND_FROM_EMAIL`. Set the Customer Support Email in Admin > Settings > Business identity and legal settings (or the Business email under Contact and social); that address receives website contact messages and new-order notifications. The contact form is available at `/contact`. If email delivery is not configured, checkout still creates the order and logs the notification failure; the contact form reports that it could not send.

Before publishing, open Admin > Settings as an ADMIN and complete the legal business identity, privacy contact, policy version/effective date, delivery areas/estimates, returns/refund details and retention schedules. Replace any remaining policy placeholders and arrange review by a qualified Kenyan advocate. Check the business's ODPC registration obligations and provider/data-transfer details. Retention values are policy disclosures only; order, review and expired rate-limit records are not automatically purged. The current app stores newsletter signups but does not send campaigns, and has no analytics or advertising tags.

postgresql://postgres:postgres@localhost:5432/Wellness