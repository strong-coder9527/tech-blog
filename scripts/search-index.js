'use strict';

function stripHtml(input) {
  return String(input || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function names(collection) {
  if (!collection) return [];
  const items = typeof collection.toArray === 'function' ? collection.toArray() : collection;
  if (!Array.isArray(items)) return [];
  return items.map((item) => item.name || item.slug || String(item)).filter(Boolean);
}

hexo.extend.generator.register('search-index', function(locals) {
  const posts = locals.posts
    .sort('-date')
    .filter((post) => post.published !== false)
    .map((post) => ({
      title: post.title || '未命名文章',
      path: post.path,
      date: post.date ? post.date.format('YYYY-MM-DD') : '',
      updated: post.updated ? post.updated.format('YYYY-MM-DD') : '',
      categories: names(post.categories),
      tags: names(post.tags),
      excerpt: stripHtml(post.excerpt).slice(0, 240),
      content: stripHtml(post.content).slice(0, 12000)
    }));

  return {
    path: 'search.json',
    data: JSON.stringify(posts)
  };
});
