const TOKEN_KEY = "myreport_token";
const ROLE_KEY = "myreport_role";
const PROFILE_KEY = "myreport_profile";

function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function clearCookie(name) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function persistSession({ token, role, profile }) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile || null));
  setCookie(TOKEN_KEY, token);
  setCookie(ROLE_KEY, role);
}

export function getStoredSession() {
  if (typeof window === "undefined") {
    return {
      token: null,
      role: null,
      profile: null,
    };
  }

  const profileRaw = localStorage.getItem(PROFILE_KEY);
  return {
    token: localStorage.getItem(TOKEN_KEY),
    role: localStorage.getItem(ROLE_KEY),
    profile: profileRaw ? JSON.parse(profileRaw) : null,
  };
}

export function getSessionToken() {
  return getStoredSession().token;
}

export function updateStoredProfile(profile) {
  if (typeof window === "undefined") {
    return;
  }

  const current = getStoredSession();
  const nextProfile = {
    ...(current.profile || {}),
    ...(profile || {}),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }
  clearCookie(TOKEN_KEY);
  clearCookie(ROLE_KEY);
}
