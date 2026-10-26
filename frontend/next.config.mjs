/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: false,
  transpilePackages: ["react-force-graph-2d", "force-graph", "kapsule"],
};

export default nextConfig;
