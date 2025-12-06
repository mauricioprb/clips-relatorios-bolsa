/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdfkit"],
  turbopack: {},
};

export default nextConfig;
