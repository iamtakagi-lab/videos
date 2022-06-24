import { ALLOWED_FORMATS, MPEGTS_FORMATS_REGEX } from "../constants";
import { SITE_BASEURL } from "../environment";
import { VideoFilesProvider } from "../types";

export const DeletePage = ({ files, pagination }: VideoFilesProvider) => `
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
  <link rel="stylesheet" type="text/css" href="/assets/style.css" />
  <script src="/assets/mpegts.js"></script>
  <script type="text/javascript">
    async function deleteVideoFile(fileName) {
      const isConfrimed = window.confirm("この動画ファイルを削除しますか？ (" + fileName + ")");

      if(isConfrimed) {
        fetch("/delete?fileName=" + fileName, {method: 'DELETE'}).then((res) => {
          if(res.status === 204) {
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