import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream', 'util', 'events'],
    }),
  ],
  build: {
    rollupOptions: {
      external: ['@0glabs/0g-ts-sdk', 'ethers'],
    },
  },
  optimizeDeps: {
    exclude: ['@0glabs/0g-ts-sdk'],
  },
});