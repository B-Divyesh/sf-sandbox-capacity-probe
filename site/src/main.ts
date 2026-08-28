import "./styles.css";
import { calculateScenario, csvForScenarios, probeCommand, type ScenarioInput } from "./planner";

const slug = "sandbox-capacity-probe";
const licenseKey = `sb_license:${slug}`;
const verdictKey = `sb_license_verdict:${slug}`;
const scenariosKey = `sb_scenarios:${slug}`;
const billingBase = "https://api.sociobot.in/api/v1";

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

let current = calculateScenario(readInput());
let unlocked = false;

function renderPlanner(): void {
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

for (const input of Object.values(inputs)) input.addEventListener("input", renderPlanner);

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
  try {
    const response = await fetch(
      `${billingBase}/products/${slug}/verify?license=${encodeURIComponent(token)}`,
      { headers: { Accept: "application/json" } }
    );
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

renderPlanner();
renderSaved();
initLicense();
updateConnection();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
