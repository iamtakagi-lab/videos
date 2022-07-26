import { ALLOWED_FORMATS, MPEGTS_FORMATS_REGEX } from "../constants";
import { SITE_BASEURL } from "../environment";
import { VideoFilesProvider } from "../types";

export const PlayerPage = (
  fileName: string,
  { files, pagination }: VideoFilesProvider
) => `
  <!DOCTYPE html>
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>videos.iamtakagi.net</title>
      <meta
        property="description"
        content="${fileName}"
      />
      <meta
        property="og:title"
        content="videos.iamtakagi.net"
      />
      <meta
        property="og:description"
        content="${fileName}"
      />
      <meta
        property="og:image"
        content="${SITE_BASEURL}/thumbnail?fileName=${fileName}"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="stylesheet" type="text/css" href="/assets/style.css" />
      <script src="/assets/mpegts.js"></script>
      <script type="text/javascript">
        window.addEventListener('DOMContentLoaded', async (event) => {
          // load modal player
          const modal = document.getElementById("modal");
          const modalPlayer = document.getElementById("modal-video");
          const caption = document.getElementById("caption");
              
          modal.style.display = "block";
          modalPlayer.src = "";
          caption.innerText = "${fileName}";
  
          let isMpegts = false;
          let mpegtsPlayer = null;
  
          function mpegtsPlayer_destroy() {
            mpegtsPlayer.pause();
            mpegtsPlayer.unload();
            mpegtsPlayer.detachMediaElement();
            mpegtsPlayer.destroy();
            mpegtsPlayer = null;
            console.log("[mpegts.js Player] destroyed.")
          }
  
          function modalPlayer_destroy() {
            modalPlayer.pause();
            modalPlayer.src = "";
            console.log("[Modal Player] destroyed.");
          }
  
          if(${MPEGTS_FORMATS_REGEX}.test("${fileName}")) {
            isMpegts = true
            mpegtsPlayer = mpegts.createPlayer({
              type: 'mpegts',
              url: '${SITE_BASEURL}/mpegts?fileName=' + '${fileName}',
              }, {
              enableWorker: true,
              lazyLoad: true,
              lazyLoadMaxDuration: 3 * 60,
              seekType: 'range'
            });
            mpegtsPlayer.attachMediaElement(modalPlayer);
            mpegtsPlayer.load();
            mpegtsPlayer.play();        
          } else {
            function createObjectURL(obj) {
              return window.URL
                ? window.URL.createObjectURL(obj)
                : window.webkitURL.createObjectURL(obj);
            }
            const blob = await fetch("${SITE_BASEURL}/${fileName}").then((r) => r.blob());
            const objectUrl = createObjectURL(blob);
            modalPlayer.src = objectUrl;
            modalPlayer.load();
            modalPlayer.play();
          }
  
          const span = document.getElementsByClassName("close")[0];
          span.onclick = function () {
            history.pushState(null, null, "/");
            modal.style.display = "none";
  
            if(isMpegts) {
              mpegtsPlayer_destroy();
            } else {
              modalPlayer_destroy();
            }
          }
        });
  
        async function play(fileName) {
          history.pushState(null, null, "/i/" + fileName);
  
          const modal = document.getElementById("modal");
          const modalPlayer = document.getElementById("modal-video");
          const caption = document.getElementById("caption");
              
          modal.style.display = "block";
          modalPlayer.src = "";
          caption.innerText = fileName;
  
          let isMpegts = false;
          let mpegtsPlayer = null;
  
          function mpegtsPlayer_destroy() {
            mpegtsPlayer.pause();
            mpegtsPlayer.unload();
            mpegtsPlayer.detachMediaElement();
            mpegtsPlayer.destroy();
            mpegtsPlayer = null;
            console.log("[mpegts.js Player] destroyed.")
          }
  
          function modalPlayer_destroy() {
            modalPlayer.pause();
            modalPlayer.src = "";
            console.log("[Modal Player] destroyed.");
          }
  
          if(${MPEGTS_FORMATS_REGEX}.test(fileName)) {
            isMpegts = true
            mpegtsPlayer = mpegts.createPlayer({
              type: 'mpegts',
              url: '${SITE_BASEURL}/mpegts?fileName=' + fileName,
              }, {
                enableWorker: true,
                lazyLoad: true,
                lazyLoadMaxDuration: 3 * 60,
                seekType: 'range'
            });
            mpegtsPlayer.attachMediaElement(modalPlayer);
            mpegtsPlayer.load();
            mpegtsPlayer.play();        
          } else {
            function createObjectURL(obj) {
              return window.URL
                ? window.URL.createObjectURL(obj)
                : window.webkitURL.createObjectURL(obj);
            }
            const blob = await fetch("${SITE_BASEURL}/" + fileName).then((r) => r.blob());
            const objectUrl = createObjectURL(blob);
            modalPlayer.src = objectUrl;
            modalPlayer.load();
            modalPlayer.play();
          }
  
          const span = document.getElementsByClassName("close")[0];
          span.onclick = function () {
            history.pushState(null, null, "/");
            modal.style.display = "none";
  
            if(isMpegts) {
              mpegtsPlayer_destroy();
            } else {
              modalPlayer_destroy();
            };
          };
        }; 
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
        <a href="/upload">動画ファイルをアップロードする (管理者用)</a>
        <a href="/delete">動画ファイルを削除する (管理者用)</a>
        <a href="/yt-dlp">yt-dlp を使用してサーバで直接ダウンロードする (管理者用)</a>
        </nav>
      </header>
      <hr style="margin-top: 1.2rem; margin-bottom: 1.2rem;" />
      <main>
      <section>
      <h2>配信されている動画一覧</h2>
      <div style="display:flex;flex-wrap:wrap;">
      ${pagination.files
        .map((fileName) => {
          return `<div id="${fileName}" style="display:flex;flex-direction:column;max-width:200px;cursor:pointer;" onclick="play('${fileName}');">
            <img src="${SITE_BASEURL}/thumbnail?fileName=${fileName}" id="${fileName}" alt="${fileName}" width="200px"></img>
            <span style="font-size:.8rem;transition:0.3s;" onmouseover="this.style.opacity=0.7;" onmouseout="this.style.opacity=1.0;">${fileName}</span>
            </div>`;
        })
        .join("")}
      </div>
      <span style="margin-top:1rem;display:inline-block;">
      ${
        pagination.prev
          ? `<a href="${SITE_BASEURL}?page=${pagination.prev}" style="margin-right:.7rem;"><- 前のページ</a>`
          : ``
      } 
      ${
        pagination.next
          ? `<a href="${SITE_BASEURL}?page=${pagination.next}">次のページ -></a>`
          : ``
      }
    </span>
    </section>
        <div id="modal" class="modal">
          <span class="close">&times;</span>
          <video class="modal-content" id="modal-video" controls autoplay></video>
          <div id="caption"></div>
        </div>
      </main>
      <hr style="margin-top: 1.2rem" />
      <footer style="display: flex; flex-direction: column;">
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
