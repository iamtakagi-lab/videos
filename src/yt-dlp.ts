import { exec, ExecException } from "child_process";
import path from "path";

export const ytdlp = (
  url: string,
  {
    onError,
    onStdout,
    onStderr,
  }: {
    onError: (error: ExecException | null) => void;
    onStdout: (stdout: string) => void;
    onStderr: (stderr: string) => void;
  }
) =>
  exec(
    `cd ${path.resolve(__dirname, "..", "storage")} && yt-dlp --merge-output-format mp4 -f "bestvideo+bestaudio[ext=m4a]/best" ${url}`,{ encoding: 'utf-8' },
    function (error, stdout, stderr) {
      if (error !== null) {
        onError(error);
      }
      if (stdout !== null) {
        onStdout(stdout);
      }
      if (stderr !== null) {
        onStderr(stderr);
      }
    }
  );
