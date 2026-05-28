"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/* ── types ── */

export interface AccountInfo {
  id: number;
  email: string;
  username: string;
  token: string;
  lastUsed: string; // ISO timestamp
}

interface AuthState {
  user: { id: number; email: string; username: string; balance: number; is_admin: boolean } | null;
  token: string | null;
  loading: boolean;
  accounts: AccountInfo[]; // 所有保存的账户
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  switchAccount: (accountId: number) => Promise<void>;
  removeAccount: (accountId: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/* ── localStorage helpers ── */

const LS_ACCOUNTS = "aiburj_accounts";
const LS_ACTIVE = "aiburj_token";

function loadAccounts(): AccountInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_ACCOUNTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: AccountInfo[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
}

function upsertAccount(account: AccountInfo) {
  const accounts = loadAccounts().filter((a) => a.id !== account.id);
  accounts.unshift({ ...account, lastUsed: new Date().toISOString() });
  // 最多保留 5 个账户
  saveAccounts(accounts.slice(0, 5));
}

function updateAccountLastUsed(accountId: number) {
  const accounts = loadAccounts().map((a) =>
    a.id === accountId ? { ...a, lastUsed: new Date().toISOString() } : a,
  );
  saveAccounts(accounts);
}

/* ── provider ── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);

  // 刷新账户列表
  const refreshAccounts = useCallback(() => {
    setAccounts(loadAccounts());
  }, []);

  // 用 token 获取用户信息
  const fetchUser = useCallback(async (t: string): Promise<AuthState["user"] | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { id: data.id, email: data.email, username: data.username, balance: data.balance, is_admin: data.is_admin };
    } catch {
      return null;
    }
  }, []);

  // 初始化：检查是否有已保存的 token
  useEffect(() => {
    const savedToken = localStorage.getItem(LS_ACTIVE);
    refreshAccounts();

    if (savedToken) {
      fetchUser(savedToken).then((u) => {
        if (u) {
          setUser(u);
          setToken(savedToken);
        } else {
          // token 过期或无效
          localStorage.removeItem(LS_ACTIVE);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [fetchUser, refreshAccounts]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const u = await fetchUser(token);
    if (u) setUser(u);
  }, [token, fetchUser]);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || data?.message || `登录失败 (${res.status})`);
    }

    const data = await res.json();
    const t = data.access_token || data.token;
    if (!t) throw new Error("服务器未返回 token");

    // 获取用户信息
    const u = await fetchUser(t);
    if (!u) throw new Error("获取用户信息失败");

    // 保存 token
    localStorage.setItem(LS_ACTIVE, t);
    // 保存/更新账户
    upsertAccount({ id: u.id, email: u.email, username: u.username, token: t, lastUsed: new Date().toISOString() });

    setToken(t);
    setUser(u);
    refreshAccounts();
  }, [fetchUser, refreshAccounts]);

  // 注册
  const register = useCallback(async (email: string, username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), username: username.trim(), password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || data?.message || `注册失败 (${res.status})`);
    }

    const data = await res.json();
    const t = data.access_token || data.token;
    if (!t) throw new Error("服务器未返回 token");

    const u = await fetchUser(t);
    if (!u) throw new Error("获取用户信息失败");

    localStorage.setItem(LS_ACTIVE, t);
    upsertAccount({ id: u.id, email: u.email, username: u.username, token: t, lastUsed: new Date().toISOString() });

    setToken(t);
    setUser(u);
    refreshAccounts();
  }, [fetchUser, refreshAccounts]);

  // 退出登录
  const logout = useCallback(async () => {
    // 通知后端（fire-and-forget）
    if (token) {
      fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // 忽略网络错误
    }
    localStorage.removeItem(LS_ACTIVE);
    setUser(null);
    setToken(null);
  }, [token]);

  // 切换账户
  const switchAccount = useCallback(async (accountId: number) => {
    const acc = loadAccounts().find((a) => a.id === accountId);
    if (!acc) throw new Error("账户不存在");

    // 先验证 token 是否有效
    const u = await fetchUser(acc.token);
    if (!u) {
      // token 过期，从列表移除
      removeAccountLocal(accountId);
      refreshAccounts();
      throw new Error("账户 token 已过期，请重新登录");
    }

    localStorage.setItem(LS_ACTIVE, acc.token);
    updateAccountLastUsed(accountId);
    setToken(acc.token);
    setUser(u);
    refreshAccounts();
  }, [fetchUser, refreshAccounts]);

  // 移除已保存的账户
  const removeAccount = useCallback((accountId: number) => {
    removeAccountLocal(accountId);
    // 如果移除的是当前账户，同时退出
    if (user?.id === accountId) {
      localStorage.removeItem(LS_ACTIVE);
      setUser(null);
      setToken(null);
    }
    refreshAccounts();
  }, [user, refreshAccounts]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, accounts, login, register, logout, switchAccount, removeAccount, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── hook ── */

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/* ── helper ── */

function removeAccountLocal(accountId: number) {
  const accounts = loadAccounts().filter((a) => a.id !== accountId);
  saveAccounts(accounts);
}
