// functions/index.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 主页：文章列表
  if (pathname === '/' || pathname === '/index.html') {
    // 拉取文章列表
    const api = url.origin + '/api/posts';
    const res = await fetch(api);
    const { data: posts } = await res.json();

    let html = `
      <html>
      <head>
        <title>开放技术网博客</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>
          body{font-family:sans-serif;max-width:680px;margin:0 auto;}
          h1{margin-top:32px;}
          .post-list{margin-top:24px;}
          .post-item{padding:12px 0;border-bottom:1px solid #eee;}
          a{color:#06f;text-decoration:none;}
          .footer{margin:32px 0;color:#888;font-size:14px;}
        </style>
      </head>
      <body>
        <h1>开放技术网博客</h1>
        <div class="post-list">
          ${posts.length ? posts.map(
            p => `<div class="post-item">
              <a href="/post/${p.id}">${p.title}</a>
              <span style="color:#aaa;font-size:12px;margin-left:8px;">${p.created_at.slice(0,16).replace('T',' ')}</span>
            </div>`
          ).join('') : '<div>暂无文章</div>'}
        </div>
        <div class="footer">
          <a href="/admin">后台管理</a> | Powered by <a href="https://openjsw.org" target="_blank">开放技术</a>
        </div>
      </body>
      </html>
    `;
    return new Response(html, { headers: { 'content-type': 'text/html;charset=utf-8' } });
  }

  // 文章详情页
  if (pathname.startsWith('/post/')) {
    const id = pathname.split('/').pop();
    // 拉取文章和评论
    const res = await fetch(url.origin + `/api/post?id=${id}`);
    const { data } = await res.json();

    if (!data || !data.post) {
      return new Response(`<html><body><h2>404 文章不存在</h2><a href="/">返回首页</a></body></html>`, {
        headers: { 'content-type': 'text/html;charset=utf-8' }, status: 404
      });
    }

    let html = `
      <html>
      <head>
        <title>${data.post.title} | 开放技术网</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>
          body{font-family:sans-serif;max-width:680px;margin:0 auto;}
          h2{margin:32px 0 8px 0;}
          .content{margin-bottom:32px;}
          .comment{margin:8px 0;padding:8px 12px;border-left:2px solid #eee;background:#fafbfc;}
          .comment-form input,.comment-form textarea{margin-bottom:8px;width:99%;padding:6px;}
          .comment-form button{padding:6px 16px;}
          .back{margin-top:24px;}
        </style>
      </head>
      <body>
        <h2>${data.post.title}</h2>
        <div class="content">${data.post.content.replace(/\n/g, "<br>")}</div>
        <hr>
        <h3>评论区</h3>
        <div id="comments">
          ${data.comments.length ? data.comments.map(
            c => `<div class="comment"><b>${c.author}</b>: ${c.content} <span style="color:#bbb;font-size:12px;">${c.created_at.slice(0,16).replace('T',' ')}</span></div>`
          ).join('') : '<div style="color:#aaa">暂无评论</div>'}
        </div>
        <form id="commentForm" class="comment-form" autocomplete="off">
          <input name="author" placeholder="昵称" required maxlength="20"><br>
          <textarea name="content" placeholder="你的评论..." required maxlength="300" rows="3"></textarea><br>
          <button type="submit">提交评论</button>
          <input type="hidden" name="post_id" value="${id}">
        </form>
        <div id="commentResult" style="color:#c00;margin:12px 0;"></div>
        <div class="back"><a href="/">← 返回首页</a></div>
        <script>
        document.getElementById('commentForm').onsubmit = async function(e) {
          e.preventDefault();
          const form = e.target;
          const data = {
            author: form.author.value,
            content: form.content.value,
            post_id: form.post_id.value
          };
          const resp = await fetch('/api/comments', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data)
          });
          const res = await resp.json();
          document.getElementById('commentResult').textContent = res.msg;
          if(res.code === 0) setTimeout(()=>location.reload(), 500);
        }
        </script>
      </body>
      </html>
    `;
    return new Response(html, { headers: { 'content-type': 'text/html;charset=utf-8' } });
  }

  // 404
  return new Response('<h2>404 Not Found</h2>', { status: 404, headers: { 'content-type': 'text/html' } });
}
