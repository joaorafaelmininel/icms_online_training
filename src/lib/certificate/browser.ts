// src/lib/certificate/browser.ts
// Launches a headless Chromium for server-side PDF rendering.
//
// - In production (Vercel serverless): uses @sparticuz/chromium, a Chromium
//   binary built to fit within serverless function size/runtime constraints,
//   paired with puppeteer-core (no bundled browser download).
// - In local development: puppeteer-core drives whatever Chrome/Edge is
//   already installed on the machine, found via a few common install paths
//   (or PUPPETEER_EXECUTABLE_PATH if set) — avoids requiring a separate
//   Puppeteer-managed Chromium download in dev.

import fs from 'fs'
import type { Browser } from 'puppeteer-core'

const LOCAL_CHROME_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean) as string[]

function findLocalChrome(): string {
  const found = LOCAL_CHROME_PATHS.find((p) => fs.existsSync(p))
  if (!found) {
    throw new Error(
      'No local Chrome/Edge install found for certificate PDF generation. ' +
      'Set PUPPETEER_EXECUTABLE_PATH to a Chrome/Edge executable path.'
    )
  }
  return found
}

export async function launchBrowser(): Promise<Browser> {
  const puppeteer = await import('puppeteer-core')

  if (process.env.NODE_ENV === 'production') {
    const chromium = (await import('@sparticuz/chromium')).default
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  return puppeteer.launch({
    executablePath: findLocalChrome(),
    headless: true,
  })
}
