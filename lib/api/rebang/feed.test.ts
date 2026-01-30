import { afterEach, describe, expect, it, vi } from 'vitest';

import api from '@/api';

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('rebang feed api', () => {
    it('fetches json feed from self origin', async () => {
        const fetchMock = vi.fn((input) => {
            const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
            const url = new URL(urlStr);
            expect(url.pathname).toBe('/test');
            expect(url.searchParams.get('format')).toBe('json');

            const body = {
                title: 'Test Feed',
                home_page_url: 'https://example.com',
                items: [
                    {
                        id: '1',
                        title: 'Hello',
                        url: 'https://example.com/1',
                        summary: 'World',
                        date_published: '2020-01-01T00:00:00Z',
                    },
                ],
            };

            return Response.json(body, { status: 200, headers: { 'content-type': 'application/json' } });
        });
        vi.stubGlobal('fetch', fetchMock);

        const response = await api.request('/rebang/feed?path=/test');
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data.items)).toBe(true);
        expect(data.items.length).toBe(1);
        expect(data.title).toBeTruthy();
    });

    it('rejects external urls', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const response = await api.request('/rebang/feed?path=http://evil.com/x');
        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
