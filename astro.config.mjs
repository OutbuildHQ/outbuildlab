import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

// Static-first: every page prerenders to HTML. The Netlify adapter only
// kicks in for routes that opt out via `export const prerender = false`
// (currently just /api/build-plan), which ship as serverless functions.
// https://astro.build/config
export default defineConfig({
  site: "https://outbuildlab.com",
  adapter: netlify(),
});
