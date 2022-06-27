import auth from "basic-auth";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { checkAuth } from "./auth";
import { ALLOWED_FORMATS_REGEX, PAGE_SIZE } from "./constants";
import { SITE_BASEURL } from "./environment";
import { readSyncVideoFiles } from "./files";
import { paginate } from "./pagination";
import { encode } from "./mpegts";
import { uploader } from "./uploader";
import stream from "stream";
import { name as APP_NAME, version as APP_VERSION } from "../package.json";
import { shot } from "./thumbnail";
import { ytdlp } from "./yt-dlp";
import { IndexPage } from "./pages";
import { UploadPage } from "./pages/upload";
import { DeletePage } from "./pages/delete";
import { PlayerPage } from "./pages/player";
import { YtdlpPage } from "./pages/yt-dlp";

const app = express();


app.get("/", (req, res, next) => {
  const { page } = req.query;

  const files = readSyncVideoFiles();

  const index = page && typeof page === "string" ? parseInt(page) : 1 as const;

  const currentPaginated = paginate(files, PAGE_SIZE, index);
  const prevPaginated = paginate(files, PAGE_SIZE, index - 1);
  const nextPaginated = paginate(files, PAGE_SIZE, index + 1);
  const pagination = {
    index,
    size: PAGE_SIZE,
    prev: prevPaginated.length != 0 ? index - 1 : null,
    next: nextPaginated.length != 0 ? index + 1 : null,
    files: currentPaginated,
  };
  const provider = { files, pagination };
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-DPR", "2.0");
  res.send(IndexPage(provider));
});

app.get("/mpegts", (req, res, next) => {
  const { fileName } = req.query;
  if (!fileName || typeof fileName !== "string") return next();
  // 動画ファイルが存在しない
  if (!fs.existsSync(path.resolve(__dirname, "..", "storage", fileName)))
    return res.status(404).end();

  const rs = fs.createReadStream(
    path.resolve(__dirname, "..", "storage", fileName)
  );

  // m2tsll
  const encodeProcess = encode();
  encodeProcess.on("error", (err: any) => {
    console.log(err);
    if (err.code == "EPIPE") {
      console.log("a");
    } else {
      encodeProcess.kill();
    }
    res.end();
  });
  encodeProcess.stdio[0].on("error", (err: any) => {
    console.log(err);
    if (err.code == "EPIPE") {
      console.log("b");
    } else {
      encodeProcess.kill();
    }
    res.end();
  });
  encodeProcess.stdio[1].on("error", (err: any) => {
    console.log(err);
    if (err.code == "EPIPE") {
      console.log("c");
    } else {
      encodeProcess.kill();
    }
    res.end();
  });
  rs.pipe(encodeProcess.stdio[0]);
  const spt = encodeProcess.stdio[1].pipe(
    new stream.PassThrough({ highWaterMark: 1920 * 1080 })
  );
  res.contentType("application/octet-stream");
  spt.pipe(res, { end: true });
  res.on("close", () => {
    encodeProcess.kill();
    res.end();
  });
});

app.get("/thumbnail", (req, res, next) => {
  const { fileName } = req.query;
  if (!fileName || typeof fileName !== "string") return next();
  // 動画ファイルが存在しない -> 404
  if (!fs.existsSync(path.resolve(__dirname, "..", "storage", fileName)))
    return res.status(404).end();
  // サムネイルファイルが存在しない
  if (
    !fs.existsSync(
      path.resolve(__dirname, "..", "thumbnail", `${fileName}.jpg`)
    )
  ) {
    // 生成 -> 保存 -> 返却
    const rs = fs.createReadStream(
      path.resolve(__dirname, "..", "storage", fileName)
    );
    const shotProcess = shot();
    shotProcess.on("error", (err: any) => {
      console.log(err);
      if (err.code == "EPIPE") {
        console.log("a");
      } else {
        shotProcess.kill();
      }
      res.end();
    });
    shotProcess.stdio[0].on("error", (err: any) => {
      console.log(err);
      if (err.code == "EPIPE") {
        console.log("b");
      } else {
        shotProcess.kill();
      }
      res.end();
    });
    shotProcess.stdio[1].on("error", (err: any) => {
      console.log(err);
      if (err.code == "EPIPE") {
        console.log("c");
      } else {
        shotProcess.kill();
      }
      res.end();
    });
    rs.pipe(shotProcess.stdio[0]);
    const spt = shotProcess.stdio[1].pipe(
      new stream.PassThrough({ highWaterMark: 1920 * 1080 })
    );
    // 保存
    const ws = fs.createWriteStream(
      path.resolve(__dirname, "..", "thumbnail", `${fileName}.jpg`)
    );
    spt.pipe(ws);

    // 返却
    res.contentType("image/jpg");
    spt.pipe(res, { end: true });
  } else {
    //生成済みのファイルを返却
    const rs = fs.createReadStream(
      path.resolve(__dirname, "..", "thumbnail", `${fileName}.jpg`)
    );
    const spt = rs.pipe(new stream.PassThrough({ highWaterMark: 1920 * 1080 }));
    res.contentType("image/jpg");
    res.setHeader("Content-DPR", "2.0");
    spt.pipe(res, { end: true });
  }
});

