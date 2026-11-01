import type { NextConfig } from "next";

const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const config: NextConfig = {
  experimental: {
    // Photos are resized in the browser before upload, so 4 MB is plenty (Vercel caps bodies at 4.5 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
  // The admin pages read content/ at request time, so ship it with the server functions.
  outputFileTracingIncludes: { "/admin/**": ["./content/**"] },
  // Journal slugs that were renamed (typos, truncated titles, wrong date). Old links keep working.
  async redirects() {
    const moved: [string, string][] = [
      ["2026-05-26-starting-coding-and-making-takoff", "2026-05-26-starting-coding-and-making-takeoff"],
      ["2026-04-25-cad-the-motor-base-and-arm", "2026-04-26-cad-the-motor-base-and-arm"],
      ["2026-05-06-fixing-some-issues-with-the-servo-motor-and-finally-finishin", "2026-05-06-fixing-some-issues-with-the-servo-motor-and-finally-finishing-it"],
      ["2026-05-19-finished-the-battery-percentage-and-started-the-sensor-i2c-c", "2026-05-19-finished-the-battery-percentage-and-started-the-sensor-i2c-connection"],
      ["2026-05-20-routing-the-33v-power-supply-and-starting-the-126v-to-5v-buc", "2026-05-20-routing-the-33v-power-supply-and-starting-the-126v-to-5v-buck-converter"],
      ["2026-05-01-adding-the-combiner-for-the-wall-part-and-designing-the-smal", "2026-05-01-adding-the-combiner-for-the-wall-part-and-designing-the-small-wall"],
    ];
    return moved.map(([from, to]) => ({ source: `/journal/${from}`, destination: `/journal/${to}`, permanent: true }));
  },
  async headers() {
    return [
      { source: "/:path*", headers: security },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/admin", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default config;
