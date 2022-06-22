import {
  ALLOWED_FORMATS,
  ALLOWED_FORMATS_REGEX,
  MPEGTS_FORMATS_REGEX,
} from "./constants";
import { SITE_BASEURL } from "./environment";
import { VideoFilesProvider } from "./types";

export const indexDocument = ({ files, pagination }: VideoFilesProvider) => `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>videos.iamtakagi.net</title>
    <meta
      property="description"
      content="動画配信サーバ"
    />
    <meta
      property="og:title"
      content="videos.iamtakagi.net"
    />
    <meta
      property="og:description"
      content="動画配信サーバ"
    />
    <style>
      h1 {
        font-size: 1.3rem;
      }
      h2 {
        font-size: 1.2rem;
      }
      h3 {
        font-size: 1.1rem;
      }
      table {
        border-collapse: collapse;
      }
      table,
      th,
      td {
        border: 1px solid gray;
      }
      th,
      td {
        padding: 8px;
      }
      
      img {
        cursor:pointer;
        transition:0.3s;
      }
      
      img:hover {opacity: 0.7;}
      
      .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        padding-top: 100px; /* Location of the box */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.9); /* Black w/ opacity */
      }
      
      .modal-content {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
      }
      
      #caption {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
        text-align: center;
        color: #ccc;
        padding: 10px 0;
        height: 150px;
      }
      
      /* Add Animation - Zoom in the Modal */
      .modal-content, #caption {
        animation-name: zoom;
        animation-duration: 0.6s;
      }
      
      @keyframes zoom {
        from {transform:scale(0)}
        to {transform:scale(1)}
      }
      
      /* The Close Button */
      .close {
        position: absolute;
        top: 15px;
        right: 35px;
        color: #f1f1f1;
        font-size: 40px;
        font-weight: bold;
        transition: 0.3s;
      }
      
      .close:hover,
      .close:focus {
        color: #bbb;
        text-decoration: none;
        cursor: pointer;
      }
      
      /* 100% video Width on Smaller Screens */
      @media only screen and (max-width: 700px){
        .modal-content {
          width: 100%;
        }
      }
    </style>
    <script src="/assets/mpegts.js"></script>
    <script type="text/javascript">
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
    <nav style="display:flex;flex-direction:column;">
      <section style="margin-bottom:1rem;">
        <h1 style="margin:0;">動画配信サーバ</h1>
        <p style="margin:0;">動画置き場 (?)</p>
      </section>
      <span>動画ファイル数: ${files.length}</span>
      <a href="/upload">動画ファイルをアップロードする (管理者用)</a>
      <a href="/delete">動画ファイルを削除する (管理者用)</a>
    </nav>
    <hr style="margin-top: 1.2rem; margin-bottom: 1.2rem;" />
    <main>
    <section>
    <h2>配信されている動画一覧</h2>
    <div style="display:flex;flex-wrap:wrap;">
      ${pagination.files
        .map((fileName) => {
          return `<div id="${fileName}" style="display:flex;flex-direction:column;max-width:200px;margin:.2rem;cursor:pointer;" onclick="play('${fileName}');">
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

