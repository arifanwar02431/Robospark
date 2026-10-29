import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  async redirects() {
    return [
      // Ruang Koding adalah situs statis di public/ruang-koding; berkasnya memakai alamat relatif,
      // jadi harus dibuka lewat index.html.
      { source: "/ruang-koding", destination: "/ruang-koding/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
