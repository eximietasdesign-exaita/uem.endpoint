import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get the API base URL based on endpoint type
const getApiBaseUrl = (endpoint?: string) => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // In Replit environment, use the current hostname without specifying ports
    // since all APIs are served through the main app on port 5000
    if (hostname.includes('replit.dev') || hostname.includes('replit.app')) {
      return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }
    
    // For local development, use specific ports
    // All APIs are now served on port 5000 (unified architecture)
    return `${protocol}//${hostname}:5000`;
  }
  
  // For Node.js environment (fallback)
  // All APIs are now served on port 5000 (unified architecture)
  return 'http://localhost:5000';
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiBaseUrl(url);
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const baseUrl = getApiBaseUrl(url);
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
