import type { NextConfig } from "next";
import nextBundleAnalyzer from '@next/bundle-analyzer';
const nextConfig: NextConfig = {
  turbopack: {
    // ...
  },
}
const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});
export default withBundleAnalyzer(nextConfig);

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();