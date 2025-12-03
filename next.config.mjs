/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.afm$/,
      type: "asset/source",
    });
    config.module.rules.push({
      test: /\.icc$/,
      type: "asset/resource",
    });
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("pdfkit");
    }
    return config;
  },
};

export default nextConfig;
