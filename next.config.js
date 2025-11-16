const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // ワークボックスの設定
  buildExcludes: [/middleware-manifest\.json$/, /middleware-runtime\.js$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ここに追加のNext.js設定を記述
};

module.exports = withPWA(nextConfig);
