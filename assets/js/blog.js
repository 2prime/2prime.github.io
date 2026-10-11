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
  if (content && sidebar) {
    var headings = Array.from(content.querySelectorAll('h2, h3'));
    if (headings.length > 1) {
      headings.forEach(function (heading, index) {
        if (!heading.id) heading.id = 'section-' + (index + 1);
        var link = document.createElement('a');
        link.href = '#' + heading.id;
        link.textContent = heading.textContent;
        link.setAttribute('translate', 'no');
        link.lang = content.lang;
        if (heading.tagName === 'H3') link.className = 'blog-toc-subsection';
        sidebar.querySelector('nav').appendChild(link);
      });
      sidebar.hidden = false;
    }
  }
})();
