import path from "path";
import fs from "fs";
import { ALLOWED_FORMATS_REGEX } from "./constants";

export function readSyncVideoFiles() {
    return fs
      .readdirSync(path.resolve(__dirname, "..", "storage"))
      .filter((fileName) => ALLOWED_FORMATS_REGEX.test(fileName))
      .map(
        (fileName) =>
          ({
            fileName,
            time: fs
              .statSync(path.resolve(__dirname, "..", "storage", fileName))
              .mtime.getTime(),
          } as { fileName: string; time: number })
      )
      .sort((a, b) => b.time - a.time)
      .map((file) => file.fileName);
}