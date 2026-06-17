import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, apiGet, apiPost, apiDelete, apiPatch } from '@/src/lib/api/fetcher';

// Hoist mock store
const { mockToken } = vi.hoisted(() => ({ mockToken: vi.fn(() => 'mock-token-123') }));

vi.mock('@/src/stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({ token: mockToken() }),
  },
}));

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  mockToken.mockImplementation(() => 'mock-token-123');
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('api/fetcher', () => {
  it('sends GET with Authorization header from store', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: { id: 1 } }),
    });

    const data = await apiGet<{ id: number }>('/api/test');
    expect(data).toEqual({ id: 1 });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/test');
    expect(init.method).toBe('GET');
    expect(init.headers['Authorization']).toBe('Bearer mock-token-123');
    expect(init.headers['Accept']).toBe('application/json');
  });

  it('skips auth when noAuth is true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: 'ok' }),
    });

    await apiGet('/api/public', { noAuth: true });
    const init = mockFetch.mock.calls[0][1];
    expect(init.headers['Authorization']).toBeUndefined();
  });

  it('sends POST with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      statusText: 'Created',
      text: async () => JSON.stringify({ data: { id: 'new' } }),
    });

    const result = await apiPost<{ id: string }>('/api/items', { name: 'foo' });
    expect(result).toEqual({ id: 'new' });

    const init = mockFetch.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'foo' }));
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('throws ApiError on non-2xx with parsed error envelope', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () =>
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Invalid email' } }),
    });

    let caught: unknown;
    try {
      await apiGet('/api/x');
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ApiError);
    const err = caught as ApiError;
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid email');
  });

  it('returns undefined on 204 No Content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: 'No Content',
      text: async () => '',
    });

    const result = await apiDelete('/api/items/1');
    expect(result).toBeUndefined();
  });

  it('appends query params correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: [] }),
    });

    await apiGet('/api/list', { params: { page: 2, limit: 10, q: 'foo', nullish: null } });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('page=2');
    expect(url).toContain('limit=10');
    expect(url).toContain('q=foo');
    expect(url).not.toContain('nullish');
  });

  it('handles FormData without setting Content-Type', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: { ok: true } }),
    });

    const fd = new FormData();
    fd.append('file', new Blob(['x']), 'test.txt');
    await apiPost('/api/upload', fd);

    const init = mockFetch.mock.calls[0][1];
    expect(init.body).toBe(fd);
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('uses explicit token over store token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: null }),
    });

    await apiGet('/api/x', { token: 'explicit-token' });
    const init = mockFetch.mock.calls[0][1];
    expect(init.headers['Authorization']).toBe('Bearer explicit-token');
  });

  it('sends PATCH and DELETE correctly', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: { ok: true } }),
    });

    await apiPatch('/api/x/1', { name: 'new' });
    expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');

    await apiDelete('/api/x/1');
    expect(mockFetch.mock.calls[1][1].method).toBe('DELETE');
  });

  it('retries on network error up to N times', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({ data: 'ok' }),
    });

    const data = await apiGet('/api/x', { retries: 1 });
    expect(data).toBe('ok');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on ApiError', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => JSON.stringify({ error: { code: 'NOT_FOUND', message: 'gone' } }),
    });

    await expect(apiGet('/api/x', { retries: 3 })).rejects.toBeInstanceOf(ApiError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
