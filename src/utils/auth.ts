const KEY = "melting_user";

export type User = { username: string };

export const login = (username: string, password: string): boolean => {
  if (username === "admin" && password === "admin") {
    localStorage.setItem(KEY, JSON.stringify({ username }));
    return true;
  }
  return false;
};

export const logout = (): void => localStorage.removeItem(KEY);

export const getUser = (): User | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => getUser() !== null;