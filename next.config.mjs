/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/tools/video-to-mp3',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