app.post("/upload", (req, res, next) => {
  const credentials = auth(req);
  if (!credentials || !checkAuth(credentials.name, credentials.pass)) {
    res.status(401);
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Access to the staging site", charset="UTF-8"'
    );
    res.end("Access denied");
    return;
  }

  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res
        .status(500)
        .send({ error: { message: `Multer uploading error: ${err.message}` } })
        .end();
      return;
    } else if (err) {
      if (err.name == "ExtensionError") {
        res
          .status(413)
          .send({ error: { message: err.message } })
          .end();
      } else {
        res
          .status(500)
          .send({
            error: { message: `unknown uploading error: ${err.message}` },
          })
          .end();
      }
      return;
    }
    res.redirect(SITE_BASEURL);
  });
});

app.get("/upload", (req, res) => {
  const files = readSyncVideoFiles();
  res.setHeader("Content-Type", "text/html");
  res.status(201);
  res.send(UploadPage(files));
});

app.get("/delete", (req, res, next) => {
  const { page } = req.query;

  const files = readSyncVideoFiles();

  const index = page && typeof page === "string" ? parseInt(page): 1 as const;

  const paginated = paginate(files, PAGE_SIZE, index);
  const prevPaginated = paginate(files, PAGE_SIZE, index - 1);
  const nextPaginated = paginate(files, PAGE_SIZE, index + 1);
  const pagination = {
    index,
    size: PAGE_SIZE,
    prev: prevPaginated.length != 0 ? index - 1 : null,
    next: nextPaginated.length != 0 ? index + 1 : null,
    files: paginated,
  };
  const provider = { files, pagination };
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-DPR", "2.0");
  res.send(DeletePage(provider));
});

app.delete("/delete", (req, res, next) => {
  const credentials = auth(req);
  if (!credentials || !checkAuth(credentials.name, credentials.pass)) {
    res.status(401);
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Access to the staging site", charset="UTF-8"'
    );
    res.end("Access denied");
    return;
  }

  const { fileName } = req.query;

  if (!fileName || typeof fileName !== "string") return next();

  // 動画ファイルが存在しない
  if (!fs.existsSync(path.resolve(__dirname, "..", "storage", fileName)))
    return res.status(404).end();

  try {
    // 動画ファイル削除
    fs.unlinkSync(path.resolve(__dirname, "..", "storage", fileName));

    //サムネファイルがあったら削除
    if (
      fs.existsSync(
        path.resolve(__dirname, "..", "thumbnail", `${fileName}.jpg`)
      )
    ) {
      fs.unlinkSync(
        path.resolve(__dirname, "..", "thumbnail", `${fileName}.jpg`)
      );
    }
  } catch (error) {
    res.status(500).send(error).end();
  }
  res.status(204); // >> 論理削除なら200、物理削除なら204でいけそうです by https://qiita.com/mfykmn/items/02a0b5448228e0b248b3
  res.end();
});

app.get("/i/:fileName", (req, res, next) => {
  const { fileName } = req.params;
  if (!fileName || typeof fileName !== "string") return next();
  if (!ALLOWED_FORMATS_REGEX.test(fileName))
    return res.status(415).send({ error: "Unsupported Media Type" }).end();
  const files = readSyncVideoFiles();
  const index = 1 as const;
  const paginated = paginate(files, PAGE_SIZE, index);
  const prevPaginated = paginate(files, PAGE_SIZE, index - 1);
  const nextPaginated = paginate(files, PAGE_SIZE, index + 1);
  const pagination = {
    index,
    size: PAGE_SIZE,
    prev: prevPaginated.length != 0 ? index - 1 : null,
    next: nextPaginated.length != 0 ? index + 1 : null,
    files: paginated,
  };
  const provider = { files, pagination };
  res.setHeader("Content-Type", "text/html");
  res.send(PlayerPage(fileName, provider));
});

app.put("/yt-dlp", (req, res, next) => {
  const credentials = auth(req);
  if (!credentials || !checkAuth(credentials.name, credentials.pass)) {
    res.status(401);
    res.setHeader(
      "WWW-Authenticate",
      'Basic realm="Access to the staging site", charset="UTF-8"'
    );
    res.end("Access denied");
    return;
  }
  
  const { url } = req.query;

  if (!url || typeof url !== "string") return next();

  ytdlp(url, {
    onError: (error) => {
      console.log("Exec error: " + error);
      res.status(500).send({output: error?.toString()}).end()
    }, 
    onStdout: (stdout) => {
      console.log("stdout: " + stdout);
      res.status(200).send({output: stdout}).end()
    }, 
    onStderr: (stderr) => {
      console.log("stderr: " + stderr);
      res.status(500).send({output: stderr}).end();
    },
  });
})

app.get("/yt-dlp", (req, res, next) => {
  const files = readSyncVideoFiles();
  res.setHeader("Content-Type", "text/html");
  res.send(YtdlpPage(files));
})

app.use("/assets", express.static(path.resolve(__dirname, "..", "assets")));

app.use(express.static(path.resolve(__dirname, "..", "storage")));

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`[${APP_NAME}/${APP_VERSION}] Listen on ${SITE_BASEURL}`);
