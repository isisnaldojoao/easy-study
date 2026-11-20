import sharp from "sharp";

async function make(size, out) {
  const r = Math.round(size * 0.22);
  const font = Math.round(size * 0.34);
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#14B8A6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="700"
    font-size="${font}" fill="white">SF</text>
</svg>`);
  await sharp(svg).png().toFile(out);
}

await make(192, "public/icons/icon-192.png");
await make(512, "public/icons/icon-512.png");
await make(180, "public/icons/apple-touch-icon.png");
await make(32, "public/favicon-32.png");
await make(192, "src/app/icon.png");
await make(180, "src/app/apple-icon.png");
await make(512, "public/logo.png");
console.log("sf-icons-ok");
