import "./style.css";

type Provider = {
  name: string;
  mark: string;
  className: string;
  explanation: string;
};

const providers: Array<{ test: (value: string) => boolean; provider: Provider }> = [
  {
    test: (value) => value.startsWith("sk-ant-"),
    provider: {
      name: "Anthropic key",
      mark: "A",
      className: "anthropic",
      explanation: "Anyone who gets it may be able to call Anthropic models through your account—and leave you with the bill.",
    },
  },
  {
    test: (value) => value.startsWith("hf_"),
    provider: {
      name: "Hugging Face token",
      mark: "HF",
      className: "huggingface",
      explanation: "Depending on its permissions, someone could access private resources or use services through your account.",
    },
  },
  {
    test: (value) => value.startsWith("ghp_") || value.startsWith("github_pat_"),
    provider: {
      name: "GitHub token",
      mark: "GH",
      className: "github",
      explanation: "Depending on its permissions, someone could read or change code and account resources you can access.",
    },
  },
  {
    test: (value) => value.startsWith("sk-proj-") || value.startsWith("sk-"),
    provider: {
      name: "OpenAI key",
      mark: "O",
      className: "openai",
      explanation: "Anyone who gets it may be able to call OpenAI models through your account—and leave you with the bill.",
    },
  },
];

const fallbackProvider: Provider = {
  name: "Password-like secret",
  mark: "?",
  className: "unknown",
  explanation: "The format is unfamiliar, but it may still unlock an account or paid service. Treat it like a password.",
};

function select<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const generatedKeyInput = select<HTMLInputElement>("#generated-key");
const generateKeyButton = select<HTMLButtonElement>("#generate-key");
const providerCopyButton = select<HTMLButtonElement>("#provider-copy");
const createKeyCard = select<HTMLElement>("#create-key-card");
const generatedKeyCard = select<HTMLElement>("#generated-key-card");
const extension = select<HTMLElement>("#keyguard-extension");
const alertState = select<HTMLElement>("#alert-state");
const detectedState = select<HTMLElement>("#detected-state");
const actionState = select<HTMLElement>("#action-state");
const inspectKeyButton = select<HTMLButtonElement>("#inspect-key");
const dismissAlertButton = select<HTMLButtonElement>("#dismiss-alert");
const providerIcon = select<HTMLElement>("#provider-icon");
const providerName = select<HTMLElement>("#provider-name");
const providerExplanation = select<HTMLElement>("#provider-explanation");
const actionContent = select<HTMLElement>("#action-content");
const backButton = select<HTMLButtonElement>("#back-button");
const startOver = select<HTMLButtonElement>("#start-over");
const toast = select<HTMLElement>("#toast");
const recipientDialog = select<HTMLDialogElement>("#recipient-dialog");
const recipientContent = select<HTMLElement>("#recipient-content");

let currentProvider = fallbackProvider;
let countdownTimer: number | undefined;
let toastTimer: number | undefined;
let demoShareConsumed = false;

