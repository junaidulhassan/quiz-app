export const STATUS_MESSAGES = {
  connectionLost: "Your connection was lost.",
  backOnline: "You appear to be back online. Select Try again to reload the page.",
  stillOffline: "You're still offline. Check your connection and try again.",
};

export const ERROR_STATES = {
  generic: {
    title: "Something went wrong",
    message: "We couldn't complete your request. Please try again.",
    icon: "alert",
    iconLabel: "Error",
    primary: { label: "Try again", action: "retry" },
  },
  404: {
    title: "Page not found",
    message: "The page you're looking for doesn't exist or may have been moved.",
    icon: "compass",
    iconLabel: "Page not found",
    primary: { label: "Go back", action: "back" },
  },
  500: {
    title: "Something went wrong",
    message: "We couldn't load this page right now. Please try again in a moment.",
    icon: "warning",
    iconLabel: "Warning",
    primary: { label: "Try again", action: "retry" },
  },
  503: {
    title: "Hyeve is temporarily unavailable",
    message: "We're having trouble connecting to Hyeve right now. Please try again shortly.",
    icon: "server",
    iconLabel: "Service unavailable",
    primary: { label: "Try again", action: "retry" },
  },
  offline: {
    title: "You're offline",
    message: "It looks like your internet connection was interrupted. Check your connection and try again.",
    icon: "wifiOff",
    iconLabel: "No internet connection",
    primary: { label: "Try again", action: "retry" },
  },
  timeout: {
    title: "This is taking longer than expected",
    message: "We couldn't complete the request. Please check your connection and try again.",
    icon: "clock",
    iconLabel: "Request timed out",
    primary: { label: "Try again", action: "retry" },
  },
};

export function resolveErrorType(raw) {
  const key = String(raw ?? "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(ERROR_STATES, key) ? key : "generic";
}