export const playerDocument = (
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
    <style>
      h1 {
        font-size: 1.3rem;
      }
      h2 {
        font-size: 1.2rem;
      }
      h3 {
        font-size: 1.1rem;
      }
      table {
        border-collapse: collapse;
      }
      table,
      th,
      td {
        border: 1px solid gray;
      }
      th,
      td {
        padding: 8px;
      }
      
      img {
        cursor:pointer;
        transition:0.3s;
      }
      
      img:hover {opacity: 0.7;}
      
      .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        padding-top: 100px; /* Location of the box */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.9); /* Black w/ opacity */
      }
      
      .modal-content {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
      }
      
      #caption {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
        text-align: center;
        color: #ccc;
        padding: 10px 0;
        height: 150px;
      }
      
      /* Add Animation - Zoom in the Modal */
      .modal-content, #caption {
        animation-name: zoom;
        animation-duration: 0.6s;
      }
      
      @keyframes zoom {
        from {transform:scale(0)}
        to {transform:scale(1)}
      }
      
      /* The Close Button */
      .close {
        position: absolute;
        top: 15px;
        right: 35px;
        color: #f1f1f1;
        font-size: 40px;
        font-weight: bold;
        transition: 0.3s;
      }
      
      .close:hover,
      .close:focus {
        color: #bbb;
        text-decoration: none;
        cursor: pointer;
      }
      
      /* 100% video Width on Smaller Screens */
      @media only screen and (max-width: 700px){
        .modal-content {
          width: 100%;
        }
      }
    </style>
    <script src="/assets/mpegts.js"></script>
    <script type="text/javascript">
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
    <nav style="display:flex;flex-direction:column;">
      <section style="margin-bottom:1rem;">
        <h1 style="margin:0;">動画配信サーバ</h1>
        <p style="margin:0;">動画置き場 (?)</p>
      </section>
      <span>動画ファイル数: ${files.length}</span>
      <a href="/upload">動画ファイルをアップロードする (管理者用)</a>
      <a href="/delete">動画ファイルを削除する (管理者用)</a>
    </nav>
    <hr style="margin-top: 1.2rem; margin-bottom: 1.2rem;" />
    <main>
    <section>
    <h2>配信されている動画一覧</h2>
    <div style="display:flex;flex-wrap:wrap;">
    ${pagination.files
      .map((fileName) => {
        return `<div id="${fileName}" style="display:flex;flex-direction:column;max-width:200px;margin:.2rem;cursor:pointer;" onclick="play('${fileName}');">
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
    <script type="text/javascript">
      (async () => {
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
      })();
    </script>
  </body>
</html>
`;

export const uploadDocument = (files: string[]) => `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>videos.iamtakagi.net / 動画ファイルをアップロードする</title>
    <meta property="description" content="動画配信サーバ" />
    <meta property="og:title" content="videos.iamtakagi.net / 動画ファイルをアップロードする" />
    <meta
      property="og:description"
      content="動画配信サーバ"
    />
    <style>
      h1 {
        font-size: 1.3rem;
      }
      h2 {
        font-size: 1.2rem;
      }
      h3 {
        font-size: 1.1rem;
      }
      video {
        max-width: 200px;
        cursor:pointer;
        transition:0.3s;
        display: block;
      }
      
      video:hover {opacity: 0.7;}
      
      .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        padding-top: 100px; /* Location of the box */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.9); /* Black w/ opacity */
      }
      
      .modal-content {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
      }
      
      #caption {
        margin: auto;
        display: block;
        width: 80%;
        max-width: 700px;
        text-align: center;
        color: #ccc;
        padding: 10px 0;
        height: 150px;
      }
      
      /* Add Animation - Zoom in the Modal */
      .modal-content, #caption {
        animation-name: zoom;
        animation-duration: 0.6s;
      }
      
      @keyframes zoom {
        from {transform:scale(0)}
        to {transform:scale(1)}
      }
      
      /* The Close Button */
      .close {
        position: absolute;
        top: 15px;
        right: 35px;
        color: #f1f1f1;
        font-size: 40px;
        font-weight: bold;
        transition: 0.3s;
      }
      
      .close:hover,
      .close:focus {
        color: #bbb;
        text-decoration: none;
        cursor: pointer;
      }

      /* The Close Button */
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
      
      /* 100% video Width on Smaller Screens */
      @media only screen and (max-width: 700px){
        .modal-content {
          width: 100%;
        }
      }
      
      video:hover {opacity: 0.7;}
    </style>
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
      <a href="/">インデックスに戻る</a>
    </nav>
    <hr style="margin-top: 1.2rem; margin-bottom: 1.2rem" />
    <main>
      <section>
        <h2>動画ファイルをアップロードする (管理者用)</h2>
        <form action="/upload" method="POST" enctype="multipart/form-data" style="display:flex;flex-direction:column;">
          <div id="preview" style="display:flex; flex-wrap: wrap;"></div>
          <label for="file">アップロードする動画ファイル選択してください (4つまで選択可)</label>
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
    <script src="/assets/mpegts.js"></script>
    <script type="text/javascript">
    (() => {
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
                url: 'http://localhost:3000/mpegts?fileName=' + this.id,
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
    })();
    </script>
  </body>
</html>  
`;

export const deleteDocument = ({ files, pagination }: VideoFilesProvider) => `
<!DOCTYPE html>
<html lang="ja">
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>videos.iamtakagi.net / 動画ファイルを削除する</title>
  <meta property="description" content="動画配信サーバ" />
  <meta property="og:title" content="videos.iamtakagi.net / 動画ファイルを削除する" />
  <meta
    property="og:description"
    content="動画配信サーバ"
  />
    <style>
      h1 {
        font-size: 1.3rem;
      }
      h2 {
        font-size: 1.2rem;
      }
      h3 {
        font-size: 1.1rem;
      }
      table {
        border-collapse: collapse;
      }
      table,
      th,
      td {
        border: 1px solid gray;
      }
      th,
      td {
        padding: 8px;
      }
      
      img {
        cursor:pointer;
        transition:0.3s;
      }
      
      img:hover {opacity: 0.7;}
    </style>
    <script src="/assets/mpegts.js"></script>
    <script type="text/javascript">
      async function deleteVideoFile(fileName) {
        const isConfrimed = window.confirm("この動画ファイルを削除しますか？ (" + fileName + ")");

        if(isConfrimed) {
          fetch("/delete?fileName=" + fileName, {method: 'DELETE'}).then((res) => {
            console.log(res);
            if(res.status === 204) {
              window.alert("動画ファイルが削除されました");
              modal.style.display = "none";
              location.reload();
            } else if (res.status === 404 ){
              window.alert("動画ファイルが存在しません (" + JSON.stringfy(res.body) + ")");
            } else if (res.status === 500 ) {
              window.alert("動画ファイル削除に失敗しました (" + JSON.stringfy(res.body) + ")");
            }
          })
        }
      }; 
    </script>
  </head>
  <body>
    <nav style="display:flex;flex-direction:column;">
      <section style="margin-bottom:1rem;">
        <h1 style="margin:0;">動画配信サーバ</h1>
        <p style="margin:0;">動画置き場 (?)</p>
      </section>
      <span>動画ファイル数: ${files.length}</span>
      <a href="/upload">動画ファイルをアップロードする (管理者用)</a>
      <a href="/delete">動画ファイルを削除する (管理者用)</a>
      <a href="/">インデックスに戻る</a>
    </nav>
    <hr style="margin-top: 1.2rem; margin-bottom: 1.2rem;" />
    <main>
      <section>
        <h2>動画ファイルを削除する (管理者用)</h2>
        <p>削除したい動画をクリックしてください</p>
        <div style="display:flex;flex-wrap:wrap;">
    ${pagination.files
      .map((fileName) => {
        return `<div id="${fileName}" style="display:flex;flex-direction:column;max-width:200px;margin:.2rem;cursor:pointer;" onclick="deleteVideoFile('${fileName}');">
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
        <video class="modal-content" id="modal-video"></video>
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
