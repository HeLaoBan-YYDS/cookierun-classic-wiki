import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

/**
 * Cloudflare Workers 适配 (OpenNext) 配置。
 *
 * 关键变化 (相对旧的 `output: "export"` Pages 静态导出)：
 *   - 移除 `output: "export"`: OpenNext for Workers 不支持 export 模式,改用
 *     标准 build + opennextjs-cloudflare prerender 全量预渲染。
 *   - `images.unoptimized: true` 保留:Workers 运行时无 sharp,任何 next/image
 *     优化都不可用。
 *   - `trailingSlash: false` (原来是 true):OpenNext 的 prerender 对
 *     `trailingSlash: true` 下的 static pages (无 generateStaticParams) 不生
 *     成对应的 `/about/` cache,导致运行时 404。改 false 后 prerender 走
 *     `/about` (无斜杠),Worker 用 308 把 `/about/` 跳过来。
 *   - 301 永久重定向 `/about/` → `/about` 等:保留原 Pages 部署的 URL 形
 *     式,避免 SEO 损失。308 是临时,搜索引擎不会更新索引;301 才是永久。
 *   - as-needed locale 重定向交给 `src/middleware.ts` (next-intl middleware),
 *     不再在 next.config 里写死 (避免与运行时中间件冲突)。
 *   - 安全 / 缓存 headers 从 `public/_headers` 迁到这里,OpenNext prerender
 *     阶段会把它们写入静态响应的 headers。
 */
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "ext.same-assets.com", pathname: "/**" },
      { protocol: "https", hostname: "ugc.same-assets.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
  },
  async redirects() {
    // 保留旧 Pages 部署的 trailing-slash URL:访问 `/about/` 时永久 301 到
    // 无斜杠的 `/about`。OpenNext 把这些 redirects 在 prerender 阶段烤成
    // 静态响应。
    const roots = [
      "/about",
      "/copyright",
      "/privacy-policy",
      "/terms-of-service",
    ];
    const out: Array<{ source: string; destination: string; permanent: boolean }> = [];
    for (const p of roots) {
      out.push({ source: `${p}/`, destination: p, permanent: true });
    }
    return out;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        source: "/:path*.html",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default withNextIntl(withMDX(nextConfig));
