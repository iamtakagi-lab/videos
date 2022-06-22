import multer from "multer";
import path from "path";
import moment from "moment";
import "moment/locale/ja";
import { ALLOWED_FORMATS } from "./constants";
import { UPLOAD_LIMIT_MB } from "./environment";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "storage"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname.split(".")[0] +
        "-" +
        moment(Date.now()).format("YYYYMMDDHHmmss") +
        file.originalname.match(/\..*$/)![0]
    );
  },
});

export const uploader = multer({
  storage,
  limits: { fileSize: UPLOAD_LIMIT_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/mpeg" ||
      file.mimetype === "video/mp2t" ||
      file.mimetype === "video/webm"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error(
        `サポートされているファイル形式: ${ALLOWED_FORMATS}`
      );
      err.name = "ExtensionError";
      return cb(err);
    }
  },
}).array("videos", 4);

export default uploader