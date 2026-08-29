import "./styles.css";
import { calculateScenario, csvForScenarios, probeCommand, type ScenarioInput } from "./planner";

const slug = "sandbox-capacity-probe";
const licenseKey = `sb_license:${slug}`;
const verdictKey = `sb_license_verdict:${slug}`;
const licenseAttemptKey = `sb_license_verify_attempt:${slug}`;
const scenariosKey = `sb_scenarios:${slug}`;
const demoKey = `demo:${slug}:scenario`;
const billingBase = "https://api.sociobot.in/api/v1";
const demoScenario: ScenarioInput = { containers: 24, ports: 4, mounts: 2, baselineMs: 240, budgetMs: 1500 };

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const inputs = {
  containers: $("#containers") as HTMLInputElement,
  ports: $("#ports") as HTMLInputElement,
  mounts: $("#mounts") as HTMLInputElement,
  baselineMs: $("#baseline") as HTMLInputElement,
  budgetMs: $("#budget") as HTMLInputElement
};

const readInput = (): ScenarioInput => ({
  containers: Number(inputs.containers.value),
  ports: Number(inputs.ports.value),
  mounts: Number(inputs.mounts.value),
  baselineMs: Number(inputs.baselineMs.value),
  budgetMs: Number(inputs.budgetMs.value)
});

const demoMode = new URL(window.location.href).searchParams.get("demo") === "1";
let current = calculateScenario(readInput());
let unlocked = false;

function writeInput(input: ScenarioInput): void {
  inputs.containers.value = String(input.containers);
  inputs.ports.value = String(input.ports);
  inputs.mounts.value = String(input.mounts);
  inputs.baselineMs.value = String(input.baselineMs);
  inputs.budgetMs.value = String(input.budgetMs);
}

function inputError(): string | null {
  const fields: Array<[HTMLInputElement, string, number, number]> = [
    [inputs.baselineMs, "Baseline startup", 1, 60_000],
    [inputs.budgetMs, "p95 budget", 50, 60_000]
  ];
  for (const [field, label, minimum, maximum] of fields) {
    const value = Number(field.value);
    if (!field.value || !Number.isFinite(value) || value < minimum || value > maximum) {
      field.setAttribute("aria-invalid", "true");
      return `${label} must be between ${minimum.toLocaleString()} and ${maximum.toLocaleString()} ms. The last valid estimate remains shown.`;
    }
    field.removeAttribute("aria-invalid");
  }
  return null;
}

function renderPlanner(): void {
  const error = inputError();
  const errorElement = $("#planner-error");
  if (error) {
    errorElement.textContent = error;
    errorElement.hidden = false;
    return;
  }
  errorElement.textContent = "";
  errorElement.hidden = true;
  const input = readInput();
  current = calculateScenario(input);
  $("#container-value").textContent = String(input.containers);
  $("#port-value").textContent = String(input.ports);
  $("#mount-value").textContent = String(input.mounts);
  $("#prediction").textContent = `${current.predictedMs} ms`;
  $("#binding-count").textContent = String(current.bindingPressure);
  $("#headroom").textContent = `${Math.abs(current.headroomMs)} ms ${current.headroomMs >= 0 ? "remaining" : "over"}`;
  const status = $("#status");
  status.textContent = current.status;
  status.dataset.status = current.status;
  $("#planner-summary").textContent = `Planning estimate: ${current.predictedMs} milliseconds p95, ${current.status}, with ${Math.abs(current.headroomMs)} milliseconds ${current.headroomMs >= 0 ? "headroom" : "over budget"}.`;
  $("#generated-command").textContent = probeCommand(input);
}

for (const input of Object.values(inputs)) {
  input.addEventListener("input", () => {
    if (demoMode) localStorage.setItem(demoKey, JSON.stringify(readInput()));
    renderPlanner();
  });
}

$("#planner-form").addEventListener("submit", (event) => event.preventDefault());

function initDemo(): void {
  if (!demoMode) return;
  document.title = "Demo — Sandbox Capacity Probe";
  $("#demo-banner").hidden = false;
  let saved: ScenarioInput | null = null;
  try {
    const value = localStorage.getItem(demoKey);
    saved = value ? (JSON.parse(value) as ScenarioInput) : null;
  } catch {
    saved = null;
  }
  writeInput(saved ?? demoScenario);
  localStorage.setItem(demoKey, JSON.stringify(readInput()));
  $("#reset-demo").addEventListener("click", () => {
    writeInput(demoScenario);
    localStorage.setItem(demoKey, JSON.stringify(demoScenario));
    renderPlanner();
    $("#planner-summary").textContent = "Demo reset to the bundled sample scenario.";
  });
  $("#start-real").addEventListener("click", () => localStorage.removeItem(demoKey));
}

