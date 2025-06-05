// /functions/api/post.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return Response.json({ code: 1, msg: '缺id' }, { status: 400 });

  if (request.method === 'GET') {
    // 获取单篇文章和评论
    const post = await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(id).first();
    if (!post) return Response.json({ code: 1, msg: '文章不存在' }, { status: 404 });
    const { results: comments } = await env.DB.prepare('SELECT * FROM comments WHERE post_id=? ORDER BY id DESC').bind(id).all();
    return Response.json({ code: 0, data: { post, comments } });
  }

  if (request.method === 'DELETE') {
    // 删除文章（简单cookie认证）
    const cookie = request.headers.get('cookie') || "";
    if (!cookie.includes('admin=1'))
      return Response.json({ code: 401, msg: '未登录' }, { status: 401 });
    await env.DB.prepare('DELETE FROM posts WHERE id=?').bind(id).run();
    await env.DB.prepare('DELETE FROM comments WHERE post_id=?').bind(id).run();
    return Response.json({ code: 0, msg: '删除成功' });
  }

  return Response.json({ code: 404, msg: 'Not found' }, { status: 404 });
}
