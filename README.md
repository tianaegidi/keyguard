# KeyGuard

API key first aid for non-technical employees. This repository contains an interactive browser-extension simulation that intervenes when a provider generates a new API key.

## Privacy posture

- The UI draft has no backend calls, accounts, analytics, or third-party scripts.
- Provider detection runs locally in the browser.
- Practice keys are nonfunctional and clearly marked.
- Encrypted downloads use AES-256-GCM with a key derived locally through 310,000 PBKDF2-SHA-256 rounds.
- Export and import run entirely in the browser; the downloaded file contains ciphertext and encryption parameters, never the plaintext key or provider name.
- The future sharing flow will store only client-side encrypted ciphertext, never plaintext API keys.
- Cloudflare account IDs, OAuth credentials, API tokens, and local Wrangler state are excluded from version control.

## Development

```sh
npm install
npm run dev
```

## Status

The simulated provider generates only nonfunctional practice keys. Encrypted download and local unlock are functional. The one-time share panel remains an interaction preview pending backend integration.
