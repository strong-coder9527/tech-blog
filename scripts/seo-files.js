'use strict';

function xmlEscape(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripUnsafeHtml(input) {
  return String(input || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

function iso(date) {
  if (!date) return new Date().toISOString();
  if (typeof date.toISOString === 'function') return date.toISOString();
  return new Date(date).toISOString();
}

function siteUrl(config, path) {
  const base = String(config.url || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');
  return cleanPath ? `${base}/${cleanPath}` : `${base}/`;
}

hexo.extend.generator.register('seo-files', function(locals) {
  const config = this.config;
  const posts = locals.posts.sort('-date').filter((post) => post.published !== false);
  const pages = locals.pages.filter((page) => page.path && !/^404\//.test(page.path));

  const sitemapUrls = [];

  sitemapUrls.push({
    loc: siteUrl(config, ''),
    lastmod: iso(new Date()),
    priority: '1.0'
  });

  posts.forEach((post) => {
    sitemapUrls.push({
      loc: post.permalink,
      lastmod: iso(post.updated || post.date),
      priority: '0.8'
    });
  });

  pages.forEach((page) => {
    if (page.path === 'index.html') return;
    sitemapUrls.push({
      loc: siteUrl(config, page.path),
      lastmod: iso(page.updated || page.date || new Date()),
      priority: '0.6'
    });
  });

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map((item) => [
      '  <url>',
      `    <loc>${xmlEscape(item.loc)}</loc>`,
      `    <lastmod>${xmlEscape(item.lastmod)}</lastmod>`,
      `    <priority>${item.priority}</priority>`,
      '  </url>'
    ].join('\n')),
    '</urlset>'
  ].join('\n');

  const feedEntries = posts.limit(20).map((post) => [
    '  <entry>',
    `    <title>${xmlEscape(post.title || '未命名文章')}</title>`,
    `    <link href="${xmlEscape(post.permalink)}"/>`,
    `    <id>${xmlEscape(post.permalink)}</id>`,
    `    <published>${xmlEscape(iso(post.date))}</published>`,
    `    <updated>${xmlEscape(iso(post.updated || post.date))}</updated>`,
    `    <content type="html">${xmlEscape(stripUnsafeHtml(post.content || post.excerpt || ''))}</content>`,
    '  </entry>'
  ].join('\n'));

  const atom = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${xmlEscape(config.title)}</title>`,
    `  <subtitle>${xmlEscape(config.subtitle || config.description || '')}</subtitle>`,
    `  <link href="${xmlEscape(siteUrl(config, 'atom.xml'))}" rel="self"/>`,
    `  <link href="${xmlEscape(siteUrl(config, ''))}"/>`,
    `  <id>${xmlEscape(siteUrl(config, ''))}</id>`,
    `  <updated>${xmlEscape(iso(posts.first() ? posts.first().updated || posts.first().date : new Date()))}</updated>`,
    `  <author><name>${xmlEscape(config.author || config.title)}</name></author>`,
    ...feedEntries,
    '</feed>'
  ].join('\n');

  const robots = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${siteUrl(config, 'sitemap.xml')}`,
    ''
  ].join('\n');

  return [
    { path: 'sitemap.xml', data: sitemap },
    { path: 'atom.xml', data: atom },
    { path: 'robots.txt', data: robots }
  ];
});
