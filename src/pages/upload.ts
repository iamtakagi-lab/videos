import { ALLOWED_FORMATS, MPEGTS_FORMATS_REGEX } from "../constants";
import { SITE_BASEURL } from "../environment";
import { VideoFilesProvider } from "../types";

export const UploadPage = (files: string[]) => `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>videos.iamtakagi.net / 動画ファイルをアップロードする</title>
    <meta property="description" content="動画配信サーバ" />
    <meta
      property="og:title"
      content="videos.iamtakagi.net / 動画ファイルをアップロードする"
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
      window.addEventListener('DOMContentLoaded', (event) => {
        document.getElementById("file").value = "";
        document.getElementById("preview").innerHTML = "";

        document.getElementById("clear").addEventListener("click", () => {
          document.getElementById("file").value = "";
          document.getElementById("preview").innerHTML = "";
        });

        function previewVideo (file) {
          const reader = new FileReader();
          const preview = document.getElementById("preview");

          reader.onload = function (e) {
            const videoUrl = e.target.result; // 動画のURLはevent.target.resultで呼び出せる

            const videoWrapper = document.createElement("div");
            videoWrapper.setAttribute("id", file.name);
            videoWrapper.style.display = "flex";
            videoWrapper.style.flexDirection = "column";

            const detailsWrapper = document.createElement("div");
            detailsWrapper.style.display = "inline-flex";
            detailsWrapper.style.justifyContent = "space-between";

            const videoDesc = document.createElement("span");
            videoDesc.innerText = file.name;
            videoDesc.style.fontSize = ".8rem";

            const del = document.createElement("span");
            del.style.fontSize = ".8rem";
            del.innerText = "削除";
            del.setAttribute("class", "delete");

            // ファイル選択から指定されたインデックスのファイルを削除する
            function removeFileFromFileList(index) {
              const dt = new DataTransfer()
              const input = document.getElementById('file')
              const { files } = input;

              for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (index !== i)
                  dt.items.add(file);
              }

              input.files = dt.files // 更新
            }

            del.onclick = function () {
              const files = document.getElementById("file").files
              for (let i = 0; i < files.length; i ++) {
                console.log(files);
                console.log(files[i]);
                console.log(file.name);
                if(file.name === files[i].name) {
                  removeFileFromFileList(i)
                  document.getElementById(file.name).remove();
                }
              }
            };

            const video = document.createElement("video"); // video要素を作成

            video.onclick = async function () {
              const modal = document.getElementById("modal");
              const modalPlayer = document.getElementById("modal-video");
              const caption = document.getElementById("caption");

              modal.style.display = "block";
              caption.innerText = this.id;

              modalPlayer.src = "";

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

              if(${MPEGTS_FORMATS_REGEX}.test(this.id)) {
                isMpegts = true
                mpegtsPlayer = mpegts.createPlayer({
                  type: 'mpegts',
                  url: '${SITE_BASEURL}/mpegts?fileName=' + this.id,
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
                const blob = await fetch(this.src).then((r) => r.blob());
                const objectUrl = createObjectURL(blob);
                modalPlayer.src = objectUrl;
              }

              const span = document.getElementsByClassName("close")[0];
              span.onclick = function () {
                modal.style.display = "none";
                if(isMpegts) {
                  mpegtsPlayer_destroy();
                } else {
                  modalPlayer_destroy();
                }
              }
            }
            video.src = videoUrl;
            video.alt = file.name;

            videoWrapper.appendChild(video);
            detailsWrapper.appendChild(videoDesc);
            detailsWrapper.appendChild(del);
            videoWrapper.appendChild(detailsWrapper);
            preview.appendChild(videoWrapper);
          };
          reader.readAsDataURL(file);
        }

        function handleFileSelect (e) {
          const files = e.target.files || e.dataTransfer.files;
          if (files.length > 4) {
            alert('動画ファイルは4つまで選択可能です');
          }
          for (let i = 0; i < files.length; i++) {
            previewVideo(files[i]);
          }
        }
        document.getElementById("file").addEventListener('change', handleFileSelect);
      });
    </script>
  </head>
  <body>
    <nav style="display: flex; flex-direction: column">
      <section style="margin-bottom: 1rem">
        <h1 style="margin: 0">動画配信サーバ</h1>
        <p style="margin: 0">動画置き場 (?)</p>
      </section>
      <span>動画ファイル数: ${files.length}</span>
      <a href="/upload">動画ファイルをアップロードする (管理者用)</a>
      <a href="/delete">動画ファイルを削除する (管理者用)</a>
      <a href="/yt-dlp">yt-dlp を使用してサーバーで直接ダウンロードする (管理者用)</a>
      <a href="/">インデックスに戻る</a>
    </nav>
    <hr style="margin-top: 1.2rem; margin-bottom: 1.2rem" />
    <main>
      <section>
        <h2>動画ファイルをアップロードする (管理者用)</h2>
        <form
          action="/upload"
          method="POST"
          enctype="multipart/form-data"
          style="display: flex; flex-direction: column"
        >
          <div id="preview" style="display: flex; flex-wrap: wrap"></div>
          <label for="file"
            >アップロードする動画ファイル選択してください (4つまで選択可)</label
          >
          <input
            type="file"
            multiple="multiple"
            accept="video/*"
            name="videos"
            id="file"
          />
          <span>サポートされているファイル形式: ${ALLOWED_FORMATS}</span>
          <button id="clear" type="button">クリア</button>
          <button type="submit">アップロード</button>
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