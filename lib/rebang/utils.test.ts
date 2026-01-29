import { describe, expect, it } from 'vitest';

import { toUiItems } from './utils';

describe('rebang utils', () => {
    it('decodes &amp; in item.image before proxying', () => {
        const feed = {
            items: [
                {
                    id: '1',
                    title: 't',
                    url: 'https://example.com/post/1',
                    image: 'https://img.example.com/a.webp?x=1&amp;y=2',
                },
            ],
        };

        const [item] = toUiItems(feed, { key: 'x', name: 'X' }, 10, 'http://localhost:1200');
        const proxied = new URL(item.image!);

        expect(proxied.pathname).toBe('/api/rebang/image');
        expect(proxied.searchParams.get('url')).toBe('https://img.example.com/a.webp?x=1&y=2');
    });

    it('decodes &amp; in extracted <img src> before proxying', () => {
        const feed = {
            items: [
                {
                    id: '1',
                    title: 't',
                    url: 'https://example.com/post/1',
                    summary: '<p><img src="https://img.example.com/a.webp?x=1&amp;y=2"></p>',
                },
            ],
        };

        const [item] = toUiItems(feed, { key: 'x', name: 'X' }, 10, 'http://localhost:1200');
        const proxied = new URL(item.image!);

        expect(proxied.pathname).toBe('/api/rebang/image');
        expect(proxied.searchParams.get('url')).toBe('https://img.example.com/a.webp?x=1&y=2');
    });
});
