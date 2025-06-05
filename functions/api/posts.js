// /functions/api/posts.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    // 获取所有文章
    const { results } = await env.DB.prepare('SELECT id, title, created_at FROM posts ORDER BY id DESC').all();
    return Response.json({ code: 0, data: results });
  }

  if (request.method === 'POST') {
    // 新增文章（简单cookie认证）
    const cookie = request.headers.get('cookie') || "";
    if (!cookie.includes('admin=1'))
      return Response.json({ code: 401, msg: '未登录' }, { status: 401 });
    const { title, content } = await request.json();
    if (!title || !content)
      return Response.json({ code: 1, msg: '缺标题或内容' }, { status: 400 });
    await env.DB.prepare('INSERT INTO posts (title, content) VALUES (?, ?)').bind(title, content).run();
    return Response.json({ code: 0, msg: '发布成功' });
  }

  return Response.json({ code: 404, msg: 'Not found' }, { status: 404 });
}
