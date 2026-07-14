$urls = @(
    "/",
    "/guide",
    "/guide/",
    "/guide/cookierun-classic-beginner-guide",
    "/th/guide/cookierun-classic-beginner-guide",
    "/about",
    "/about/",
    "/en",
    "/en/guide",
    "/en/about",
    "/en/about/",
    "/sitemap.xml",
    "/robots.txt"
)

$tmp = Join-Path $env:TEMP "curl_probe.tmp"
foreach ($u in $urls) {
    $line = & curl.exe -s -o $tmp -w '%{http_code}|%{size_download}|%{redirect_url}' "http://127.0.0.1:8787$u"
    Write-Host ("GET {0,-55} -> {1}" -f $u, $line)
}
Remove-Item $tmp -ErrorAction SilentlyContinue
