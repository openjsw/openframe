// /functions/admin.js
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const cookie = request.headers.get('cookie') || "";
  const logined = cookie.includes('admin=1');

  // 登录页（未登录时）
  if (!logined) {
    return new Response(`
      <html>
      <head>
        <title>后台管理登录</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>
          body {
            font-family: system-ui, sans-serif;
            background: #fafbfc;
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
          }
          .login-box {
            background: #fff;
            padding: 32px 40px 28px 40px;
            border-radius: 12px;
            box-shadow: 0 2px 16px #0002;
            min-width: 320px;
          }
          h2 {
            margin: 0 0 24px 0;
            font-size: 1.6rem;
            text-align: center;
            letter-spacing: .03em;
          }
          label {
            display: block;
            margin-bottom: 10px;
            color: #555;
            font-size: 1rem;
          }
          input[type="password"] {
            width: 100%;
            padding: 10px 8px;
            font-size: 1rem;
            border-radius: 6px;
            border: 1px solid #ccc;
            margin-bottom: 18px;
            box-sizing: border-box;
            background: #f6f6f9;
            transition: border-color .2s;
          }
          input[type="password"]:focus {
            border-color: #2176ff;
            outline: none;
          }
          button {
            width: 100%;
            padding: 10px 0;
            background: #2176ff;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: background .2s;
          }
          button:hover {
            background: #1254c3;
          }
          .back {
            margin-top: 22px;
            text-align: center;
          }
          .back a {
            color: #888;
            text-decoration: none;
            font-size: 0.97rem;
          }
        </style>
      </head>
      <body>
        <div class="login-box">
          <h2>后台管理登录</h2>
          <form method="POST" action="/api/login">
            <label for="password">管理密码：</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">
            <button type="submit">登录</button>
          </form>
          <div class="back">
            <a href="/">返回首页</a>
          </div>
        </div>
      </body>
      </html>
    `, { headers: { 'content-type': 'text/html;charset=utf-8' } });
  }

  // 文章管理页面
  const res = await fetch(url.origin + '/api/posts', { headers: { cookie } });
  const { data: posts } = await res.json();

  let html = `
    <html>
    <head>
      <title>后台管理 - 开放技术网</title>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <style>
        body {
          font-family: system-ui,sans-serif;
          background: #fafbfc;
          margin: 0;
          min-height: 100vh;
        }
        .main-box {
          max-width: 740px;
          margin: 40px auto 0;
          background: #fff;
          padding: 36px 28px 32px 28px;
          border-radius: 16px;
          box-shadow: 0 2px 16px #0001;
        }
        h2 {
          margin: 0 0 18px 0;
          font-size: 1.5rem;
          letter-spacing: .02em;
        }
        .form-item {
          margin: 16px 0 12px 0;
        }
        input[type="text"], textarea {
          width: 100%;
          padding: 10px 8px;
          font-size: 1rem;
          border-radius: 6px;
          border: 1px solid #ccc;
          margin-bottom: 12px;
          box-sizing: border-box;
          background: #f6f6f9;
          transition: border-color .2s;
        }
        input[type="text"]:focus, textarea:focus {
          border-color: #2176ff;
          outline: none;
        }
        textarea {
          min-height: 100px;
        }
        button {
          padding: 10px 32px;
          background: #2176ff;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1.07rem;
          cursor: pointer;
          transition: background .2s;
        }
        button:hover {
          background: #1254c3;
        }
        .msg { color: #c00; margin: 12px 0 0 0; min-height: 22px; }
        .post-list {
          margin: 32px 0 0 0;
        }
        .post-list h3 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          color: #333;
        }
        .post-item {
          padding: 12px 0 12px 0;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .post-title {
          font-weight: 500;
          font-size: 1.03rem;
        }
        .post-meta {
          color: #aaa;
          font-size: .97rem;
          margin-left: 8px;
        }
        .btns {
          display: flex;
          gap: 10px;
        }
        .del-btn {
          color: #c00;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.97rem;
          border-radius: 4px;
          padding: 4px 10px;
          transition: background .2s;
        }
        .del-btn:hover {
          background: #ffeded;
        }
        .preview-btn {
          color: #2176ff;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.97rem;
          border-radius: 4px;
          padding: 4px 10px;
          transition: background .2s;
          text-decoration: underline;
        }
        .logout {
          float: right;
          color: #666;
          font-size: 0.98rem;
        }
        .logout a {
          color: #2176ff;
          text-decoration: none;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <div class="main-box">
        <div style="overflow:hidden">
          <h2 style="float:left;">后台文章管理</h2>
          <span class="logout"> <a href="/">前台</a> </span>
        </div>
        <form id="addPost">
          <div class="form-item">
            <input name="title" placeholder="标题" required maxlength="60">
          </div>
          <div class="form-item">
            <textarea name="content" placeholder="正文内容" required maxlength="5000"></textarea>
          </div>
          <button type="submit">发布文章</button>
        </form>
        <div class="msg" id="msg"></div>
        <div class="post-list">
          <h3>文章列表</h3>
          ${posts.length ? posts.map(
            p => `<div class="post-item">
                    <span>
                      <span class="post-title">${p.title}</span>
                      <span class="post-meta">${p.created_at.slice(0,16).replace('T',' ')}</span>
                    </span>
                    <span class="btns">
                      <button class="preview-btn" onclick="window.open('/post/${p.id}', '_blank')">预览</button>
                      <button class="del-btn" onclick="delPost(${p.id})">删除</button>
                    </span>
                  </div>`
          ).join('') : '<div style="color:#aaa;padding:20px 0;">暂无文章</div>'}
        </div>
      </div>
      <script>
      document.getElementById('addPost').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {title: form.title.value, content: form.content.value};
        const resp = await fetch('/api/posts', {
          method: 'POST',
          headers: {'content-type': 'application/json'},
          body: JSON.stringify(data)
        });
        const res = await resp.json();
        document.getElementById('msg').textContent = res.msg;
        if(res.code === 0) setTimeout(()=>location.reload(), 700);
      }
      async function delPost(id) {
        if (!confirm('确认删除这篇文章？')) return;
        await fetch('/api/post?id='+id, { method:'DELETE' });
        location.reload();
      }
      </script>
    </body>
    </html>
  `;

  return new Response(html, { headers: { 'content-type': 'text/html;charset=utf-8' } });
}
