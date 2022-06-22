import { spawn } from "child_process";

// M2TS-LL Stream
export const encode = () => spawn(
  "ffmpeg",
      [
        '-re', 
        '-dual_mono_mode',
        'main', 
        '-f', 
        'mpegts', 
        '-analyzeduration', 
        '500000',
        '-i',
        'pipe:0',
        '-map',
        '0', 
        '-c:s', 
        'copy', 
        '-c:d', 
        'copy', 
        '-ignore_unknown', 
        '-fflags', 
        'nobuffer', 
        '-flags', 
        'low_delay', 
        '-max_delay', 
        '250000', 
        '-max_interleave_delta', 
        '1', 
        '-threads',
        '0', 
        '-c:a', 
        'aac', 
        '-ar', 
        '48000', 
        '-b:a', 
        '192k', 
        '-ac', 
        '2', 
        '-c:v', 
        'libx264', 
        '-flags',
        '+cgop', 
        '-vf', 
        'yadif,scale=-2:1080',
        '-b:v',
        '3000k',
        '-preset',
        'veryfast',
        '-y',
        '-f',
        'mpegts',
        'pipe:1'
      ],
      {
        windowsHide: true,
        stdio: [
          "pipe",
          "pipe" // pipe[0]: 動画ストリーム入力 pipe[1]: エンコード済みストリーム出力
        ]
      }
)

export default encode;
