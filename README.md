# KeyGuard

API key first aid for non-technical employees. This repository currently contains an interactive browser-extension simulation for design review.

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

The encrypted download and one-time share panels are interaction previews. Backend integration begins after the visual review checkpoint.
