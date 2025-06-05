// /functions/api/login.js
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'POST') {
    const data = await request.formData();
    const pwd = data.get('password');
    if (pwd === (env.ADMIN_PASS )) {
      return new Response(`<script>location="/admin";</script>`, {
        headers: {
          'set-cookie': 'admin=1; Path=/; HttpOnly',
          'content-type': 'text/html;charset=utf-8'
        }
      });
    }
    return new Response(`
      <html><body>
        <script>alert("密码错误！");history.back();</script>
      </body></html>
    `, { status: 401, headers: { 'content-type': 'text/html;charset=utf-8' } });
  }
  // 非 POST 方法禁止访问
  return new Response('Method Not Allowed', { status: 405 });
}
