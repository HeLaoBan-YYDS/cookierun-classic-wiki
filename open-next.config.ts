import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext for Cloudflare Workers 配置。
 *
 * 全 SSG 模式:不绑 R2 / D1,所有页面在 build time 由 opennextjs-cloudflare
 * prerender 成静态响应塞进 `.open-next/`,Worker 入口只承担"找不到静态资源
 * 时的兜底 SSR"。Cache 全 dummy:不依赖任何外部存储。
 *
 *  - incrementalCache: dummy → 不接 R2,所有 ISG/SSG 缓存直接以 prerender
 *    形式落盘到 `.open-next/assets/`。
 *  - tagCache:        dummy → 同上,`revalidateTag` 调用无副作用。
 *  - queue:           direct → 异步事件直接调用,不投递到 SQS/Workers Queue。
 */
export default defineCloudflareConfig({
  incrementalCache: "dummy",
  tagCache: "dummy",
  queue: "direct",
});
