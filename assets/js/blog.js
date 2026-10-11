(function () {
  'use strict';
  var search = document.getElementById('blog-search');
  var cards = Array.from(document.querySelectorAll('[data-blog-card]'));
  var count = document.querySelector('[data-blog-count]');
  var empty = document.querySelector('[data-blog-empty]');
  var categoryControls = Array.from(document.querySelectorAll('[data-blog-category]'));
  var categoryCounts = Array.from(document.querySelectorAll('[data-blog-category-count]'));
  var categoryBar = document.querySelector('[data-blog-categories]');
  var categoryIds = categoryControls.map(function (control) { return control.getAttribute('data-blog-category'); });
  var selectedCategory = 'all';
  function restoreArchiveState() {
    var parameters = new URLSearchParams(window.location.search);
    var requested = parameters.get('category');
    selectedCategory = categoryIds.includes(requested) ? requested : 'all';
    search.value = parameters.get('q') || '';
  }
  function updateArchiveURL(push) {
    var url = new URL(window.location.href);
    if (selectedCategory === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', selectedCategory);
    if (search.value.trim()) url.searchParams.set('q', search.value.trim());
    else url.searchParams.delete('q');
    var next = url.pathname + url.search + url.hash;
    if (next === window.location.pathname + window.location.search + window.location.hash) return;
    try { window.history[push ? 'pushState' : 'replaceState'](null, '', next); } catch (error) { /* Filtering also works without history access. */ }
  }
  function filterPosts() {
    var query = search.value.trim().toLocaleLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var category = card.getAttribute('data-blog-category-id');
      var searchable = (card.getAttribute('data-blog-search') || '') + ' ' + card.textContent;
      card.hidden = !(selectedCategory === 'all' || category === selectedCategory) || !searchable.toLocaleLowerCase().includes(query);
      if (!card.hidden) visible += 1;
    });
    categoryControls.forEach(function (control) {
      var selected = control.getAttribute('data-blog-category') === selectedCategory;
      if (control.tagName.toLowerCase() === 'button') control.setAttribute('aria-pressed', String(selected));
      else if (selected) control.setAttribute('aria-current', 'true');
      else control.removeAttribute('aria-current');
    });
    categoryCounts.forEach(function (label) {
      var category = label.getAttribute('data-blog-category-count');
      label.textContent = cards.filter(function (card) { return category === 'all' || card.getAttribute('data-blog-category-id') === category; }).length;
    });
    var chinese = document.documentElement.lang === 'zh-CN';
    count.textContent = chinese ? visible + ' 篇文章' : visible + (visible === 1 ? ' post' : ' posts');
    empty.hidden = visible !== 0;
    empty.textContent = query ? (chinese ? '没有找到相关文章，试试其他关键词。' : 'No matching posts. Try another search.') : (chinese ? '这个分类还没有文章。' : 'No posts in this category yet.');
    document.querySelectorAll('.magi-category-node').forEach(function (node) {
      var category = node.getAttribute('data-blog-category');
      var button = categoryControls.find(function (control) { return control.tagName.toLowerCase() === 'button' && control.getAttribute('data-blog-category') === category; });
      if (button) node.setAttribute('aria-label', button.querySelector('span').textContent);
    });
    var diagram = document.querySelector('.magi-diagram');
    if (diagram) diagram.setAttribute('aria-label', chinese ? '按分类浏览博客' : 'Browse blog categories');
  }
  if (search && count && empty) {
    document.querySelector('[data-blog-tools]').hidden = false;
    if (categoryBar) categoryBar.hidden = false;
    restoreArchiveState();
    categoryControls.forEach(function (control) {
      control.addEventListener('click', function (event) {
        // Keep the native URL for opening a category in another tab.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (typeof event.button === 'number' && event.button !== 0)) return;
        event.preventDefault();
        selectedCategory = control.getAttribute('data-blog-category');
        updateArchiveURL(true);
        filterPosts();
        if (control.classList.contains('magi-category-node')) {
          var heading = document.getElementById('magi-archive-title');
          var archive = document.getElementById('magi-archive');
          var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (archive) archive.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
          if (heading) heading.focus({ preventScroll: true });
        }
      });
    });
    search.addEventListener('input', function () { filterPosts(); updateArchiveURL(false); });
    window.addEventListener('popstate', function () { restoreArchiveState(); filterPosts(); });
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

