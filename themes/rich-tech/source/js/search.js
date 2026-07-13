(function(){
  function currentRoot() {
    var script = document.currentScript || Array.prototype.slice.call(document.scripts).find(function(item){
      return /\/js\/search\.js(?:\?|$)/.test(item.src);
    });
    if (!script || !script.src) return '/';
    return script.src.replace(/\/js\/search\.js(?:\?.*)?$/, '/');
  }

  function escapeHtml(input) {
    return String(input || '').replace(/[&<>"']/g, function(ch){
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[ch];
    });
  }

  function normalize(input) {
    return String(input || '').toLowerCase().trim();
  }

  function snippet(content, terms) {
    var text = String(content || '');
    var lower = text.toLowerCase();
    var pos = -1;
    terms.some(function(term){
      pos = lower.indexOf(term);
      return pos >= 0;
    });
    if (pos < 0) return escapeHtml(text.slice(0, 160));
    var start = Math.max(0, pos - 55);
    var end = Math.min(text.length, pos + 130);
    return escapeHtml((start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : ''));
  }

  function scorePost(post, terms) {
    var title = normalize(post.title);
    var categories = normalize((post.categories || []).join(' '));
    var tags = normalize((post.tags || []).join(' '));
    var content = normalize(post.content);
    var score = 0;

    terms.forEach(function(term){
      if (!term) return;
      if (title.indexOf(term) >= 0) score += 8;
      if (categories.indexOf(term) >= 0) score += 4;
      if (tags.indexOf(term) >= 0) score += 4;
      if (content.indexOf(term) >= 0) score += 1;
    });

    return score;
  }

  function renderResult(post, root, terms) {
    var meta = [];
    if (post.date) meta.push(post.date);
    if (post.categories && post.categories.length) meta.push(post.categories.join(' / '));
    if (post.tags && post.tags.length) meta.push(post.tags.map(function(tag){ return '#' + tag; }).join(' '));

    return [
      '<article class="site-search-result">',
      '  <h3><a href="' + root + post.path + '">' + escapeHtml(post.title) + '</a></h3>',
      '  <div class="site-search-result-meta">' + escapeHtml(meta.join(' · ')) + '</div>',
      '  <p>' + snippet(post.content || post.excerpt, terms) + '</p>',
      '</article>'
    ].join('');
  }

  function initSearch() {
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('site-search-results');
    var status = document.getElementById('site-search-status');
    var clear = document.getElementById('site-search-clear');
    if (!input || !results || !status) return;

    var root = currentRoot();
    var index = [];
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function render(query) {
      var terms = normalize(query).split(/\s+/).filter(Boolean);
      if (!terms.length) {
        status.textContent = '请输入关键词。';
        results.innerHTML = '';
        return;
      }

      var matched = index
        .map(function(post){
          return { post: post, score: scorePost(post, terms) };
        })
        .filter(function(item){ return item.score > 0; })
        .sort(function(a, b){ return b.score - a.score; })
        .slice(0, 30);

      status.textContent = matched.length ? '找到 ' + matched.length + ' 条结果。' : '没有找到匹配结果。';
      results.innerHTML = matched.map(function(item){
        return renderResult(item.post, root, terms);
      }).join('');
    }

    fetch(root + 'search.json', { cache: 'no-cache' })
      .then(function(response){
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function(data){
        index = Array.isArray(data) ? data : [];
        if (initialQuery) {
          input.value = initialQuery;
          render(initialQuery);
        } else {
          status.textContent = '索引已加载，共 ' + index.length + ' 篇文章。';
        }
      })
      .catch(function(error){
        status.textContent = '搜索索引加载失败：' + error.message;
      });

    input.addEventListener('input', function(){
      render(input.value);
    });

    if (clear) {
      clear.addEventListener('click', function(){
        input.value = '';
        input.focus();
        render('');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
