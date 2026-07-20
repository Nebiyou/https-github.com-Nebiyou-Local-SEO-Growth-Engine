// Assembles grade5-math.html from app/template.html + app/anims.js + content/unit*.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED_TAGS = /<\/?(?!(b|i|u|sup|sub|br)\b)[a-z][^>]*>/i;

const units = [];
const errors = [];
for (let n = 1; n <= 8; n++) {
  const path = join(root, "content", `unit${n}.json`);
  let u;
  try { u = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { errors.push(`unit${n}.json: ${e.message}`); continue; }
  if (u.unit !== n) errors.push(`unit${n}.json: unit field is ${u.unit}`);
  if (!Array.isArray(u.concepts) || !u.concepts.length) errors.push(`unit${n}.json: no concepts`);
  for (const c of u.concepts ?? []) {
    const where = `unit${n}/${c.id}`;
    for (const f of ["id", "title", "standards", "states", "know", "mc", "open", "challenge"])
      if (c[f] == null) errors.push(`${where}: missing ${f}`);
    if (c.mc?.length !== 10) errors.push(`${where}: ${c.mc?.length} mc (want 10)`);
    if (c.open?.length !== 5) errors.push(`${where}: ${c.open?.length} open (want 5)`);
    c.mc?.forEach((m, i) => {
      if (m.choices?.length !== 4) errors.push(`${where} mc${i + 1}: ${m.choices?.length} choices`);
      if (!(Number.isInteger(m.answer) && m.answer >= 0 && m.answer <= 3)) errors.push(`${where} mc${i + 1}: bad answer ${m.answer}`);
      if (!m.explain) errors.push(`${where} mc${i + 1}: no explain`);
    });
    c.open?.forEach((o, i) => { if (!o.answer || !o.solution) errors.push(`${where} open${i + 1}: missing answer/solution`); });
    if (!c.challenge?.answer || !c.challenge?.solution) errors.push(`${where}: challenge missing answer/solution`);
    const scan = JSON.stringify(c);
    const bad = scan.match(ALLOWED_TAGS);
    if (bad) errors.push(`${where}: disallowed tag ${bad[0].slice(0, 40)}`);
  }
  units.push(u);
}
if (errors.length) { console.error("VALIDATION FAILED:\n" + errors.join("\n")); process.exit(1); }

const ids = units.flatMap(u => u.concepts.map(c => c.id));
console.log(`ok: 8 units, ${ids.length} concepts, ` +
  units.flatMap(u => u.concepts).reduce((a, c) => a + c.mc.length, 0) + " mc, " +
  units.flatMap(u => u.concepts).reduce((a, c) => a + c.open.length, 0) + " open");

let html = readFileSync(join(root, "app", "template.html"), "utf8");
const anims = readFileSync(join(root, "app", "anims.js"), "utf8");
const fonts = readFileSync(join(root, "app", "fonts-embed.css"), "utf8");
html = html.replace("/*__FONTS__*/", fonts);
// </script> inside JSON strings would terminate the script tag — escape defensively
const contentJs = "const CONTENT = " + JSON.stringify(units).replace(/<\//g, "<\\/") + ";";
html = html.replace("/*__CONTENT__*/", contentJs).replace("/*__ANIMS__*/", anims);
const out = join(root, "grade5-math.html");
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
