import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import pngToIco from "png-to-ico"; // Ganti icojs dengan png-to-ico

// Mendapatkan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cek input image di root folder (photo.png / photo.jpg)
const possibleFiles = ["photo.png", "photo.jpg"];
const inputImage = possibleFiles.find((file) => fs.existsSync(path.join(__dirname, file)));

if (!inputImage) {
  console.error("❌ Tidak ditemukan file photo.png atau photo.jpg di root folder!");
  process.exit(1);
}

console.log(`📷 Menggunakan file: ${inputImage}`);

// Folder output
const outputDir = path.join(__dirname, "favicons");
fs.ensureDirSync(outputDir);

// Daftar ukuran favicon yang akan dibuat
const sizes = [
  { name: "favicon-16x16.png", width: 16, height: 16 },
  { name: "favicon-32x32.png", width: 32, height: 32 },
  { name: "android-chrome-192x192.png", width: 192, height: 192 },
  { name: "android-chrome-512x512.png", width: 512, height: 512 },
  { name: "apple-touch-icon.png", width: 180, height: 180 },
];

// Fungsi untuk membuat PNG favicon
async function generateFavicons() {
  try {
    console.log("🔄 Generating PNG icons...");
    for (const size of sizes) {
      await sharp(path.join(__dirname, inputImage))
        .resize(size.width, size.height)
        .toFile(path.join(outputDir, size.name));
      console.log(`✅ ${size.name} created`);
    }
    await generateFaviconICO();
    await generateManifest();
    console.log("🎉 Semua favicon berhasil dibuat di folder 'favicons/'!");
  } catch (error) {
    console.error("❌ Error saat membuat favicon:", error);
  }
}

// Fungsi untuk membuat favicon.ico (16x16 & 32x32)
async function generateFaviconICO() {
  console.log("🔄 Generating favicon.ico...");

  const iconPaths = [
    path.join(outputDir, "favicon-16x16.png"),
    path.join(outputDir, "favicon-32x32.png"),
  ];

  try {
    const icoBuffer = await pngToIco(iconPaths);
    fs.writeFileSync(path.join(outputDir, "favicon.ico"), icoBuffer);
    console.log("✅ favicon.ico created");
  } catch (error) {
    console.error("❌ Error saat membuat favicon.ico:", error);
  }
}

// Fungsi untuk membuat site.webmanifest
async function generateManifest() {
  console.log("🔄 Generating site.webmanifest...");
  const manifest = {
    name: "My Website",
    short_name: "MySite",
    icons: sizes.map((size) => ({
      src: `/${path.basename(outputDir)}/${size.name}`,
      sizes: `${size.width}x${size.height}`,
      type: "image/png",
    })),
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };
  fs.writeFileSync(path.join(outputDir, "site.webmanifest"), JSON.stringify(manifest, null, 2));
  console.log("✅ site.webmanifest created");
}

// Jalankan generator
generateFavicons();