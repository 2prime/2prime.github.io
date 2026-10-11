(function () {
  'use strict';
  var form = document.getElementById('blog-editor');
  if (!form || !window.blogEditor) return;
  var editor = window.blogEditor;
  var api = form.dataset.submissionApi;
  var service = document.getElementById('blog-service-status');
  var submit = document.getElementById('blog-submit-review');
  var status = document.getElementById('blog-publish-status');
  var receipt = document.getElementById('blog-receipt');
  var key = 'magi-submission-receipt-v1';
  var active = null;
  var configured = false;
  var checking = true;
  var busy = false;
  var loadingDraft = false;
  function copy(zh, en) { return document.documentElement.lang === 'zh-CN' ? zh : en; }
  function message(zh, en) { status.textContent = copy(zh, en); }
  function secureToken() {
    var bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
  }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(active)); } catch (error) { /* Link is also displayed explicitly. */ }
  }
  async function request(path, method, body, token) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 45000);
    try {
      var response = await fetch(api + path, { method: method, mode: 'cors', credentials: 'omit', cache: 'no-store',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
        body: method === 'GET' ? undefined : JSON.stringify(body || {}), signal: controller.signal });
      var data = await response.json();
      if (!response.ok) throw new Error(data.error || copy('请求未完成。', 'The request could not be completed.'));
      return data;
    } finally { clearTimeout(timeout); }
  }
  function showReceipt() {
    receipt.replaceChildren();
    if (!active || !active.id) { receipt.hidden = true; return; }
    receipt.hidden = false;
    var link = document.createElement('a');
    link.href = api + '/status/' + active.id + '#token=' + active.token;
    link.textContent = copy('查看投稿进度与审核反馈 ↗', 'View submission status and feedback ↗');
    link.target = '_blank'; link.rel = 'noreferrer noopener';
    var note = document.createElement('p');
    note.textContent = copy('请保存这条专属链接。它可以查看和修改你的稿件，请勿公开分享。', 'Keep this private link to check and edit your submission. Do not share it publicly.');
    var fresh = document.createElement('button'); fresh.type = 'button'; fresh.className = 'button button-outline';
    fresh.textContent = copy('开始另一篇投稿', 'Start another submission');
    fresh.addEventListener('click', function () {
      active = null; persist(); showReceipt(); showService();
      message('已开始新的投稿。编辑完成后提交，原投稿可从已保存的链接查看。', 'A new submission is ready. Your previous submission remains available through its saved link.');
    });
    receipt.append(link, note, fresh);
  }
  function showService() {
    submit.disabled = busy || checking || !configured || loadingDraft;
    submit.textContent = busy ? copy('正在提交…', 'Submitting…') : active && active.id ? copy('修改后重新送审', 'Resubmit for review') : copy('提交审核', 'Submit for review');
    service.textContent = checking ? copy('正在检查投稿服务…', 'Checking submission service…') : configured ?
      copy('审核邮件将发送至 yipinglu@bicmr.pku.edu.cn。文章获批后才会公开。', 'Review requests are sent to yipinglu@bicmr.pku.edu.cn. Articles remain private until approved.') :
      copy('自动投稿尚未启用。你可以继续写作，点击“邮件投稿”下载稿件，再将附件发送到 BICMR 邮箱审核。', 'Automatic submission is not enabled yet. Keep writing, then use Send by email to download your draft and email the attachment for review.');
  }
  try {
    var saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && /^[a-f0-9]{64}$/.test(saved.token || '') && (!saved.id || /^[a-f0-9-]{36}$/.test(saved.id))) active = saved;
  } catch (error) { /* A fresh secure token will be generated if needed. */ }
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!configured || busy || loadingDraft || !form.reportValidity()) return;
    var email = form.elements.namedItem('email');
    if (!email.value.trim()) {
      email.focus(); message('游客投稿需要填写联系邮箱；邮箱不会出现在公开文章中。', 'Guest submissions require a contact email. It will not appear in the public article.'); return;
    }
    busy = true; showService(); editor.save();
    try {
      if (!active) { active = {token:secureToken()}; persist(); }
      var data = active.id ? await request('/api/submissions/' + active.id + '/resubmit', 'POST', {article:editor.submissionValues(), revision:active.revision}, active.token) :
        await request('/api/submissions', 'POST', {article:editor.submissionValues(), statusToken:active.token, website:form.elements.namedItem('website').value});
      active.id = data.id; active.revision = data.revision; persist(); showReceipt();
      if (data.mailState === 'sent') message('稿件已保存，审核邮件已交给发信服务。请保存下方进度链接，文章目前尚未发表。', 'Your draft is saved and the review email has been accepted by the email service. Keep the status link below. The article is not published yet.');
      else message('稿件已保存，但邮件暂未确认发出。请打开进度页重发审核邮件，不要重复新建投稿。', 'Your draft is saved, but email sending was not confirmed. Open the status page to retry the email.');
    } catch (error) {
      message('提交尚未确认完成：' + (error.name === 'AbortError' ? '网络等待超时，请重试。' : error.message) + ' 浏览器草稿仍然保留。',
        'Submission was not confirmed: ' + (error.name === 'AbortError' ? 'The request timed out. Please retry.' : error.message) + ' Your browser draft is still saved.');
    } finally { busy = false; showService(); }
  });
  document.getElementById('blog-email').addEventListener('click', function () {
    if (!form.reportValidity()) return;
    editor.save(); editor.download();
    var data = editor.values();
    var body = 'Yiping 你好，\n\n我想向主页博客投稿，请审核附件中的 Markdown 稿件。\n\n标题：' + data.title + '\n署名：' + data.author + '\n摘要：' + data.description + '\n\n请在审核确认后再发表。\n\n（请在发送前手动添加刚下载的 Markdown 附件。）';
    var link = document.createElement('a');
    link.href = 'mailto:yipinglu@bicmr.pku.edu.cn?subject=' + encodeURIComponent('[博客投稿审核] ' + data.title) + '&body=' + encodeURIComponent(body);
    link.click();
    message('Markdown 已下载。请在邮件程序中添加该附件并发送；本网页没有自动发出邮件。', 'Markdown downloaded. Attach it in your email application and send the message. This page has not sent an email automatically.');
  });
  async function loadDraft() {
    var fragment = new URLSearchParams(location.hash.slice(1));
    var id = fragment.get('submission'); var token = fragment.get('token');
    if (!id || !token) return;
    history.replaceState(null, '', location.pathname + location.search);
    if (!/^[a-f0-9-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(token)) return;
    loadingDraft = true; showService();
    try {
      var result = await request('/api/submissions/' + id, 'GET', null, token);
      active = {id:id, token:token, revision:result.revision}; persist(); showReceipt();
      if (!['pending', 'needs_changes'].includes(result.state)) {
        message('这篇稿件已结束审核，请通过进度链接查看结果。', 'Review is complete for this submission. Open the status link for its result.'); return;
      }
      editor.restore(result.article);
      message('已载入第 ' + result.revision + ' 版。修改后重新送审，旧审核链接将失效。' + (result.note ? ' 审核反馈：' + result.note : ''),
        'Revision ' + result.revision + ' loaded. Resubmitting invalidates the old review link.' + (result.note ? ' Feedback: ' + result.note : ''));
    } catch (error) { message('未能载入投稿：' + error.message, 'Unable to load submission: ' + error.message); }
    finally { loadingDraft = false; showService(); }
  }
  request('/api/config', 'GET').then(function (data) { configured = data.enabled === true; }).catch(function () { configured = false; }).finally(function () { checking = false; showService(); });
  document.addEventListener('site:languagechange', function () { showService(); showReceipt(); });
  showReceipt(); showService(); loadDraft();
})();
