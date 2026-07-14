$urls = @(
    "/",
    "/guide",
    "/guide/",
    "/guide/cookierun-classic-beginner-guide",
    "/guide/cookierun-classic-account-progression-guide",
    "/codes",
    "/codes/cookierun-classic-codes",
    "/cookies/cookierun-classic-best-cookies",
    "/th",
    "/th/guide",
    "/th/codes/cookierun-classic-codes",
    "/ko",
    "/ja",
    "/ja/guide/cookierun-classic-beginner-guide",
    "/about",
    "/copyright",
    "/privacy-policy",
    "/terms-of-service",
    "/en/about",
    "/en/privacy-policy",
    "/th/about",
    "/ko/about",
    "/ja/privacy-policy",
    "/sitemap.xml",
    "/robots.txt",
    "/nonexistent-page",
    "/en/nonexistent-page",
    "/images/hero.webp",
    "/manifest.json",
    "/android-chrome-192x192.png"
)
$tmp = Join-Path $env:TEMP "curl_full.tmp"
$ok = 0; $fail = 0
foreach ($u in $urls) {
    $line = & curl.exe -s -o $tmp -w '%{http_code}|%{size_download}|%{redirect_url}' "http://127.0.0.1:8787$u"
    $code = ($line -split '\|')[0]
    $expected = "404"
    if ($u -match "^(/|/guide|/codes|/cookies|/th|/ko|/ja|/about|/copyright|/privacy-policy|/terms-of-service|/sitemap\.xml|/robots\.xml|/images/|/manifest\.json|/android-).*") {
        if ($code -eq "200" -or $code -eq "308" -or $code -eq "307") { $expected = "ok" }
    } elseif ($u -match "^/en/.*") {
        if ($code -eq "307") { $expected = "ok" }
    } elseif ($u -match "^/th/.*") {
        if ($code -eq "200" -or $code -eq "308") { $expected = "ok" }
    } elseif ($u -match "^/ko/.*") {
        if ($code -eq "200" -or $code -eq "308") { $expected = "ok" }
    } elseif ($u -match "^/ja/.*") {
        if ($code -eq "200" -or $code -eq "308") { $expected = "ok" }
    } elseif ($u -match "nonexistent") {
        if ($code -eq "404") { $expected = "ok" }
    }
    $marker = if ($expected -eq "ok") { "[OK]  " } else { "[FAIL]" }
    if ($expected -eq "ok") { $ok++ } else { $fail++ }
    Write-Host ("{0}  GET {1,-55} -> {2,-20}" -f $marker, $u, $line)
}
Write-Host ""
Write-Host ("Passed: {0}    Failed: {1}" -f $ok, $fail)
Remove-Item $tmp -ErrorAction SilentlyContinue
