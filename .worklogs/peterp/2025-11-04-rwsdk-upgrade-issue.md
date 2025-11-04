# rwsdk Upgrade Issue Investigation

## Problem

After upgrading `rwsdk` from `0.1.0-alpha.2` to `^1.0.0-beta.24`, the build fails with:

```
Error: rollupOptions.input should not be an html file when building for SSR. Please specify a dedicated SSR entry.
```

## Solution Found

The issue was resolved by adding the Cloudflare Vite plugin to the vite config with the correct configuration, based on the [starter repository](https://github.com/redwoodjs/sdk/tree/main/starter):

**Updated `vite.config.mts`:**

```typescript
import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ],
});
```

**Key changes:**

1. Added `@cloudflare/vite-plugin` import with named export `{ cloudflare }`
2. Added Cloudflare plugin **before** the redwood plugin (order matters)
3. Configured Cloudflare plugin with `viteEnvironment: { name: "worker" }`

## Current Status

Build now progresses through:

- ✅ Plugin setup pass
- ✅ Worker build
- ✅ SSR build
- ✅ Client build
- ❌ Linking worker build (Prisma import issue)

## Remaining Issue

During the "Linking worker build" phase, Rollup fails to resolve:

```
".prisma/client/default" from "/Users/peterp/gh/redwoodjs/example-billable/dist/worker/index.js"
```

This appears to be a Prisma bundling issue with Cloudflare Workers. The Prisma client needs to be properly bundled or externalized during the linking phase.

## Dependencies Updated

- `rwsdk`: `0.1.0-alpha.2` → `^1.0.0-beta.24`
- `react`: Added `^19.2.0`
- `react-dom`: Added `^19.2.0`
- `react-server-dom-webpack`: Added `^19.2.0`
- `vite`: `^6.1.1` → `^6.2.6`
- `wrangler`: `^4.14.1` → `^4.45.3`
- `@cloudflare/vite-plugin`: Added `^1.13.18`
