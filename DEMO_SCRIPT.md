# KeyGuard Demo Script

Target length: 6 minutes  
Presenters: Tiana, then Kaia, then Tiana  
Demo URL: https://keyguard-first-aid.aback-profit.workers.dev

## Before the demo

- Open the demo in Chrome and reset it to the initial "Create secret key" screen.
- Allow downloads and clipboard access if the browser asks.
- Clear old `keyguard-*.keyguard` files from Downloads so the new file is easy to find.
- Use `KeyGuard-demo-2026!` as the practice file password. Never demonstrate with a real credential.
- Keep the demo URL open in a backup tab.
- Be explicit that encrypted download is functional, while one-time sharing is currently an interaction preview of the proposed backend.

## Detection catalog

The prototype currently recognizes these common credential families locally:

| Service | Example format recognized by the prototype |
| --- | --- |
| OpenAI | `sk-proj-...` or `sk-...` |
| Anthropic | `sk-ant-...` |
| Hugging Face | `hf_...` |
| GitHub | `ghp_...` or `github_pat_...` |

Production talking point: "We would maintain a curated catalog of popular AI and builder credentials. We started with OpenAI, Anthropic, Hugging Face, and GitHub, then would expand coverage to services such as Gemini, Groq, Replicate, xAI, Supabase, Vercel, and Stripe. Detection rules are non-secret configuration; the credential itself remains local."

## 0:00-0:35 - Tiana: the problem

Action: Show the opening screen. Do not click yet.

Say:

> API keys are now being handed to people who do not think of themselves as developers. They are building with AI tools, following a tutorial, and suddenly a provider shows them a long string once and says, "store it somewhere safe."
>
> The dangerous moment is not later in a security dashboard. It is right now, before that person copies the key into Slack, email, a screenshot, or frontend code. KeyGuard is API-key first aid for that moment.

## 0:35-1:10 - Tiana: act as the user

Action: Point to the simulated provider page and select **Create secret key**.

Say:

> I am going to act like a first-time builder. I create a key for my AI project. This is a deliberately fake practice key, but the page behaves like a provider console.

Action: Pause when KeyGuard interrupts with **Pause before you copy**.

Say:

> KeyGuard notices the newly generated credential before I copy it. It does not silently upload the value. It pauses me, explains the risk in plain language, and gives me a safer next step.

Action: Select **Open safely in KeyGuard**.

## 1:10-2:10 - Tiana: explain detection and privacy

Say:

> Under the hood, the extension compares the value locally against a curated catalog of common credential formats. In this prototype that includes OpenAI, Anthropic, Hugging Face, and GitHub. A production catalog would expand to other popular AI and builder platforms.
>
> The important architecture decision is that recognition happens in the browser. We do not need to send the key to a server just to identify it. Here it recognizes an OpenAI-style key and translates the technical risk into something useful: this is effectively a password with spending access.
>
> KeyGuard then presents three actions instead of one warning people will dismiss: controlled clipboard use, a real encrypted file, or a one-time share.

## 2:10-2:30 - Tiana: hand off to Kaia

Say exactly:

> Detection is only useful if the person can finish their task safely. Kaia is going to take over as the user and show the three ways KeyGuard helps someone move the key without falling back to Slack or a plain-text file. Kaia, start with the fastest path: copy once.

Hand the mouse to Kaia.

## 2:30-3:10 - Kaia: export 1, copy once

Action: Select **Copy once**.

Say:

> The first path is for someone who needs to paste the key directly into one intended secure field. KeyGuard is honest about browser limits: it cannot promise that every browser will erase the clipboard automatically.

Action: Select **Copy key** and point to the 60-second reminder.

Say:

> It copies only after an explicit action, starts a visible reminder, and tells me to paste only into the intended destination.

Action: Select **Clear clipboard now**.

Say:

> When I am finished, this replaces the clipboard contents. If browser permissions block that action, KeyGuard tells the user rather than claiming the key was cleared.

Action: Select **Back**.

