import { chromium } from "playwright"
import fs from "fs"

const BASE = "http://localhost:3001"
const routes = (process.env.ROUTES || "/fr,/fr/announces,/fr/announces/1,/fr/demandes,/fr/demandes/46,/fr/research,/fr/deposit/particulier,/fr/auth/login,/fr/auth/register,/fr/contact,/fr/faq,/fr/a-propos,/fr/partenaires,/fr/cgu,/ar,/ar/announces,/ar/demandes").split(",")
const widths = (process.env.WIDTHS || "320,375,768,1024").split(",").map(Number)
const auth = process.env.AUTH === "1" ? JSON.parse(fs.readFileSync(".audit/auth.json","utf8")) : null
const shots = process.env.SHOTS === "1"

fs.mkdirSync(".audit/shots", { recursive: true })
const browser = await chromium.launch()
const out = []
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 800 : 900 }, deviceScaleFactor: 1 })
  if (auth) await ctx.addInitScript((a) => { localStorage.setItem("token", a.token); if (a.user) localStorage.setItem("user", JSON.stringify(a.user)) }, auth)
  for (const r of routes) {
    const page = await ctx.newPage()
    const errs = []
    page.on("console", (m) => { if (m.type() === "error" && !/favicon|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 140)) })
    try {
      await page.goto(BASE + r, { waitUntil: "networkidle", timeout: 45000 })
    } catch { /* timeout réseau : on mesure quand même */ }
    await page.waitForTimeout(600)
    const res = await page.evaluate(() => {
      const de = document.documentElement
      const vw = de.clientWidth
      const over = de.scrollWidth - vw
      const bad = []
      if (over > 1) {
        for (const el of document.querySelectorAll("body *")) {
          const rc = el.getBoundingClientRect()
          if (rc.width > 0 && (rc.right > vw + 1 || rc.left < -1)) {
            // ignorer ce qui est volontairement masqué / dans un conteneur scrollable
            let p = el.parentElement, clipped = false
            while (p && p !== document.body) {
              const cs = getComputedStyle(p)
              if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) { clipped = true; break }
              p = p.parentElement
            }
            if (!clipped) bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 3).join(".")} [${Math.round(rc.left)}→${Math.round(rc.right)}]`)
          }
          if (bad.length >= 4) break
        }
      }
      // petites cibles tactiles (<32px) parmi boutons/liens visibles
      let small = 0
      for (const el of document.querySelectorAll("button, a, input, select")) {
        const rc = el.getBoundingClientRect()
        if (rc.width > 0 && rc.height > 0 && (rc.height < 30 || rc.width < 30) && rc.top < 3000 && el.textContent !== undefined && getComputedStyle(el).visibility !== "hidden") small++
      }
      return { over, bad, small, title: document.title }
    })
    const flag = res.over > 1 ? "OVERFLOW" : "ok"
    out.push({ w, r, ...res, errs: errs.length })
    console.log(`${String(w).padStart(4)} ${r.padEnd(26)} ${flag.padEnd(8)} over=${res.over} small=${res.small} errs=${errs.length}${res.bad.length ? "  " + res.bad.join(" | ") : ""}`)
    if (shots) await page.screenshot({ path: `.audit/shots/${w}${r.replace(/\//g, "_")}.png`, fullPage: true })
    await page.close()
  }
  await ctx.close()
}
await browser.close()
fs.writeFileSync(".audit/result.json", JSON.stringify(out, null, 1))