$("#copy-command").addEventListener("click", async () => {
  const button = $("#copy-command") as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText($("#generated-command").textContent ?? "");
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = "Copy command"), 1600);
  } catch {
    button.textContent = "Select command to copy";
  }
});

$("#export-csv").addEventListener("click", () => {
  const input = readInput();
  const csv = csvForScenarios([{ ...input, ...current }]);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "sandbox-capacity-scenario.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

function showLicenseState(valid: boolean, message: string): void {
  unlocked = valid;
  const status = $("#license-status");
  status.textContent = message;
  status.dataset.valid = String(valid);
  $("#pro-tools").hidden = !valid;
  $("#license-form").toggleAttribute("hidden", valid);
}

async function verifyLicense(token: string): Promise<void> {
  const lastAttempt = Number(localStorage.getItem(licenseAttemptKey) ?? "0");
  const retryAfterMs = 60_000 - (Date.now() - lastAttempt);
  if (retryAfterMs > 0) {
    showLicenseState(false, `Too many verification attempts from this browser. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`);
    return;
  }
  localStorage.setItem(licenseAttemptKey, String(Date.now()));
  try {
    const response = await fetch(
      `${billingBase}/products/${slug}/verify?license=${encodeURIComponent(token)}`,
      { headers: { Accept: "application/json" } }
    );
    if (response.status === 429) {
      const seconds = response.headers.get("Retry-After") ?? "60";
      showLicenseState(false, `License verification is rate limited. Try again after ${seconds} seconds.`);
      return;
    }
    if (!response.ok) throw new Error(`verification returned ${response.status}`);
    const verdict = (await response.json()) as { valid: boolean; reason: string; expires_at?: string };
    localStorage.setItem(verdictKey, JSON.stringify({ ...verdict, checked_at: Date.now() }));
    showLicenseState(verdict.valid, verdict.valid ? "Planner Pro is active on this device." : "License no longer active. Paste another license or purchase access.");
  } catch {
    const cached = parseVerdict();
    showLicenseState(Boolean(cached?.valid), cached?.valid ? "Planner Pro is active from the last verified license. Verification is offline." : "Could not verify while offline. The free planner remains available.");
  }
}

function parseVerdict(): { valid: boolean; checked_at: number } | null {
  try {
    const value = localStorage.getItem(verdictKey);
    return value ? (JSON.parse(value) as { valid: boolean; checked_at: number }) : null;
  } catch {
    return null;
  }
}

function initLicense(): void {
  const url = new URL(window.location.href);
  const returnedLicense = url.searchParams.get("license");
  if (returnedLicense) {
    localStorage.setItem(licenseKey, returnedLicense);
    localStorage.removeItem(verdictKey);
    url.searchParams.delete("license");
    history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
  const token = returnedLicense ?? localStorage.getItem(licenseKey);
  const cached = parseVerdict();
  if (cached?.valid) showLicenseState(true, "Planner Pro is active on this device.");
  if (token && (!cached || Date.now() - cached.checked_at > 86_400_000)) void verifyLicense(token);
}

$("#license-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const token = ($("#license-token") as HTMLInputElement).value.trim();
  if (!token) return;
  localStorage.setItem(licenseKey, token);
  $("#license-status").textContent = "Verifying license…";
  void verifyLicense(token);
});

$("#save-scenario").addEventListener("click", () => {
  if (!unlocked) return;
  const scenarios = JSON.parse(localStorage.getItem(scenariosKey) ?? "[]") as Array<ScenarioInput & { predictedMs: number; status: string }>;
  scenarios.push({ ...readInput(), predictedMs: current.predictedMs, status: current.status });
  localStorage.setItem(scenariosKey, JSON.stringify(scenarios.slice(-5)));
  renderSaved();
});

function renderSaved(): void {
  const list = $("#saved-scenarios");
  const scenarios = JSON.parse(localStorage.getItem(scenariosKey) ?? "[]") as Array<ScenarioInput & { predictedMs: number; status: string }>;
  list.replaceChildren();
  if (!scenarios.length) {
    const item = document.createElement("li");
    item.textContent = "No saved scenarios yet. Adjust the map above, then save a contour.";
    list.append(item);
    return;
  }
  for (const scenario of scenarios) {
    const item = document.createElement("li");
    item.textContent = `${scenario.containers} containers × ${scenario.ports} ports — ${scenario.predictedMs} ms (${scenario.status})`;
    list.append(item);
  }
}

function updateConnection(): void {
  const badge = $("#connection-state");
  const online = navigator.onLine;
  badge.textContent = online ? "Online · license checks available" : "Offline · planner and docs still work";
  badge.dataset.online = String(online);
}

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);

initDemo();
renderPlanner();
if (!demoMode) {
  renderSaved();
  initLicense();
} else {
  $("#license-status").textContent = "Demo mode keeps sample data separate. Start for real to restore a license.";
}
updateConnection();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
