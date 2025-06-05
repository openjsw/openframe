// functions/admin.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 判断登录
  const cookie = request.headers.get('cookie') || "";
  const logined = cookie.includes('admin=1');

  // 登录页
  if (!logined && pathname !== '/admin/login') {
    return new Response(`
      <html>
      <head><title>后台登录</title></head>
      <body>
        <h2>后台管理登录</h2>
        <form method="POST" action="/admin/login">
          管理密码：<input type="password" name="password" required>
          <button>登录</button>
        </form>
        <div style="margin-top:16px"><a href="/">返回首页</a></div>
      </body>
      </html>
    `, { headers: { 'content-type': 'text/html;charset=utf-8' } });
  }

  // 登录处理
  if (pathname === '/admin/login' && request.method === 'POST') {
    const data = await request.formData();
    const pwd = data.get('password');
    if (pwd === (env.ADMIN_PASS )) {
      return new Response(`<script>location="/admin";</script>`, {
        headers: {
          'set-cookie': 'admin=1;Path=/;HttpOnly',
          'content-type': 'text/html'
        }
      });
    }
    return new Response('密码错误', { status: 401 });
  }

  // 文章管理页面
  // 拉取文章
  const res = await fetch(url.origin + '/api/posts', { headers: { cookie } });
  const { data: posts } = await res.json();

  let html = `
    <html>
    <head>
      <title>开放技术网后台管理</title>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <style>
        body{font-family:sans-serif;max-width:680px;margin:0 auto;}
        h2{margin:32px 0 16px;}
        .form-item{margin:8px 0;}
        .post-list{margin:24px 0;}
        .del-btn{color:#c00;margin-left:8px;cursor:pointer;}
        .logout{margin-left:20px;}
      </style>
    </head>
    <body>
      <h2>后台文章管理</h2>
      <form id="addPost">
        <div class="form-item">
          <input name="title" placeholder="标题" required maxlength="60" style="width:98%;padding:6px;">
        </div>
        <div class="form-item">
          <textarea name="content" placeholder="正文内容" required rows="6" maxlength="5000" style="width:98%;padding:6px;"></textarea>
        </div>
        <button type="submit">发布文章</button>
      </form>
      <div id="msg" style="color:#c00;"></div>
      <div class="post-list">
        <h3>文章列表</h3>
        <ul>
        ${posts.length ? posts.map(
          p => `<li>${p.title} 
            <span style="color:#bbb;">${p.created_at.slice(0,16).replace('T',' ')}</span>
            <span class="del-btn" onclick="delPost(${p.id})">删除</span>
            <a href="/post/${p.id}" target="_blank">预览</a>
          </li>`
        ).join('') : '<li>暂无文章</li>'}
        </ul>
      </div>
      <a href="/" class="logout">返回前台</a>
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
        if(res.code === 0) setTimeout(()=>location.reload(), 500);
      }
      async function delPost(id) {
        if (!confirm('确认删除？')) return;
        await fetch('/api/post?id='+id, { method:'DELETE' });
        location.reload();
      }
      </script>
    </body>
    </html>
  `;

  return new Response(html, { headers: { 'content-type': 'text/html;charset=utf-8' } });
}
