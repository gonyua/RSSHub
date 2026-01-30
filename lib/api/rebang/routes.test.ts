import { describe, expect, it } from 'vitest';

import api from '@/api';

describe('rebang routes api', () => {
    it('returns flattened route list', async () => {
        const response = await api.request('/rebang/routes');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data.routes)).toBe(true);
        expect(data.routes.length).toBeGreaterThan(0);

        const first = data.routes[0];
        expect(typeof first.fullPath).toBe('string');
        expect(first.fullPath.startsWith('/')).toBe(true);
        expect(typeof first.name).toBe('string');
    });
});
