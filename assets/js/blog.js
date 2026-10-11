(function () {
  'use strict';
  var search = document.getElementById('blog-search');
  var cards = Array.from(document.querySelectorAll('[data-blog-card]'));
  var count = document.querySelector('[data-blog-count]');
  var empty = document.querySelector('[data-blog-empty]');
  function filterPosts() {
    var query = search.value.trim().toLocaleLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
      if (!card.hidden) visible += 1;
    });
    var chinese = document.documentElement.lang === 'zh-CN';
    count.textContent = chinese ? visible + ' 篇文章' : visible + (visible === 1 ? ' post' : ' posts');
    empty.hidden = visible !== 0;
  }
  if (search && count && empty) {
    document.querySelector('[data-blog-tools]').hidden = false;
    search.addEventListener('input', filterPosts);
    document.addEventListener('site:languagechange', filterPosts);
    filterPosts();
  }
  var content = document.getElementById('post-content');
  var sidebar = document.querySelector('[data-blog-toc]');
  var previousBody = null;
  function refreshArticle(reprocessMath) {
    var body = content.querySelector('[data-blog-language]:not([hidden])') || content;
    var headings = Array.from(body.querySelectorAll('h2, h3'));
    var prefix = body.getAttribute('data-blog-language') || 'post';
    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = prefix + '-section-' + (index + 1);
    });
    if (previousBody && previousBody !== body && window.location.hash) {
      var oldId;
      try { oldId = decodeURIComponent(window.location.hash.slice(1)); } catch (error) { oldId = ''; }
      var oldTargets = Array.from(previousBody.querySelectorAll('h2, h3, h4, [id^="ref_"]'));
      var newTargets = Array.from(body.querySelectorAll('h2, h3, h4, [id^="ref_"]'));
      var index = oldTargets.findIndex(function (element) { return element.id === oldId; });
      if (index >= 0 && newTargets[index] && newTargets[index].id) {
        try { window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search + '#' + newTargets[index].id); } catch (error) { /* Content switching does not require history access. */ }
      }
    }
    var nav = sidebar.querySelector('nav');
    nav.replaceChildren();
    if (headings.length > 1) {
      headings.forEach(function (heading) {
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        link.setAttribute('translate', 'no');
        link.lang = body.lang;
        if (heading.tagName === 'H3') link.className = 'blog-toc-subsection';
        nav.appendChild(link);
      });
    }
    sidebar.hidden = headings.length < 2;
    previousBody = body;
    if (reprocessMath && window.MathJax && window.MathJax.Hub) {
      window.MathJax.Hub.Queue(['Reprocess', window.MathJax.Hub, body]);
    }
  }
  if (content && sidebar) {
    refreshArticle(false);
    document.addEventListener('site:languagechange', function () { refreshArticle(true); });
    document.addEventListener('blog:mathready', function () { refreshArticle(true); });
  }
})();

