import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

const urlsToPrecache = ["/~offline"] as const;

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// Make sure your service worker doesn't try to cache HTTP resources in production
if (self.location.protocol === "http:") {
  console.warn(
    "Service worker is running on HTTP. Caching is disabled for safety reasons.",
  );
} else {
  self.addEventListener("install", (event) => {
    const requestPromises = Promise.all(
      urlsToPrecache.map((entry) => {
        return serwist.handleRequest({ request: new Request(entry), event });
      }),
    );

    event.waitUntil(requestPromises);
  });
}

// Add custom event listeners for offline functionality
serwist.addEventListeners();