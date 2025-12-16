export const api = {
  get: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.statusText}`);
    return res.json();
  },
  post: async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.statusText}`);
    return res.json();
  },
  put: async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${url} failed: ${res.statusText}`);
    return res.json();
  },
  patch: async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${url} failed: ${res.statusText}`);
    return res.json();
  },
  delete: async (url: string) => {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.statusText}`);
    return res.json();
  },
};
