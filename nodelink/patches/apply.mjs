// Text patches for NodeLink sources. Run inside the image at build time.
import fs from 'node:fs';

const patches = [
  {
    // SoundCloud: tracks that only have "cbc-encrypted-hls" fell through to `transcodings[0]`.
    // loadStream then destroys a PassThrough with "Unsupported protocol" and nobody listens for
    // the error, so the whole voice worker crashed and every player on it stopped.
    // Without the fallback the track fails cleanly ("No valid transcoding found") and the bot
    // plays the song from another source.
    file: '/app/src/sources/soundcloud.ts',
    from: '      anyHls ||\n      transcodings[0]\n',
    to: '      anyHls\n',
  },
];

for (const p of patches) {
  const s = fs.readFileSync(p.file, 'utf8');
  if (!s.includes(p.from)) {
    console.error(`patch target not found in ${p.file}`);
    process.exit(1);
  }
  fs.writeFileSync(p.file, s.replace(p.from, p.to));
  console.log(`patched ${p.file}`);
}
