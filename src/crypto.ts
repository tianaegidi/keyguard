const FORMAT = "keyguard-encrypted-secret";
const VERSION = 1;
const ITERATIONS = 310_000;
const ADDITIONAL_DATA = "keyguard:v1";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type EncryptedEnvelope = {
  format: typeof FORMAT;
  version: typeof VERSION;
  encryption: {
    algorithm: "AES-GCM";
    keyLength: 256;
    kdf: "PBKDF2-SHA-256";
    iterations: typeof ITERATIONS;
    salt: string;
    iv: string;
  };
  ciphertext: string;
};

export type DecryptedSecret = {
  secret: string;
  provider: string;
  createdAt: string;
};

function toBase64(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function isEnvelope(value: unknown): value is EncryptedEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<EncryptedEnvelope>;
  return candidate.format === FORMAT
    && candidate.version === VERSION
    && candidate.encryption?.algorithm === "AES-GCM"
    && candidate.encryption.keyLength === 256
    && candidate.encryption.kdf === "PBKDF2-SHA-256"
    && candidate.encryption.iterations === ITERATIONS
    && typeof candidate.encryption.salt === "string"
    && typeof candidate.encryption.iv === "string"
    && typeof candidate.ciphertext === "string";
}

export async function encryptSecret(secret: string, provider: string, password: string): Promise<EncryptedEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const payload: DecryptedSecret = { secret, provider, createdAt: new Date().toISOString() };
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(ADDITIONAL_DATA) },
    key,
    encoder.encode(JSON.stringify(payload)),
  );

  return {
    format: FORMAT,
    version: VERSION,
    encryption: {
      algorithm: "AES-GCM",
      keyLength: 256,
      kdf: "PBKDF2-SHA-256",
      iterations: ITERATIONS,
      salt: toBase64(salt),
      iv: toBase64(iv),
    },
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptSecret(fileContents: string, password: string): Promise<DecryptedSecret> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContents);
  } catch {
    throw new Error("This is not a valid KeyGuard file.");
  }
  if (!isEnvelope(parsed)) throw new Error("This KeyGuard file uses an unsupported format.");

  try {
    const key = await deriveKey(password, fromBase64(parsed.encryption.salt));
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fromBase64(parsed.encryption.iv),
        additionalData: encoder.encode(ADDITIONAL_DATA),
      },
      key,
      fromBase64(parsed.ciphertext),
    );
    const payload = JSON.parse(decoder.decode(plaintext)) as Partial<DecryptedSecret>;
    if (typeof payload.secret !== "string" || typeof payload.provider !== "string" || typeof payload.createdAt !== "string") {
      throw new Error();
    }
    return payload as DecryptedSecret;
  } catch {
    throw new Error("That password did not unlock this file, or the file was changed.");
  }
}
