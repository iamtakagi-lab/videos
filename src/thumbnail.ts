import { spawn } from "child_process";

export const shot = () => spawn(
    "ffmpeg",
        [
        '-re', 
        '-i', 'pipe:0',
        '-ss', '00:00:03',
        '-s', '1920x1080',
        '-frames', '1',
        '-f', 'mjpeg',
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

export default shot