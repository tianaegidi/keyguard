import assert from "node:assert/strict";
import test from "node:test";
import { decryptSecret, encryptSecret } from "./crypto.ts";

test("encrypts and decrypts a secret without exposing plaintext", async () => {
  const secret = "sk-proj-demo_keyguard_roundtrip_not_real";
  const envelope = await encryptSecret(secret, "OpenAI key", "correct horse battery staple");
  const serialized = JSON.stringify(envelope);

  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes("OpenAI key"), false);

  const decrypted = await decryptSecret(serialized, "correct horse battery staple");
  assert.equal(decrypted.secret, secret);
  assert.equal(decrypted.provider, "OpenAI key");
});

test("rejects an incorrect password", async () => {
  const envelope = await encryptSecret("practice-secret", "Demo provider", "right-password");

  await assert.rejects(
    decryptSecret(JSON.stringify(envelope), "wrong-password"),
    /password did not unlock/,
  );
});

test("rejects ciphertext that has been changed", async () => {
  const envelope = await encryptSecret("practice-secret", "Demo provider", "right-password");
  envelope.ciphertext = `${envelope.ciphertext.slice(0, -2)}AA`;

  await assert.rejects(
    decryptSecret(JSON.stringify(envelope), "right-password"),
    /file was changed/,
  );
});
