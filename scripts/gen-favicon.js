/* Hausio favicon generator — pure Node, no native deps.
 * Renders the brand "house" mark (charcoal house on cream rounded square)
 * to PNG (zlib) and packs favicon.ico. Run: node scripts/gen-favicon.js
 *
 * Geometry is defined on a 64-unit grid and matches favicon.svg.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const CREAM = [247, 244, 239];
const INK = [26, 26, 26];

// ---- geometry on a 0..64 grid (y down) ----
const SQ = { x0: 2, y0: 2, x1: 62, y1: 62, r: 12 };       // rounded square bg
const ROOF = { ax: 32, ay: 13, lx: 12, ly: 32, rx: 52, ry: 32 }; // roof triangle
const BODY = { x0: 17, y0: 29, x1: 47, y1: 52 };          // house body
const DOOR = { x0: 28, y0: 38, x1: 36, y1: 52 };          // door cutout

function inRoundRect(x, y, s) {
  const { x0, y0, x1, y1, r } = s;
  if (x < x0 || y < y0 || x > x1 || y > y1) return false;
  // corner clipping
  const cx = x < x0 + r ? x0 + r : (x > x1 - r ? x1 - r : x);
  const cy = y < y0 + r ? y0 + r : (y > y1 - r ? y1 - r : y);
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}
function inRect(x, y, r) { return x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1; }
function inTri(x, y, t) {
  const sign = (x1, y1, x2, y2, x3, y3) =>
    (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const d1 = sign(x, y, t.ax, t.ay, t.lx, t.ly);
  const d2 = sign(x, y, t.lx, t.ly, t.rx, t.ry);
  const d3 = sign(x, y, t.rx, t.ry, t.ax, t.ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

function sampleColor(gx, gy) {
  if (!inRoundRect(gx, gy, SQ)) return [0, 0, 0, 0];
  const house = inTri(gx, gy, ROOF) || inRect(gx, gy, BODY);
  const door = inRect(gx, gy, DOOR);
  if (house && !door) return [INK[0], INK[1], INK[2], 255];
  return [CREAM[0], CREAM[1], CREAM[2], 255];
}

function renderRGBA(size) {
  const ss = 4;                 // supersample factor for anti-aliasing
  const k = 64 / (size * ss);   // hi-res px -> grid units
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const gx = (x * ss + sx + 0.5) * k;
          const gy = (y * ss + sy + 0.5) * k;
          const c = sampleColor(gx, gy);
          // premultiply for correct edge blending
          r += c[0] * c[3]; g += c[1] * c[3]; b += c[2] * c[3]; a += c[3];
        }
      }
      const n = ss * ss;
      const i = (y * size + x) * 4;
      const al = a / n;
      buf[i] = al ? Math.round(r / a) : 0;
      buf[i + 1] = al ? Math.round(g / a) : 0;
      buf[i + 2] = al ? Math.round(b / a) : 0;
      buf[i + 3] = Math.round(al);
    }
  }
  return buf;
}

// ---- PNG encoder ----
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(Buffer.concat([tb, data])), 0);
  return Buffer.concat([len, tb, data, crc]);
}
function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- ICO packer (PNG-encoded entries) ----
function encodeICO(entries) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  const datas = [];
  entries.forEach((e, idx) => {
    const o = idx * 16;
    dir[o] = e.size >= 256 ? 0 : e.size;
    dir[o + 1] = e.size >= 256 ? 0 : e.size;
    dir[o + 2] = 0; dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(e.png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.png.length;
    datas.push(e.png);
  });
  return Buffer.concat([head, dir, ...datas]);
}

// ---- write outputs ----
function png(size) { return encodePNG(size, renderRGBA(size)); }
const write = (rel, buf) => { fs.writeFileSync(path.join(ROOT, rel), buf); console.log('  wrote', rel, buf.length, 'bytes'); };

console.log('Generating Hausio favicons…');
write('favicon.ico', encodeICO([16, 32, 48].map(s => ({ size: s, png: png(s) }))));
write('apple-touch-icon.png', png(180));
write('assets/favicon-96x96.png', png(96));
write('assets/icon-192.png', png(192));
write('assets/icon-512.png', png(512));
write('assets/logo.png', png(512)); // square brand logo for schema.org Organization
console.log('Done.');
