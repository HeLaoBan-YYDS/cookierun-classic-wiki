$urls = @(
    "/about",
    "/copyright",
    "/privacy-policy",
    "/terms-of-service",
    "/sitemap.xml",
    "/robots.txt",
    "/th/about",
    "/th/copyright"
)
$tmp = Join-Path $env:TEMP "curl_h.tmp"
foreach ($u in $urls) {
    $line = & curl.exe -s -D $tmp -o $tmp.body -w '%{http_code}|%{size_download}' "http://127.0.0.1:8787$u"
    $xcache = (Select-String -Path $tmp -Pattern '^x-nextjs' -SimpleMatch:$false 2>$null | Select-Object -First 1) -replace "`r`n", ""
    Write-Host ("GET {0,-30} -> {1,-20} {2}" -f $u, $line, $xcache)
}
Remove-Item $tmp,$tmp.body -ErrorAction SilentlyContinue
