import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const srcDir = path.resolve(process.cwd(), 'src', 'assets', 'img')
const outDir = path.resolve(process.cwd(), 'public', 'assets', 'images', 'promos')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

async function processBanner(fileName) {
  const input = path.join(srcDir, 'banner', fileName)
  const base = path.parse(fileName).name

  try {
    // create webp large
    await sharp(input)
      .resize(1920)
      .webp({ quality: 80 })
      .toFile(path.join(outDir, `${base}.webp`))

    // create medium
    await sharp(input)
      .resize(1200)
      .webp({ quality: 78 })
      .toFile(path.join(outDir, `${base}-1200.webp`))

    // create small
    await sharp(input)
      .resize(800)
      .webp({ quality: 75 })
      .toFile(path.join(outDir, `${base}-800.webp`))

    console.log('Optimized', fileName)
  } catch (err) {
    console.error('Error optimizing', fileName, err)
  }
}

async function main() {
  const bannerDir = path.join(srcDir, 'banner')
  const files = fs.readdirSync(bannerDir).filter(f => /\.(png|jpe?g)$/i.test(f))
  for (const f of files) {
    await processBanner(f)
  }
}

main()
.then(() => console.log('All images processed'))
.catch(err => { console.error(err); process.exit(1) })
