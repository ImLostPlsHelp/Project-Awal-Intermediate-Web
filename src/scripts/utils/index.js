export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function getTokenOrRedirect() {
  const token = localStorage.getItem("token");
  if (!token) {
    location.hash = "#/login";
    return null;
  }
  return token;
}