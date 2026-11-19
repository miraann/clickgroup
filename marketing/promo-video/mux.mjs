// node mux.mjs <video.mp4> <audio.wav> <out.mp4> — adds the soundtrack (loudness-normalised for social) to a rendered video
import ffmpegPath from 'ffmpeg-static';
import { execFileSync } from 'node:child_process';
const [video, audio, out] = process.argv.slice(2);
execFileSync(ffmpegPath, ['-y', '-loglevel', 'error', '-i', video, '-i', audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
  '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('wrote', out);
