
const USER_AGENT = "srp-hub-mcp/1.0";

function getUrlBase() {
  return (process.env.HUB_API_BASE ?? "http://localhost:3001/v2").replace(/\/$/, "");
}

function getAuthToken() {
    const token = process.env.HUB_API_TOKEN ?? "";

    if (!token) {
        console.error("[srp-hub-mcp] FATAL: HUB_API_TOKEN env var is required but not set.");
        process.exit(1);
    }

    return token;
}

export const HUB_API_BASE = getUrlBase();
export const HUB_API_TOKEN = getAuthToken();

export async function request<R, T>(
  uri: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: R,
): Promise<{ data: T | null; status: number; error?: string }> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
    Authorization: `${HUB_API_TOKEN}`,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(HUB_API_BASE + uri, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 || response.status === 403) {
      return { data: null, status: response.status, error: `Autenticação falhou (${response.status}). Verifique seu HUB_API_TOKEN.` };
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { data: null, status: response.status, error: `HTTP ${response.status}: ${text}` };
    }

    const data = (await response.json()) as T;
    return { data, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[srp-hub-mcp] Request error:", message);
    return { data: null, status: 0, error: message };
  }
}