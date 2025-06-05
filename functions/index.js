// /functions/index.js
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') === 'en'
    ? 'en'
    : (request.headers.get('accept-language')?.startsWith('en') ? 'en' : 'zh');

  // 多语言文本
  const i18n = {
    zh: {
      title: 'OpenJSW 开放技术',
      desc: '开放、前沿的技术社区，专注于开源、云原生、边缘计算等领域。',
      nav: ['项目导航', '关于', '文档'],
      projects: [
        { name: 'OpenGraphPic 图床', url: 'https://opengraphpic.openjsw.org', desc: '开源轻量图床，支持匿名上传和直链。' },
        { name: 'JSW 技术网', url: 'https://jsw.org.cn', desc: '前沿技术资讯、开发经验与工具推荐。' },
        // 可扩展
      ],
      footer: '由 OpenJSW 社区开放技术驱动',
    },
    en: {
      title: 'OpenJSW Open Tech',
      desc: 'An open, cutting-edge tech community focusing on open source, cloud-native, and edge computing.',
      nav: ['Projects', 'About', 'Docs'],
      projects: [
        { name: 'OpenGraphPic', url: 'https://opengraphpic.openjsw.org', desc: 'Open-source, lightweight image host.' },
        { name: 'JSW Tech Web', url: 'https://jsw.org.cn', desc: 'Tech news, tools, and developer experience.' },
      ],
      footer: 'Powered by OpenJSW Community Open Tech',
    }
  }[lang];

  // 页面模板
  return new Response(`<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${i18n.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${i18n.desc}">
  <link rel="icon" href="/favicon.ico">
  <style>
    body{font-family:system-ui,sans-serif;margin:0;padding:0;background:#f7f7f9;}
    .nav{display:flex;gap:20px;justify-content:center;margin:30px 0;}
    .nav a{color:#444;text-decoration:none;font-weight:bold;}
    .logo{width:70px;height:70px;margin:30px auto 10px;display:block;}
    h1{margin:0;text-align:center;font-size:2.2em;}
    .desc{text-align:center;color:#555;margin:8px 0 24px 0;}
    .projects{display:flex;flex-wrap:wrap;justify-content:center;gap:24px;padding:0 12px;}
    .project{background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;padding:24px;width:270px;transition:transform .2s;}
    .project:hover{transform:translateY(-5px) scale(1.02);}
    .project a{font-size:1.15em;color:#296ef7;text-decoration:none;}
    .footer{text-align:center;color:#888;margin:44px 0 16px 0;font-size:.97em;}
    @media(max-width:600px){.projects{flex-direction:column;align-items:center;}.project{width:95%;}}
    .lang-switch{position:absolute;right:14px;top:18px;font-size:.98em;opacity:.66;}
    .lang-switch a{text-decoration:none;color:#888;}
  </style>
</head>
<body>
  <a href="/" tabindex="-1"><img src="/openjsw-logo.png" alt="logo" class="logo"></a>
  <div class="lang-switch">
    <a href="?lang=${lang === 'en' ? 'zh' : 'en'}">${lang === 'en' ? '简体中文' : 'ENGLISH'}</a>
  </div>
  <h1>${i18n.title}</h1>
  <div class="desc">${i18n.desc}</div>
  <nav class="nav">
    ${i18n.nav.map(n => `<a href="#">${n}</a>`).join('')}
  </nav>
  <div class="projects">
    ${i18n.projects.map(p => `
      <div class="project">
        <a href="${p.url}" target="_blank">${p.name}</a>
        <div style="margin:6px 0 0 0;color:#555;">${p.desc}</div>
      </div>
    `).join('')}
  </div>
  <div class="footer">${i18n.footer}</div>
</body>
</html>`, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
