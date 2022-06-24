import { ALLOWED_FORMATS, MPEGTS_FORMATS_REGEX } from "../constants";
import { SITE_BASEURL } from "../environment";
import { VideoFilesProvider } from "../types";

export const YtdlpPage = (files: string[]) => `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>videos.iamtakagi.net / yt-dlp を使用してサーバ上に直接ダウンロードする</title>
    <meta property="description" content="動画配信サーバ" />
    <meta
      property="og:title"
      content="videos.iamtakagi.net / yt-dlp を使用してサーバ上に直接ダウンロードする"
    />
    <meta property="og:description" content="動画配信サーバ" />
    <link rel="stylesheet" type="text/css" href="/assets/style.css" />
    <style>
      video {
        max-width: 200px;
        cursor:pointer;
        transition:0.3s;
        display: block;
      }
    
      video:hover {opacity: 0.7;}

      .delete {
        color: red;
        font-size: 40px;
        font-weight: bold;
        transition: 0.3s;
      }
      
      .delete:hover,
      .delete:focus {
        opacity: 0.5;
        text-decoration: none;
        cursor: pointer;
      }
    </style>
    <script src="/assets/mpegts.js"></script>
    <script type="text/javascript">
      async function download(event) {
        event.preventDefault();
        const submitBtn = document.getElementById("submit_btn")
        submitBtn.disabled = true;
        const form = document.querySelector("form");
        const status = document.getElementById("status")
        status.innerText = "サーバー上で動画ファイルをダウンロードしています..."
        const url = document.getElementById("url").value;
        const res = await fetch("/yt-dlp?url=" + url, {method: 'PUT'});
        status.innerText = "";
        const output = document.getElementById("output");
        output.value = (await res.json())["output"];
        submitBtn.disabled = false;
      }
    </script>
  </head>
  <body>
  <header style="display:flex;flex-direction:column;">
  <section style="margin-bottom:1rem;">
    <h1 style="margin:0;">動画配信サーバ</h1>
    <p style="margin:0;">動画置き場 (?)</p>
  </section>
  <span>動画ファイル数: ${files.length}</span>
  <nav style="display:flex;flex-direction:column;">
  <a href="/">インデックスに戻る</a>
  <a href="/upload">動画ファイルをアップロードする (管理者用)</a>
  <a href="/delete">動画ファイルを削除する (管理者用)</a>
  <a href="/yt-dlp">yt-dlp を使用してサーバで直接ダウンロードする (管理者用)</a>
  </nav>
</header>
    <hr style="margin-top: 1.2rem; margin-bottom: 1.2rem" />
    <main>
      <section>
        <h2>yt-dlp を使用してサーバーで直接ダウンロードする (管理者用)</h2>
        <form
          onsubmit="download(event)"
          style="display: flex; flex-direction: column"
        >
          <label for="url"
            >動画の URL を入力してください</label
          >
          <input
            type="text"
            id="url"
          />
          <span>サポートされているサイト: <a href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md">ここに載ってる</a></span>
          <button id="submit_btn" type="submit">実行</button>
          <span id="status"></span>
          <textarea id="output" rows="30" cols="50"> </textarea>
        </form>
      </section>
      <div id="modal" class="modal">
        <span class="close">&times;</span>
        <video class="modal-content" id="modal-video" controls autoplay></video>
        <div id="caption"></div>
      </div>
    </main>
    <hr style="margin-top: 1.2rem" />
    <footer style="display: flex; flex-direction: column">
      <span>
        GitHub:
        <a href="https://github.com/iamtakagi/videos">
          https://github.com/iamtakagi/videos
        </a>
      </span>
      <span>
        Author: <a href="https://github.com/iamtakagi">iamtakagi</a>
      </span>
      <span>© iamtakagi.net</span>
    </footer>
  </body>
</html>
`;