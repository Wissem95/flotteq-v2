interface UmamiTrackerOptions {
  hostUrl: string;
  websiteId: string;
  domains: string[];
}

const TRACKER_SELECTOR = 'script[data-flotteq-umami]';

export function installUmamiTracker({
  hostUrl,
  websiteId,
  domains,
}: UmamiTrackerOptions): void {
  if (!hostUrl || !websiteId || document.head.querySelector(TRACKER_SELECTOR)) {
    return;
  }

  const script = document.createElement('script');
  script.defer = true;
  script.src = `${hostUrl.replace(/\/+$/, '')}/script.js`;
  script.dataset.websiteId = websiteId;
  script.dataset.domains = domains.join(',');
  script.dataset.flotteqUmami = 'true';
  document.head.appendChild(script);
}
