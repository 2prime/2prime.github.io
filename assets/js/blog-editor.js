(function () {
  'use strict';
  var form = document.getElementById('blog-editor');
  if (!form) return;
  var preview = document.getElementById('blog-preview');
  var status = document.getElementById('blog-save-status');
  var publishStatus = document.getElementById('blog-publish-status');
  var fields = ['title', 'description', 'date', 'slug', 'tags', 'lang', 'body'];
  var storageKey = 'yiping-blog-draft-v1';
  var saveState = 'ready';
  var renderVersion = 0;
  var timer;
  var markdown;
  function chinese() { return document.documentElement.lang === 'zh-CN'; }
  function copy(zh, en) { return chinese() ? zh : en; }
  function field(name) { return form.elements.namedItem(name); }
  function values() {
    var data = {};
    fields.forEach(function (name) { data[name] = field(name).value; });
    return data;
  }
  function showStatus() {
    var messages = {
      ready: ['草稿保存在当前浏览器', 'Draft stored in this browser'],
      saved: ['草稿已保存在当前浏览器', 'Saved in this browser'],
      error: ['无法保存浏览器草稿，请下载 Markdown 备份', 'Browser storage is unavailable. Download Markdown to keep your draft.']
    };
    status.textContent = copy(messages[saveState][0], messages[saveState][1]);
  }
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(values()));
      saveState = 'saved';
    } catch (error) { saveState = 'error'; }
    showStatus();
  }
  var today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  function datePart(type) { return today.find(function (part) { return part.type === type; }).value; }
  field('date').value = datePart('year') + '-' + datePart('month') + '-' + datePart('day');
  field('slug').value = 'note-' + field('date').value.replace(/-/g, '') + '-' + Date.now().toString(36).slice(-5);
  try {
    var saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      fields.forEach(function (name) { if (typeof saved[name] === 'string') field(name).value = saved[name]; });
      if (saved.slug) field('slug').dataset.edited = 'true';
      saveState = 'saved';
    }
  } catch (error) { saveState = 'error'; }

  if (window.markdownit) {
    markdown = window.markdownit({ html: false, linkify: true, breaks: false, typographer: false });
    // Match kramdown's $$ delimiters before Markdown can interpret TeX underscores.
    markdown.inline.ruler.before('escape', 'blog_math', function (state, silent) {
      var start = state.pos;
      if (state.src.slice(start, start + 2) !== '$$') return false;
      var end = state.src.indexOf('$$', start + 2);
      if (end < 0 || state.src.slice(start + 2, end).includes('\n')) return false;
      if (!silent) {
        var token = state.push('blog_math_inline', '', 0);
        token.content = state.src.slice(start + 2, end).trim();
      }
      state.pos = end + 2;
      return true;
    });
    markdown.block.ruler.before('fence', 'blog_math_block', function (state, startLine, endLine, silent) {
      if (state.sCount[startLine] - state.blkIndent >= 4) return false;
      var start = state.bMarks[startLine] + state.tShift[startLine];
      var first = state.src.slice(start, state.eMarks[startLine]).trim();
      if (!first.startsWith('$$')) return false;
      var lines = [];
      var end = startLine;
      if (first.length > 3 && first.endsWith('$$')) {
        lines.push(first.slice(2, -2));
      } else {
        if (first !== '$$') return false;
        for (end = startLine + 1; end < endLine; end += 1) {
          var line = state.src.slice(state.bMarks[end] + state.tShift[end], state.eMarks[end]);
          if (line.trim() === '$$') break;
          lines.push(line);
        }
        if (end === endLine) return false;
      }
      if (silent) return true;
      var token = state.push('blog_math_block', '', 0);
      token.block = true;
      token.content = lines.join('\n').trim();
      token.map = [startLine, end + 1];
      state.line = end + 1;
      return true;
    });
    function mathHTML(tokens, index) {
      var token = tokens[index];
      var display = token.type === 'blog_math_block';
      var tag = display ? 'div' : 'span';
      var escaped = markdown.utils.escapeHtml(token.content);
      return '<' + tag + ' data-blog-math="' + (display ? 'display' : 'inline') + '" data-tex="' + escaped + '">' + escaped + '</' + tag + '>' + (display ? '\n' : '');
    }
    markdown.renderer.rules.blog_math_inline = mathHTML;
    markdown.renderer.rules.blog_math_block = mathHTML;
  }

  // Accept the familiar $inline$ syntax and export kramdown-safe $$inline$$.
  // Code spans, code fences, escaped dollars, and existing $$ blocks stay intact.
  function canonicalMath(source) {
    var result = '';
    var position = 0;
    var fence = null;
    while (position < source.length) {
      var atLineStart = position === 0 || source[position - 1] === '\n';
      if (atLineStart) {
        var endOfLine = source.indexOf('\n', position);
        if (endOfLine < 0) endOfLine = source.length;
        var line = source.slice(position, endOfLine);
        var marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (fence || marker || /^(?: {4}|\t)/.test(line)) {
          if (fence) {
            if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
          } else if (marker) fence = marker[1];
          result += source.slice(position, Math.min(endOfLine + 1, source.length));
          position = endOfLine + 1;
          continue;
        }
      }
      var character = source[position];
      if (character === '\\') {
        result += source.slice(position, position + 2);
        position += 2;
        continue;
      }
      if (character === '`') {
        var backticks = source.slice(position).match(/^`+/)[0];
        var closingCode = source.indexOf(backticks, position + backticks.length);
        if (closingCode >= 0) {
          result += source.slice(position, closingCode + backticks.length);
          position = closingCode + backticks.length;
          continue;
        }
      }
      if (source.slice(position, position + 2) === '$$') {
        var closingBlock = source.indexOf('$$', position + 2);
        if (closingBlock >= 0) {
          result += source.slice(position, closingBlock + 2);
          position = closingBlock + 2;
          continue;
        }
        result += '$$';
        position += 2;
        continue;
      } else if (character === '$' && source[position + 1] && !/\s/.test(source[position + 1])) {
        for (var closing = position + 1; closing < source.length && source[closing] !== '\n'; closing += 1) {
          if (source[closing] === '\\') { closing += 1; continue; }
          if (source[closing] === '$' && !/\s/.test(source[closing - 1]) && !/[\d$]/.test(source[closing + 1] || '')) {
            result += '$$' + source.slice(position + 1, closing) + '$$';
            position = closing + 1;
            break;
          }
        }
        if (position === closing + 1) continue;
      }
      result += character;
      position += 1;
    }
    return result;
  }

  function render() {
    var version = ++renderVersion;
    preview.lang = field('lang').value;
    if (!markdown) {
      preview.textContent = copy('预览组件未加载，仍可下载并发布 Markdown。', 'Preview could not load. You can still download and publish Markdown.');
      return;
    }
    var html = markdown.render(canonicalMath(field('body').value));
    function replacePreview() {
      if (version !== renderVersion) return;
      if (window.MathJax && MathJax.Hub) {
        MathJax.Hub.getAllJax(preview).forEach(function (jax) { jax.Remove(); });
      }
      preview.innerHTML = html;
      if (window.MathJax && MathJax.Hub) {
        preview.querySelectorAll('[data-blog-math]').forEach(function (node) {
          var script = document.createElement('script');
          script.type = node.dataset.blogMath === 'display' ? 'math/tex; mode=display' : 'math/tex';
          script.textContent = node.dataset.tex;
          node.replaceWith(script);
        });
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, preview]);
      }
    }
    if (window.MathJax && MathJax.Hub) MathJax.Hub.Queue(replacePreview);
    else replacePreview();
  }
  function documentText() {
    var data = values();
    var tags = data.tags.split(/[,，]/).map(function (tag) { return tag.trim(); }).filter(Boolean);
    return [
      '---', 'title: ' + JSON.stringify(data.title.trim()),
      'date: ' + data.date,
      'description: ' + JSON.stringify(data.description.trim()),
      'tags: ' + JSON.stringify(tags),
      'lang: ' + JSON.stringify(data.lang),
      'permalink: /blog/' + data.slug + '/', '---', '', canonicalMath(data.body.trim()), ''
    ].join('\n');
  }
  function filename() { return field('date').value + '-' + field('slug').value + '.md'; }
  function download() {
    var blob = new Blob([documentText()], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename();
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  field('title').addEventListener('input', function () {
    if (field('slug').dataset.edited) return;
    var slug = field('title').value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (slug) field('slug').value = slug;
  });
  field('slug').addEventListener('input', function () { field('slug').dataset.edited = 'true'; });
  form.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { save(); render(); }, 300);
  });
  document.getElementById('blog-download').addEventListener('click', function () {
    if (!form.reportValidity()) return;
    save();
    download();
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    save();
    var root = 'https://github.com/' + form.dataset.repository;
    var url = root + '/new/master/_posts?filename=' + encodeURIComponent(filename()) + '&value=' + encodeURIComponent(documentText());
    if (url.length > 7000) {
      download();
      url = root + '/upload/master/_posts';
      publishStatus.textContent = copy('已下载 Markdown。请在打开的 GitHub 页面上传该文件并确认提交。', 'Markdown downloaded. Upload that file on GitHub and confirm the commit.');
    } else {
      publishStatus.textContent = copy('请在 GitHub 检查文章并点击 Commit changes。部署完成后文章会自动出现在博客中。', 'Review the post on GitHub and choose Commit changes. The post appears after the site finishes deploying.');
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });
  document.addEventListener('site:languagechange', showStatus);
  document.addEventListener('blog:mathready', render);
  form.hidden = false;
  showStatus();
  render();
})();
