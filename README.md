# RentiSafe

RentiSafe helps renters find authorized, current homes and request independent rental checks before sending a deposit. The app uses Supabase for persistent data, staff authentication, and private inspection media. It does not include fictional rental inventory or a local file database. Rental listings must be added by an administrator and must be authorized and confirmed current.

## Run locally

Requirements: Node.js 20.9 or later and a Supabase project.

1. Copy `.env.example` to `.env.local` and set the Supabase project URL, anon key, service-role key, and a long random `SESSION_SECRET`.
2. In the Supabase SQL editor, run `supabase/schema.sql`.
3. Create staff accounts using **Supabase Dashboard → Authentication → Users**. Copy each user's UUID.
4. Link staff accounts to their roles in the SQL editor:

   ```sql
   insert into public.admin_users (auth_user_id, name)
   values ('SUPABASE_AUTH_USER_UUID', 'Administrator');

   insert into public.agents (auth_user_id, name, phone, town)
   values ('SUPABASE_AUTH_USER_UUID', 'Agent name', '07XXXXXXXX', 'Nairobi');
   ```

   Create one role row per account. Agent town controls the job queue they can access.
   Staff sign in at `/login` with the Auth account email and password. An agent profile created in the admin dashboard must also be linked to that agent's Auth UUID before the agent can sign in.
5. Install dependencies and start the app:

   ```powershell
   npm install
   npm run dev
   ```

6. Open http://localhost:3000. The app will show empty listings and job queues until real records are added. Add only homes you are authorized to market through **Admin dashboard → Housing listings**.

## Supabase and deployment

Set the values in `.env.example` in local development and Vercel. Keep `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` server-only. The SQL schema enables RLS, creates the private `verification-media` storage bucket and installs storage policies. Public rental pages display only listings with `status = 'available'`; admin access requires a Supabase Auth user linked in `admin_users`. Server-side database access uses the service-role key, which bypasses RLS, so the key must never be exposed to the browser and route authorization remains essential.

### Publish a public app link with Vercel

The local development URL (`localhost` or `127.0.0.1`) is only reachable on the computer running the app. To get a link that works on other devices:

1. [Import Renti-Safe into Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdolpinechebet-svg%2FRenti-Safe) and sign in with GitHub.
2. In the Vercel project settings, add the variables listed in `.env.example`. Supabase variables are required for sign-in, saved listings, requests, and inspection uploads. Create the Supabase project and run `supabase/schema.sql` first. Do not add secrets to GitHub.
3. Set `NEXT_PUBLIC_SITE_URL` to the Vercel URL assigned to the project, then deploy. Open that `https://*.vercel.app` URL on other devices.
4. To use `rentisafe.co.ke`, add it under **Vercel → Project → Settings → Domains** and configure the DNS records Vercel provides at the domain registrar. Set `NEXT_PUBLIC_SITE_URL=https://rentisafe.co.ke` and redeploy after the domain is connected.

Without Supabase credentials, the public site can deploy, but database-backed features will not be functional. The domain `rentisafe.co.ke` must also be registered and pointed to Vercel before that address will work.

The tenant request flow still has a **Simulate Payment** control from the prototype. It marks the request paid without collecting money. Do not accept real customer payments until a payment provider such as Safaricom Daraja is integrated, payment callbacks are verified server-side, and this simulated path is disabled in production. Outbound WhatsApp is also a database notification log, not a real message.

## WhatsApp intake prototype

`GET /api/whatsapp/webhook` implements Meta's `hub.mode`, `hub.verify_token`, and `hub.challenge` verification. `POST /api/whatsapp/webhook` accepts Cloud API-shaped text messages and creates an unpaid draft request from a listing link or location and landlord number.

To go live, configure a Meta Business portfolio, WhatsApp Business app and number, webhook URL and verify token, message subscription, access token and phone-number ID. Add webhook signature verification and implement the real send-message API before enabling live messaging. Current outbound messages are stored in Supabase only.

## Website chat

Set `ANTHROPIC_API_KEY` to enable the restricted assistant. Without it, `/api/chat` returns the WhatsApp hand-off message. Requests are rate-limited, length-limited and stored in `chat_logs`. The assistant must not label an individual a scammer; “no flags found” is not proof of safety.

## Data and launch readiness

- Do not create fictional listings, agents, requests, reports, or scam flags. Add real inventory only after obtaining authorization and confirming availability.
- Inspection photos and videos use signed uploads to the private Supabase bucket. Do not publish raw caretaker ID photos; avoid capturing identity documents, obtain lawful authority and consent where required, blur identifiers, and define access and deletion controls before launch.
- Supabase credentials, actual listing details and photos, staffed towns, and payment and messaging provider credentials must be supplied and configured by the operator.
- Turnstile variables are optional and have no effect until server-side token verification is configured.
- The terms, privacy, refund and scam-database policy text in this project is **DRAFT**. A Kenyan lawyer must review it before launch.

## Checks

```powershell
npm run typecheck
npm run lint
npm run build
```

## Performance

See [PERFORMANCE.md](./PERFORMANCE.md) for the performance measures and Lighthouse instructions.
