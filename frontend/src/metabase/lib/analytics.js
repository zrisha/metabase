import Settings from "metabase/lib/settings";
import { isProduction } from "metabase/env";
import { getUser } from "metabase/selectors/user";

export const createTracker = () => {
  if (isTrackingEnabled()) {
    createGoogleAnalyticsTracker();
    document.body.addEventListener("click", handleStructEventClick, true);
  }
};

export const trackPageView = url => {
  if (isTrackingEnabled() && url) {
    trackLoggingDBPageView(url)
    trackGoogleAnalyticsPageView(url);
  }
};

export const trackStructEvent = (category, action, label, value) => {
  if (isTrackingEnabled() && category) {
    trackGoogleAnalyticsStructEvent(category, action, label, value);
    trackLoggingDBStructEvent(category, action, label, value);
  }
};

export const trackSchemaEvent = () => {
  // intentionally blank
};

const isTrackingEnabled = () => {
  return Settings.trackingEnabled();
};

const createGoogleAnalyticsTracker = () => {
  const code = Settings.get("ga-code");
  window.ga?.("create", code, "auto");

  Settings.on("anon-tracking-enabled", enabled => {
    window[`ga-disable-${code}`] = enabled ? null : true;
  });
};

const trackGoogleAnalyticsPageView = url => {
  const version = Settings.get("version", {});
  window.ga?.("set", "dimension1", version.tag);
  window.ga?.("set", "page", url);
  window.ga?.("send", "pageview", url);
};

const trackGoogleAnalyticsStructEvent = (category, action, label, value) => {
  const version = Settings.get("version", {});
  window.ga?.("set", "dimension1", version.tag);
  window.ga?.("send", "event", category, action, label, value);
};

const trackLoggingDBStructEvent = (category, action, label, value) => {
  const user = getUser(window.Metabase.store.getState());
  const user_id = user ? user.id : undefined;
  fetch("/log/activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id,
      activity: { category, action, label, value },
    }),
  }).catch(error => {
    console.log(error);
  });
};

const trackLoggingDBPageView = (url) => {
  const user = getUser(window.Metabase.store.getState());
  const user_id = user ? user.id : undefined;
  fetch("/log/pageview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id,
      url
    }),
  }).catch(error => {
    console.log(error);
  });
};

const handleStructEventClick = event => {
  if (!isTrackingEnabled()) {
    return;
  }

  for (let node = event.target; node != null; node = node.parentNode) {
    if (node.dataset && node.dataset.metabaseEvent) {
      const parts = node.dataset.metabaseEvent.split(";").map(p => p.trim());
      trackStructEvent(...parts);
    }
  }
};
