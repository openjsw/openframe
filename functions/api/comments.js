// /functions/api/comments.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'POST') {
    // 新增评论
    const { post_id, author, content } = await request.json();
    if (!post_id || !author || !content)
      return Response.json({ code: 1, msg: '缺参数' }, { status: 400 });
    await env.DB.prepare(
      'INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)'
    ).bind(post_id, author, content).run();
    return Response.json({ code: 0, msg: '评论成功' });
  }

  if (request.method === 'GET') {
    // 查询某文章下所有评论
    const url = new URL(request.url);
    const post_id = url.searchParams.get('post_id');
    if (!post_id)
      return Response.json({ code: 1, msg: '缺post_id' }, { status: 400 });
    const { results } = await env.DB.prepare('SELECT * FROM comments WHERE post_id=? ORDER BY id DESC').bind(post_id).all();
    return Response.json({ code: 0, data: results });
  }

  return Response.json({ code: 404, msg: 'Not found' }, { status: 404 });
}
