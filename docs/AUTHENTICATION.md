# Authentication System Guide

## 🟢 Overview

This application uses [Better Auth](https://better-auth.com/) with **Google OAuth Sign-in** for authentication.
The authentication system is designed around a layered approach:
- **Better Auth** manages authentication and sessions.
- **Google OAuth** verifies user identity.
- **`isEmailAllowed()`** is the single allowlist check (email + domain), used by both layers below.
- **`getUserInfo()`** calls it to perform authorization before session creation.
- **Auth route wrapper** handles authentication errors and redirects.
- **`proxy.ts`** calls it again via `isActiveUserAllowed()` to protect private routes (defense-in-depth).
> [!NOTE]
> The main goal is:
> Authenticate users securely while ensuring only approved Google accounts can access protected application features.

## 🟢 Architecture Overview
```text
                 Google OAuth
                      |
                      ▼
              Better Auth Callback
                      |
                      ▼
             Google User Information
                      |
                      ▼
              Authorization Check
                      |
        ┌─────────────┴─────────────┐
        │                           │
     Allowed                    Denied
        │                           │
        ▼                           ▼
 Create Session               Access Denied
        │
        ▼
 Protected Routes
```
This design provides a clean, maintainable authentication foundation that future developers can extend without mixing authentication, authorization, and routing responsibilities.

## Authentication Flow
### 1. User Initiates Sign-in
Users can start authentication from:
- Public pages: eg., `/docs`
- Protected pages eg., `/docs/secrets`

For protected routes, unauthenticated users are redirected to: `/auth/signin`<br>
Example: `/auth/signin?callbackUrl=/docs/secrets`

### 2. Google OAuth Authentication
**Better Auth** redirects users to Google through the custom Google provider implementation in `auth.ts`:
```text
socialProviders.google.getUserInfo()
```
Google returns the user's profile information:
```text
Google ID
Email
Name
Profile Image
Email Verification Status
```

### 3. Authorization Before Session Creation
The most important security decision happens inside `auth.ts` ⟶ `getUserInfo()`.
```text
auth.ts
└── socialProviders.google.getUserInfo()
      └── isEmailAllowed(profile.email)
```
It validates the Google account against the shared allowlist (email + domain) before returning a user.

> `getUserInfo` is the [documented Better Auth hook](https://better-auth.com/docs/concepts/oauth) for rejecting sign-in before a session exists. `mapProfileToUser` cannot reject sign-in (mapping only), and `databaseHooks.user.create.before` only fires on first-time signup — neither covers repeat sign-ins by an already-known user, which is why authorization lives here.

Example flow:
```text
Google Profile Received
          |
          ▼
isEmailAllowed(email)
          |
    ┌─────┴─────┐
    │           │
 Allowed     Denied
    │           │
    ▼           ▼
Continue    Throw AccessDenied
Login       Error
```

#### Why validate here?
The authorization check happens before **session** creation.
This prevents:
- unauthorized sessions
- unnecessary session cleanup
- temporary access before logout

✅ Preferred flow:
```text
Authenticate ⟶ Authorize ⟶ Create Session
```
❌ Avoid:
```text
Authenticate ⟶ Create Session ⟶ Check Authorization ⟶ Logout
```

### 4. Handling Access Denied Errors
**Better Auth** errors are handled in:
```text
/api/auth/[...all]/route.ts
```
Instead of directly exporting the original Better Auth GET and POST handlers:
```typescript
export const { GET, POST } = toNextJsHandler(auth)
```
These handlers are wrapped to intercept authorization errors — both as a thrown `APIError` and as a pre-serialized `403` response, since Better Auth doesn't guarantee which form an internal rejection arrives in. This keeps:
- authorization logic in `auth.ts`
- redirect behavior in the API route handler

Flow:
```text
getUserInfo()
      |
      ▼
throw APIError(FORBIDDEN)  ── or ──  response.status === 403
      |
      ▼
route.ts catches either case
      |
      ▼
Redirect user
/auth/error?error=AccessDenied
```

### 5. Successful Authentication - Session Creation
If the Google account is allowed, the **session** becomes the source of truth for future requests.
```text
Google Profile
      |
      ▼
Better Auth creates user/session
      |
      ▼
Session Cookie Created
      |
      ▼
User Authenticated
```
---
## 🟢 Protected Route Handling
> 💡 Protected routes are enforced in `proxy.ts`

The proxy checks every incoming request.
```text
Request
   ⭣
Is this a private route?
   |
   ├── No
   │     ⭣
   │ Continue
   |
   └── Yes
          ⭣
     Check session
```

>💡 **Note on proxy scope:** `proxy.ts` performs a full session decode + allowlist check on every private-route request, rather than a lightweight cookie-existence check. This is intentional: `getAuthSession()` reads only the signed session cookie — no DB or store lookup — so the per-request cost stays low enough to justify the stronger guarantee (a user removed from the allowlist loses access on their *next* request, not just their next login). If `getAuthSession()` ever starts hitting a DB/session store, this tradeoff should be revisited.

### No Session
If the user is not authenticated:
```text
/private-route
      ⭣
/auth/signin?callbackUrl=/private-route
```

### Invalid Authorization
Even though unauthorized users should never receive sessions, the proxy performs an additional authorization check.
Flow:
```text
Session exists
       |
       ▼
isActiveUserAllowed(session)
       |
       ├── allowed
       │       |
       │       ▼
       │    Continue
       |
       └── denied
               |
               ▼
        /auth/error?error=AccessDenied
```

## 🟢 Route Protection Configuration

### Private Routes

Private routes are defined centrally in the following files:
- `/lib/shared/constants.ts`
- `/lib/shared.ts`

### Public Routes

All routes not listed in `PRIVATE_ROUTES` remain publicly accessible eg.,
```text
/
/docs/characters
/docs/weapons
/docs
```
> A user who fails authentication can still browse public content.


## 🟢 Authentication Components

### `/lib/utils.ts` — `isEmailAllowed()`

Responsibility:
- Single source of truth for the allowlist: checks email + domain
- Normalizes input (lowercase/trim) internally — callers pass raw values
- Called from both `auth.ts` (pre-session) and `session.ts` (post-session)

### `/lib/auth.ts`

Responsibility:
- Configure **Better Auth**
- Configure Google OAuth
- Retrieve Google profile
- Call `isEmailAllowed()`; reject unauthorized users

Should NOT handle:
- route redirects
- page rendering
- middleware logic

### `/api/auth/[...all]/route.ts`

Responsibility:
- Expose Better Auth API routes
- Convert authentication errors into application redirects

Should NOT handle:
- user authorization rules
- route protection

### `proxy.ts`

Responsibility:
- Protect private routes
- Redirect unauthenticated users
- Call `isActiveUserAllowed()` for session authorization

Should NOT handle:
- OAuth callbacks
- Google profile validation

## 🟢 Security Model

The application uses multiple authorization layers, each layer has a specific responsibility.
```text
                 Google OAuth
                      |
                      ▼
          Identity Verification
                      |
                      ▼
        Email Allowlist Validation
                      |
                      ▼
              Session Creation
                      |
                      ▼
             Route Authorization
```

## 🟢 Extending the Authentication System

### A. Adding more allowed users

Update the allowlist source: `isEmailAllowed()` in `/lib/utils.ts`, which reads `getAllowedEmails()` (`ALLOWED_EMAILS` env var) and `getMultipleHostedDomains()` (`ALLOWED_DOMAINS` env var). An empty list on either check allows all — set explicitly to restrict.

Potential expansions could use:
- database table
- admin-managed users table

### B. Supporting additional OAuth providers

- Add another provider in `auth.ts`.
- Example: google, github, microsoft

Each provider should implement the same authorization rule via `isEmailAllowed()`:
```text
Provider Profile
        |
        ▼
isEmailAllowed(profile.email)?
        |
        ▼
Create Session
```

## 🟢 Important Design Decisions

### Why validate before session creation?

Because unauthorized users should never become authenticated users.

Preferred:
```text
Authenticate ⟶ Authorize ⟶ Create Session
```
Avoid:
```text
Authenticate ⟶ Create Session ⟶ Check Authorization ⟶ Logout
```

### Why keep authorization checks in proxy.ts?

Even though OAuth validation already exists, `proxy.ts`:
- protects future changes
- prevents accidental bypasses
- provides centralized route protection

### Why one shared `isEmailAllowed()` instead of two separate checks?
`auth.ts` and `session.ts` previously implemented the allowlist independently, which let their empty-list ("no restriction set") behavior silently diverge. A single shared function, called from both layers, guarantees they can't drift out of sync again.


## 🟢 Developer Checklist

When modifying authentication:

- [ ] Update `auth.ts` for identity/provider changes
- [ ] Update `isEmailAllowed()` in `lib/utils.ts` - `ALLOWED_EMAILS` .env variable for allowlist rules
- [ ] Update `route.ts` for auth error handling
- [ ] Update `proxy.ts` for protected routes
- [ ] Update `lib/constants.ts` -> `privateRoutes` with new private/protected routes
- [ ] Keep public routes accessible
- [ ] Never expose protected pages only through client-side checks
