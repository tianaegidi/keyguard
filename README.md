# KeyGuard

API key first aid for non-technical employees. This repository contains an interactive browser-extension simulation that intervenes when a provider generates a new API key.

## Privacy posture

- The UI draft has no backend calls, accounts, analytics, or third-party scripts.
- Provider detection runs locally in the browser.
- Practice keys are nonfunctional and clearly marked.
- The final sharing flow will store only client-side encrypted ciphertext, never plaintext API keys.
- Cloudflare account IDs, OAuth credentials, API tokens, and local Wrangler state are excluded from version control.

## Development

```sh
npm install
npm run dev
```

## Status

The simulated provider generates only nonfunctional practice keys. The encrypted download and one-time share panels remain interaction previews pending backend integration.
