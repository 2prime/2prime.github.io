---
layout: null
permalink: /assets/js/i18n.js
sitemap: false
---
/* Local, reversible translations. English copy remains in the page templates. */
(function () {
  'use strict';
  const ZH = Object.assign({}, {{ site.data.site_zh | jsonify }}, {{ site.data.bio_zh | jsonify }});
  const KEY = 'yiping-site-language';
  const switcher = document.querySelector('.language-switch');
  if (!switcher || !ZH) return;
  const buttons = Array.from(switcher.querySelectorAll('[data-site-lang]'));
  const records = [];
  const attributes = [];
  const originalTitle = document.title;
  const normalize = text => text.replace(/\s+/g, ' ').trim();
  const excluded = 'script, style, noscript, textarea, pre, code, svg, .paper h3, .paper-authors, .selected-work h4, .student-paper-content strong, .student-name-list, .course-content, .course-toc a:not([href="#course-content"]), [data-language-ui], [translate="no"]';

  function translate(text) {
    const key = normalize(text);
    if (Object.prototype.hasOwnProperty.call(ZH, key)) return ZH[key];
    let match = key.match(/^Selected works(?: \((\d+)\))?: (.+)$/);
    if (match) return '代表作' + (match[1] ? '（' + match[1] + ' 篇）' : '') + '：' + (ZH[match[2]] || match[2]);
    match = key.match(/^Read (.+?)( paper)?$/);
    if (match) return '阅读：' + match[1];
    match = key.match(/^© (\d{4}) Yiping Lu$/);
    if (match) return '© ' + match[1] + ' 陆一平';
    match = key.match(/^(?:Course archive · )?(Spring|Summer|Fall|Autumn|Winter) (\d{4})$/);
    if (match) return (key.startsWith('Course archive') ? '课程归档 · ' : '') + match[2] + ' 年' + ({Spring:'春季',Summer:'夏季',Fall:'秋季',Autumn:'秋季',Winter:'冬季'}[match[1]]);
    return null;
  }

  // Only replace text nodes: links, listeners, focus, and details state survive.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest(excluded)) continue;
    const en = node.nodeValue;
    let zh = translate(en);
    if (parent.closest('.hero h1')) {
      if (normalize(en) === 'Yiping') zh = '陆';
      if (normalize(en) === 'Lu') zh = '一平';
    }
    if (parent.matches('.hero-role')) {
      if (normalize(en) === 'I am a tenure-track assistant professor at') zh = '现任北京大学';
      if (normalize(en) === ', Peking University.') zh = '的长聘轨助理教授。';
    }
    if (zh !== null) {
      const padding = parent.closest('.hero h1') ? ['', ''] : [en.match(/^\s*/)[0], en.match(/\s*$/)[0]];
      records.push({node: node, en: en, zh: padding[0] + zh + padding[1]});
    }
  }

  document.querySelectorAll('[aria-label], [alt], [placeholder], [title]').forEach(function (element) {
    if (element.closest('[data-language-ui], .course-content')) return;
    ['aria-label', 'alt', 'placeholder', 'title'].forEach(function (name) {
      if (!element.hasAttribute(name)) return;
      const en = element.getAttribute(name);
      const zh = translate(en);
      if (zh !== null) attributes.push({element: element, name: name, en: en, zh: zh});
    });
  });

  function applyCopy(language) {
    records.forEach(item => { item.node.nodeValue = item[language]; });
    attributes.forEach(item => { item.element.setAttribute(item.name, item[language]); });
  }

  // Keep both language indexes available to the existing publication search.
  const papers = Array.from(document.querySelectorAll('.paper'));
  papers.forEach(paper => { paper.dataset.searchEn = paper.textContent; });
  applyCopy('zh');
  papers.forEach(paper => { paper.dataset.searchZh = paper.textContent; });

  function savedLanguage() {
    const parameter = new URLSearchParams(window.location.search).get('lang');
    if (parameter === 'zh' || parameter === 'en') return parameter;
    try {
      return window.localStorage.getItem(KEY) === 'zh' ? 'zh' : 'en';
    } catch (error) {
      return 'en';
    }
  }

  function setLanguage(language, remember) {
    language = language === 'zh' ? 'zh' : 'en';
    applyCopy(language);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const pageTitle = originalTitle.replace(/ · Yiping Lu$/, '');
    document.title = language === 'en' ? originalTitle : (pageTitle === 'Yiping Lu' ? '陆一平' : (ZH[pageTitle] || pageTitle) + ' · 陆一平');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.siteLang === language)));
    switcher.setAttribute('aria-label', language === 'zh' ? '选择语言' : 'Choose language');
    // Archival course notes and paper titles intentionally keep their original language.
    document.querySelectorAll('.paper h3, .paper-authors, .selected-work h4, .student-paper-content strong, .course-content, .course-toc a:not([href="#course-content"])').forEach(element => element.setAttribute('lang', 'en'));
    if (remember) {
      try { window.localStorage.setItem(KEY, language); } catch (error) { /* Storage may be disabled. */ }
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', language);
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      } catch (error) { /* Switching still works without history access. */ }
    }
    document.dispatchEvent(new CustomEvent('site:languagechange', {detail: {language: language}}));
  }

  buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.siteLang, true)));
  window.addEventListener('popstate', () => setLanguage(savedLanguage(), false));
  window.addEventListener('pageshow', event => { if (event.persisted) setLanguage(savedLanguage(), false); });
  const initialLanguage = savedLanguage();
  setLanguage(initialLanguage, false);
  if (new URLSearchParams(window.location.search).has('lang')) {
    try { window.localStorage.setItem(KEY, initialLanguage); } catch (error) { /* Optional persistence. */ }
  }
  switcher.hidden = false;
})();
