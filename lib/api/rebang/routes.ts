import type { Context } from 'hono';

import { namespaces } from '@/registry';

type RebangRouteEntry = {
    namespace: string;
    namespaceName: string;
    path: string;
    fullPath: string;
    name: string;
    example: string;
    parameters?: Record<
        string,
        | string
        | {
              description: string;
              default?: string;
              options?: Array<{
                  value: string;
                  label: string;
              }>;
          }
    >;
};

let cachedRoutes: RebangRouteEntry[] | null = null;

const buildRoutes = (): RebangRouteEntry[] => {
    const routes: RebangRouteEntry[] = [];

    for (const [namespace, ns] of Object.entries(namespaces)) {
        const namespaceName = typeof ns?.name === 'string' ? ns.name : namespace;
        const routeMap = ns?.routes ?? {};

        for (const [path, route] of Object.entries(routeMap)) {
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            const fullPath = `/${namespace}${normalizedPath}`;
            routes.push({
                namespace,
                namespaceName,
                path: normalizedPath,
                fullPath,
                name: String(route.name ?? ''),
                example: String(route.example ?? ''),
                parameters: route.parameters,
            });
        }
    }

    routes.sort((a, b) => a.fullPath.localeCompare(b.fullPath, 'en'));
    return routes;
};

export function handler(ctx: Context) {
    if (!cachedRoutes) {
        cachedRoutes = buildRoutes();
    }
    return ctx.json(
        {
            generatedAt: new Date().toISOString(),
            routes: cachedRoutes,
        },
        200
    );
}
