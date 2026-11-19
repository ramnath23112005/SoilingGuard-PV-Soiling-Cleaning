import { chromium } from 'playwright'

const base = 'http://localhost:4173'
const out = 'C:/Users/ramna/AppData/Local/Temp/opencode/vyro-shots'
const pages = [
  ['home', '/'],
  ['shop', '/shop'],
  ['pdp-black', '/product/essential-tee-black'],
  ['pdp-graphic', '/product/graphic-tee-concept-02'],
  ['lookbook', '/lookbook'],
  ['story', '/our-story'],
]

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

for (const [name, path] of pages) {
  await page.goto(base + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false })
  console.log(`shot ${name}`)
}

// verify imgs actually loaded (naturalWidth > 0)
await page.goto(base + '/', { waitUntil: 'networkidle' })
const imgStats = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')]
  return {
    total: imgs.length,
    loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
    srcs: imgs.map((i) => i.getAttribute('src')),
  }
})
console.log('home imgStats', JSON.stringify(imgStats, null, 2))
console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
