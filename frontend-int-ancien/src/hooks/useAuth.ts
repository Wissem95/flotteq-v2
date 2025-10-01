// 📁 clients/src/hooks/useAuth.ts

export function useAuth() {
  if (typeof window === "undefined") return { user: null }; // évite les erreurs SSR/build
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  return { user };
}

