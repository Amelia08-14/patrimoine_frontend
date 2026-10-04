import { chromium } from "playwright"
import fs from "fs"
const routes = process.env.ROUTES.split(","); const w = Number(process.env.W || 390)
const auth = JSON.parse(fs.readFileSync(".audit/auth.json","utf8"))
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: w, height: 800 }, hasTouch: true })
await ctx.addInitScript((a) => { localStorage.setItem("token", a.token); if (a.user) localStorage.setItem("user", JSON.stringify(a.user)) }, auth)
for (const r of routes) {
  const p = await ctx.newPage(); try { await p.goto("http://localhost:3001" + r, { waitUntil: "networkidle", timeout: 45000 }) } catch {}
  await p.waitForTimeout(500)
  const list = await p.evaluate(() => [...document.querySelectorAll("button, a, input:not([type=hidden]), select, textarea, [role=button]")].map((el) => { const rc = el.getBoundingClientRect(); return { rc, el } }).filter(({ rc, el }) => rc.width > 0 && rc.height > 0 && (rc.height < 36 || rc.width < 36) && getComputedStyle(el).visibility !== "hidden" && !(el.type === "checkbox" || el.type === "radio" || el.classList.contains("sr-only"))).slice(0, 14).map(({ rc, el }) => `${el.tagName.toLowerCase()} ${Math.round(rc.width)}x${Math.round(rc.height)} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 24)}" .${String(el.className).split(" ").slice(0, 4).join(".")}`))
  console.log("== " + r + "\n" + list.join("\n"))
  await p.close()
}
await b.close()