function detectProvider(value: string): Provider {
  return providers.find(({ test }) => test(value))?.provider ?? fallbackProvider;
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function setMainState(state: "alert" | "detected" | "action"): void {
  alertState.hidden = state !== "alert";
  detectedState.hidden = state !== "detected";
  actionState.hidden = state !== "action";
}

function inspectGeneratedKey(): void {
  const value = generatedKeyInput.value;
  currentProvider = detectProvider(value);
  providerName.textContent = currentProvider.name;
  providerExplanation.textContent = currentProvider.explanation;
  providerIcon.textContent = currentProvider.mark;
  providerIcon.className = `provider-icon ${currentProvider.className}`;
  setMainState("detected");
}

function clearSensitiveState(): void {
  generatedKeyInput.value = "";
  actionContent.replaceChildren();
  window.clearInterval(countdownTimer);
  generatedKeyCard.hidden = true;
  createKeyCard.hidden = false;
  extension.hidden = true;
  extension.classList.remove("is-visible");
  generateKeyButton.textContent = "Create secret key";
  demoShareConsumed = false;
}

function showExtensionAlert(): void {
  setMainState("alert");
  extension.hidden = false;
  requestAnimationFrame(() => extension.classList.add("is-visible"));
}

function generatePracticeKey(): void {
  generatedKeyInput.value = `sk-proj-demo_keyguard_${createDemoId()}_not_real`;
  createKeyCard.hidden = true;
  generatedKeyCard.hidden = false;
  generateKeyButton.textContent = "Practice key created";
  showExtensionAlert();
  showToast("KeyGuard detected a newly generated secret");
}

function openAction(action: string): void {
  window.clearInterval(countdownTimer);
  setMainState("action");

  if (action === "copy") renderCopyAction();
  if (action === "download") renderDownloadAction();
  if (action === "share") renderShareAction();
}

function renderCopyAction(): void {
  actionContent.innerHTML = `
    <p class="state-kicker">Safer clipboard</p>
    <h2>Copy, use, then clear.</h2>
    <p class="action-description">Browsers cannot guarantee automatic clipboard deletion. KeyGuard will remind you after 60 seconds and provide a clear button.</p>
    <div class="countdown-card"><span>Clipboard reminder</span><strong id="countdown">01:00</strong></div>
    <button id="copy-key-now" class="panel-primary" type="button">Copy key</button>
    <button id="clear-clipboard" class="panel-secondary" type="button">Clear clipboard now</button>
    <p id="copy-status" class="panel-status" role="status">The timer starts after copying.</p>
  `;

  const copyButton = select<HTMLButtonElement>("#copy-key-now");
  const clearButton = select<HTMLButtonElement>("#clear-clipboard");
  const copyStatus = select<HTMLElement>("#copy-status");
  const countdown = select<HTMLElement>("#countdown");

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(generatedKeyInput.value);
      copyStatus.textContent = "Copied. Paste only into the intended secure field.";
      copyButton.textContent = "Copied";
      let seconds = 60;
      window.clearInterval(countdownTimer);
      countdownTimer = window.setInterval(() => {
        seconds -= 1;
        countdown.textContent = `00:${seconds.toString().padStart(2, "0")}`;
        if (seconds <= 0) {
          window.clearInterval(countdownTimer);
          countdown.textContent = "CLEAR NOW";
          copyStatus.textContent = "Time’s up. Use the button to clear your clipboard.";
        }
      }, 1000);
    } catch {
      copyStatus.textContent = "Clipboard access was blocked. Your key was not copied.";
    }
  });

  clearButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("");
      window.clearInterval(countdownTimer);
      countdown.textContent = "CLEARED";
      copyStatus.textContent = "KeyGuard replaced the clipboard contents in this browser.";
    } catch {
      copyStatus.textContent = "Your browser blocked clipboard clearing. Copy something harmless to replace the key.";
    }
  });
}

function renderDownloadAction(): void {
  actionContent.innerHTML = `
    <p class="state-kicker">Encrypted download</p>
    <h2>Lock it before saving.</h2>
    <p class="action-description">The finished product will encrypt the key in your browser with a password before creating a <code>.keyguard</code> file.</p>
    <label class="panel-label" for="download-password">File password</label>
    <input id="download-password" class="panel-input" type="password" autocomplete="new-password" placeholder="Choose a strong password" />
    <label class="panel-label" for="confirm-password">Confirm password</label>
    <input id="confirm-password" class="panel-input" type="password" autocomplete="new-password" placeholder="Type it again" />
    <button id="preview-download" class="panel-primary" type="button">Preview encrypted download</button>
    <p id="download-status" class="panel-status" role="status">Interactive flow only—no file is created in this draft.</p>
  `;

  const password = select<HTMLInputElement>("#download-password");
  const confirmPassword = select<HTMLInputElement>("#confirm-password");
  const previewButton = select<HTMLButtonElement>("#preview-download");
  const status = select<HTMLElement>("#download-status");

  previewButton.addEventListener("click", () => {
    if (password.value.length < 10) {
      status.textContent = "Use at least 10 characters for this preview.";
      password.focus();
      return;
    }
    if (password.value !== confirmPassword.value) {
      status.textContent = "Those passwords do not match.";
      confirmPassword.focus();
      return;
    }
    password.value = "";
    confirmPassword.value = "";
    status.textContent = "Preview complete: my-key.keyguard would download now, encrypted locally.";
    previewButton.textContent = "Download preview ready ✓";
  });
}

