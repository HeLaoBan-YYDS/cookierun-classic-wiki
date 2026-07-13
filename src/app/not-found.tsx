import Link from "next/link";
import { Button } from "@/components/ui/button";

// 根级 404：Cloudflare Pages 在静态导出下若访问一个不存在的路径，
// 会自动把 404.html 作为兜底返回。
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-16 text-center">
          <div className="rounded-3xl border border-border bg-card/70 p-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Page not found</h1>
            <p className="mt-4 text-muted-foreground">The guide you are looking for may have moved or has not been added yet.</p>
            <Button asChild className="mt-6">
              <Link href="/guide">Browse Guides</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
