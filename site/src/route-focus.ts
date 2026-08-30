const routeFocusKey = "sandbox-capacity-probe:route-focus";

function statusRegion(): HTMLElement {
  const existing = document.querySelector<HTMLElement>("[data-route-status]");
  if (existing) return existing;
  const region = document.createElement("div");
  region.className = "visually-hidden";
  region.dataset.routeStatus = "";
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "true");
  document.body.append(region);
  return region;
}

function routeHeading(): HTMLElement | null {
  if (window.location.hash) {
    const target = document.querySelector<HTMLElement>(window.location.hash);
    if (target) {
      const labelledBy = target.getAttribute("aria-labelledby");
      if (labelledBy) return document.getElementById(labelledBy);
      if (target.matches("h1, h2, h3")) return target;
    }
  }
  return document.querySelector<HTMLElement>("h1");
}

function focusAndAnnounceRoute(): void {
  const heading = routeHeading();
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: false });
  statusRegion().textContent = `${document.title}. ${heading.textContent?.trim() ?? "Page loaded"}.`;
}

export function initRouteFocus(force = false): void {
  statusRegion();
  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    const current = new URL(window.location.href);
    if (destination.pathname === current.pathname && destination.search === current.search) return;
    sessionStorage.setItem(routeFocusKey, "1");
  });

  window.addEventListener("pageshow", (event) => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const requested = sessionStorage.getItem(routeFocusKey) === "1";
    if (!force && !requested && !event.persisted && navigation?.type !== "back_forward") return;
    sessionStorage.removeItem(routeFocusKey);
    requestAnimationFrame(focusAndAnnounceRoute);
  });
}