function createDemoId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function renderShareAction(): void {
  actionContent.innerHTML = `
    <p class="state-kicker">One-time share</p>
    <h2>One view. Then gone.</h2>
    <p class="action-description">The final version encrypts on this device. Cloudflare temporarily receives only unreadable ciphertext.</p>
    <label class="panel-label" for="share-expiry">Link expires after</label>
    <select id="share-expiry" class="panel-input">
      <option>10 minutes</option>
      <option selected>1 hour</option>
      <option>24 hours</option>
    </select>
    <button id="generate-link" class="panel-primary" type="button">Create preview link</button>
    <div id="share-result" class="share-result" hidden>
      <label class="panel-label" for="share-url">Preview URL</label>
      <div class="share-url-row"><input id="share-url" readonly /><button id="copy-link" type="button">Copy</button></div>
      <button id="open-preview" class="panel-secondary" type="button">Open recipient preview</button>
      <p class="panel-status">This draft keeps the practice secret only in browser memory.</p>
    </div>
  `;

  const generateButton = select<HTMLButtonElement>("#generate-link");
  const result = select<HTMLElement>("#share-result");
  const shareUrl = select<HTMLInputElement>("#share-url");

  generateButton.addEventListener("click", () => {
    demoShareConsumed = false;
    shareUrl.value = `${window.location.origin}/view/${createDemoId()}#practice-key-stays-local`;
    result.hidden = false;
    generateButton.textContent = "Preview link created ✓";
  });

  actionContent.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "copy-link") {
      try {
        await navigator.clipboard.writeText(shareUrl.value);
        showToast("Preview link copied");
      } catch {
        showToast("Clipboard access was blocked");
      }
    }
    if (target.id === "open-preview") openRecipientPreview();
  });
}

function openRecipientPreview(): void {
  if (demoShareConsumed) {
    recipientContent.innerHTML = `
      <div class="recipient-icon consumed">×</div>
      <p class="state-kicker">Link unavailable</p>
      <h2>This secret is gone.</h2>
      <p>The one-time preview was already claimed. Refreshing or reopening will not reveal it again.</p>
      <button id="close-recipient" class="panel-primary" type="button">Close</button>
    `;
  } else {
    recipientContent.innerHTML = `
      <div class="recipient-icon">K</div>
      <p class="state-kicker">One-time secret</p>
      <h2>Reveal only when you’re ready.</h2>
      <p>Opening the page is safe. The secret is consumed only after this explicit action, so link previews cannot burn it.</p>
      <button id="reveal-secret" class="panel-primary" type="button">Reveal once</button>
      <button id="close-recipient" class="panel-secondary" type="button">Not yet</button>
    `;
  }
  recipientDialog.showModal();
}

function revealDemoSecret(): void {
  demoShareConsumed = true;
  const secret = generatedKeyInput.value;
  recipientContent.innerHTML = `
    <div class="recipient-icon success">✓</div>
    <p class="state-kicker">Copy it now</p>
    <h2>This is the only reveal.</h2>
    <div class="revealed-secret"><code>${secret.replace(/./g, "•")}</code><span>Practice key remains masked in this draft</span></div>
    <p>Closing this window destroys the preview. A real share would also delete its encrypted server copy.</p>
    <button id="close-recipient" class="panel-primary" type="button">I’ve saved it</button>
  `;
}

generateKeyButton.addEventListener("click", generatePracticeKey);

inspectKeyButton.addEventListener("click", inspectGeneratedKey);

dismissAlertButton.addEventListener("click", () => {
  extension.classList.remove("is-visible");
  window.setTimeout(() => {
    extension.hidden = true;
  }, 180);
});

providerCopyButton.addEventListener("click", () => {
  showExtensionAlert();
  showToast("Pause—let KeyGuard prepare the key before copying");
});

document.querySelectorAll<HTMLButtonElement>(".action-button").forEach((button) => {
  button.addEventListener("click", () => openAction(button.dataset.action ?? ""));
});

backButton.addEventListener("click", () => {
  window.clearInterval(countdownTimer);
  setMainState("detected");
});

startOver.addEventListener("click", clearSensitiveState);

recipientContent.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id === "reveal-secret") revealDemoSecret();
  if (target.id === "close-recipient") recipientDialog.close();
});

recipientDialog.addEventListener("click", (event) => {
  if (event.target === recipientDialog) recipientDialog.close();
});

window.addEventListener("pagehide", clearSensitiveState);

const demoState = new URLSearchParams(window.location.search).get("demo");
if (demoState === "key-created" || demoState === "key-inspected") {
  window.setTimeout(generatePracticeKey, 350);
  if (demoState === "key-inspected") window.setTimeout(inspectGeneratedKey, 650);
}
