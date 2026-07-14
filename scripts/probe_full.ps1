$base = "http://127.0.0.1:8787"
$tmp = Join-Path $env:TEMP "p.tmp"
Remove-Item $tmp -ErrorAction SilentlyContinue

# [Label, URL, ExpectedCode, ContentNeedle]
$tests = @(
    # === 1. Home pages ===
    @("Home (en, root)",            "/",                                                  200, "CookieRun"),
    @("Home (th)",                  "/th",                                                200, "CookieRun"),
    @("Home (ko)",                  "/ko",                                                200, "CookieRun"),
    @("Home (ja)",                  "/ja",                                                200, "CookieRun"),
    # === 2. Content type overview ===
    @("Guide overview",             "/guide",                                             200, "Guides"),
    @("Codes overview",             "/codes",                                             200, "Codes"),
    @("Cookies overview",           "/cookies",                                           200, "Cookies"),
    @("Thai guide overview",        "/th/guide",                                          200, $null),
    # === 3. MDX articles ===
    @("MDX beginner guide (en)",    "/guide/cookierun-classic-beginner-guide",            200, "Beginner"),
    @("MDX codes (en)",             "/codes/cookierun-classic-codes",                     200, $null),
    @("MDX best cookies (en)",      "/cookies/cookierun-classic-best-cookies",            200, $null),
    @("MDX beginner (th)",          "/th/guide/cookierun-classic-beginner-guide",         200, $null),
    @("MDX beginner (ko)",          "/ko/guide/cookierun-classic-beginner-guide",         200, $null),
    @("MDX beginner (ja)",          "/ja/guide/cookierun-classic-beginner-guide",         200, $null),
    @("MDX codes (ja)",             "/ja/codes/cookierun-classic-codes",                  200, $null),
    # === 4. Root-level static legal pages ===
    @("About (root)",               "/about",                                             200, "About"),
    @("Copyright",                  "/copyright",                                         200, $null),
    @("Privacy Policy",             "/privacy-policy",                                    200, $null),
    @("Terms of Service",           "/terms-of-service",                                  200, $null),
    # === 5. Locale-prefixed static pages ===
    @("About (th)",                 "/th/about",                                          200, $null),
    @("About (ko)",                 "/ko/about",                                          200, $null),
    @("Privacy (ja)",               "/ja/privacy-policy",                                 200, $null),
    # === 6. Locale redirects ===
    @("Locale redirect /en",        "/en",                                                307, $null),
    @("Locale redirect /en/guide",  "/en/guide",                                          307, $null),
    @("Locale redirect /en/about",  "/en/about",                                          307, $null),
    # === 7. Trailing slash redirects ===
    @("Trailing slash /guide/",     "/guide/",                                            308, $null),
    @("Trailing slash /about/",     "/about/",                                            308, $null),
    @("Trailing slash /en/about/",  "/en/about/",                                         308, $null),
    # === 8. Static assets / route handlers ===
    @("Sitemap",                    "/sitemap.xml",                                       200, "urlset"),
    @("Robots",                     "/robots.txt",                                        200, "User-agent"),
    @("Favicon",                    "/favicon.ico",                                       200, $null),
    @("Manifest",                   "/manifest.json",                                     200, $null),
    # === 9. 404 handling ===
    @("404 nonexistent",            "/nonexistent-page",                                  404, $null),
    @("404 /en/nonexistent",        "/en/nonexistent-page",                               307, $null),
    @("404 nested MDX",             "/guide/does-not-exist",                              404, $null),
    @("404 nested MDX (th)",        "/th/guide/does-not-exist",                           404, $null)
)

$ok = 0; $fail = 0
foreach ($t in $tests) {
    $label = $t[0]; $url = $t[1]; $expCode = $t[2]; $needle = $t[3]
    $line = & curl.exe -s -o $tmp -w '%{http_code}|%{size_download}' "$base$url"
    $code = ($line -split '\|')[0]
    $size = ($line -split '\|')[1]
    $contentOk = $true; $cDetail = ""
    if ($needle) {
        $body = Get-Content $tmp -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($body -and ($body -match [regex]::Escape($needle))) {
            $cDetail = "content OK"
        } else {
            $contentOk = $false
            $cDetail = "content MISS (want: $needle)"
        }
    }
    $codeOk = ($code -eq $expCode)
    $mark = if ($codeOk -and $contentOk) { "[ OK ]"; $ok++ } else { "[FAIL]"; $fail++ }
    $expStr = $expCode.ToString()
    Write-Host ("{0}  {1,-32} {2,-55} -> {3,3} (size={4,7})  exp {5}  {6}" -f $mark, $label, $url, $code, $size, $expStr, $cDetail)
}

Write-Host ""
Write-Host ("============================================================")
Write-Host ("Passed: {0}   Failed: {1}   Total: {2}" -f $ok, $fail, $tests.Count)
Write-Host ("============================================================")
Remove-Item $tmp -ErrorAction SilentlyContinue