## 3:10-4:20 - Kaia: export 2, encrypted file

Action: Select **Encrypted file**.

Say:

> The second path is for saving or handing off a file. This is not a visual mock. The encryption runs in the browser using AES-256-GCM. The password is strengthened with 310,000 PBKDF2 SHA-256 rounds, and neither the password nor plaintext key is sent over the network.

Action: Enter `KeyGuard-demo-2026!` in both password fields and select **Encrypt and download**.

Say:

> The downloaded `.keyguard` file contains a versioned envelope, random salt, initialization vector, encryption parameters, and ciphertext. It does not contain the plaintext key or provider name.

Action: Under **Prove the download works**, choose the file that just downloaded. Enter `KeyGuard-demo-2026!` and select **Unlock locally**.

Say:

> We can import the same file and unlock it locally. AES-GCM verifies integrity too, so the same check rejects a wrong password or a file that has been changed. The recovered value stays masked until the user explicitly copies it.

Action: Optionally select **Copy key**, then select **Back**.

## 4:20-5:10 - Kaia: export 3, share once

Action: Select **Share once**, leave the expiry at **1 hour**, and select **Create preview link**.

Say:

> The third path is for another person. The current demo previews the user experience; this is the part that would use the full Cloudflare backend.
>
> The browser would encrypt first. A Worker would accept ciphertext, KV could hold expiring non-authoritative metadata, and a Durable Object would be the strongly consistent authority that permits only one claim.

Action: Select **Open recipient preview**, then **Reveal once**.

Say:

> Link scanners and chat previews should not consume the secret just by opening the page. The recipient must explicitly reveal it. After that claim, the backend would delete the encrypted payload and reject another reveal.

Action: Close the recipient dialog, select **Open recipient preview** again, and show **This secret is gone**.

Say:

> On the second attempt, it is gone. This consumed state is simulated today; the proposed Durable Object implementation is what would make that atomic in production.

## 5:10-5:20 - Kaia: hand back to Tiana

Say exactly:

> Those are the three paths: use it briefly, save it encrypted, or hand it off once. I will hand it back to Tiana to show how the Cloudflare architecture supports that privacy promise.

Hand the mouse back to Tiana.

## 5:20-6:00 - Tiana: architecture and close

Action: Scroll to the white **Cloudflare architecture** section at the bottom.

Say:

> The prototype you just saw is delivered with Cloudflare Workers and Workers Static Assets, with Wrangler handling the Worker deployment path.
>
> For the full sharing backend, Workers would expose the API. Durable Objects would coordinate the one-time claim. KV would hold only expiring, non-authoritative metadata because it is eventually consistent. R2 could hold larger client-encrypted objects with lifecycle deletion. Turnstile and Workers Rate Limiting would reduce abuse. Cloudflare Access would protect internal tools, and Secrets Store would hold KeyGuard's own operational credentials, never users' captured keys.
>
> The key principle is simple: Cloudflare coordinates ciphertext, while encryption and decryption stay with the people sharing the secret. KeyGuard meets users at the exact moment a key appears and turns a risky copy-paste decision into a safe, understandable workflow.

## If time is cut to 4 minutes

- Keep the opening and detection explanation to 60 seconds.
- Kaia demonstrates clipboard clearing in 25 seconds.
- For encrypted file, download the file but describe import verification instead of selecting it.
- Show the one-time share reveal and consumed state.
- Close with only Workers, Durable Objects, and the client-side encryption boundary.

## Recovery lines

Clipboard permission is blocked:

> The browser blocked clipboard access, and KeyGuard reports that honestly. It never claims the key was copied or cleared when the browser did not allow it.

The downloaded file is hard to locate:

> The encryption has completed and the browser downloaded the ciphertext-only file. The import step proves recovery, but I will continue to the sharing path so we stay on time.

The share preview is reopened in the wrong state:

> This sharing path is an interaction preview. The production guarantee comes from routing every claim for one share ID through the same strongly consistent Durable Object.
