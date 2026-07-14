@echo off
setlocal enabledelayedexpansion

set URLS=/ /guide /guide/ /guide/cookierun-classic-beginner-guide /th/guide/cookierun-classic-beginner-guide /about /about/ /en /en/guide /en/about /sitemap.xml

for %%U in (%URLS%) do (
  for /f "tokens=*" %%R in ('curl.exe -s -o nul -w "%%{http_code} %%{size_download}" "http://127.0.0.1:8787%%U"') do (
    echo GET %%U  ->  HTTP %%R
  )
)
