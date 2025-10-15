/**
 * Enterprise-grade API utilities for UEM system
 * Automatically handles domain/tenant context, error handling, and standardized responses
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    domainId?: number;
    tenantId?: number;
  };
}

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  includeContext?: boolean;
  timeout?: number;
}

export class EnterpriseApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get current domain/tenant headers from context
   */
  private getContextHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get from localStorage for server-side compatibility
    const domainId = localStorage.getItem('selectedDomainId');
    const tenantId = localStorage.getItem('selectedTenantId');

    if (domainId) {
      headers['X-Domain-ID'] = domainId;
    }

    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, window.location.origin + this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Execute HTTP request with enterprise features
   */
  private async executeRequest<T>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      requiresAuth = false,
      includeContext = true,
      timeout = this.defaultTimeout,
      headers: customHeaders = {},
      ...fetchOptions
    } = options;

    try {
      // Build headers
      const baseHeaders: Record<string, string> = {
        'Accept': 'application/json',
      };

      const contextHeaders = includeContext ? this.getContextHeaders() : {};
      
      // Ensure all headers are properly typed as string values
      const headers: Record<string, string> = {
        ...baseHeaders,
        ...contextHeaders,
        ...(customHeaders as Record<string, string>),
      };

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // Use default error message if parsing fails
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        metadata: {
          domainId: headers['X-Domain-ID'] ? parseInt(headers['X-Domain-ID']) : undefined,
          tenantId: headers['X-Tenant-ID'] ? parseInt(headers['X-Tenant-ID']) : undefined,
        },
      };

    } catch (error) {
      let errorMessage = 'Request failed';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET request with tenant context
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return this.executeRequest<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request with tenant context
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request with tenant context
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request with tenant context
   */
  async delete<T>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request with tenant context
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.executeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

// Global instance
export const enterpriseApi = new EnterpriseApiClient();

// Convenience functions for common patterns
export const apiGet = enterpriseApi.get.bind(enterpriseApi);
export const apiPost = enterpriseApi.post.bind(enterpriseApi);
export const apiPut = enterpriseApi.put.bind(enterpriseApi);
export const apiDelete = enterpriseApi.delete.bind(enterpriseApi);
export const apiPatch = enterpriseApi.patch.bind(enterpriseApi);

// Specialized functions for common use cases
export async function getTenantData<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  return apiGet<T>(endpoint, params, { includeContext: true });
}

export async function getGlobalData<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  return apiGet<T>(endpoint, params, { includeContext: false });
}

export async function createTenantResource<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
  return apiPost<T>(endpoint, data, { includeContext: true });
}

export async function updateTenantResource<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
  return apiPut<T>(endpoint, data, { includeContext: true });
}

export async function deleteTenantResource<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiDelete<T>(endpoint, { includeContext: true });
}