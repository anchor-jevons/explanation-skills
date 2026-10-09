// Inline this component in a self-contained explanation page.
(() => {
  for (const form of document.querySelectorAll('form[data-explain-feedback]')) {
    const button = form.querySelector('[data-copy-feedback]');
    const output = form.querySelector('[data-feedback-output]');
    const status = form.querySelector('[data-feedback-status]');
    if (!button || !output || !status) continue;
    const chinese = document.documentElement.lang.toLowerCase().startsWith('zh');
    const unanswered = chinese ? '未回答' : 'Unanswered';
    form.addEventListener('submit', event => event.preventDefault());
    button.addEventListener('click', async () => {
      const answers = {};
      for (const name of ['prediction', 'reasoning', 'comment']) {
        if (!form.querySelector(`[name="${name}"]`)) continue;
        const value = new FormData(form).get(name);
        answers[name] = typeof value === 'string' && value.trim() ? value.trim() : unanswered;
      }
      const payload = {
        type: 'explanation-feedback',
        page: form.dataset.title || document.title,
        scenario: form.dataset.scenario || '',
        snapshot: form.explanationSnapshot || {},
        answers,
      };
      const text = JSON.stringify(payload, null, 2);
      // Always retain selectable text even when clipboard APIs are unavailable.
      output.value = text;
      output.hidden = false;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        status.textContent = chinese ? '已复制；请粘贴回对话。' : 'Copied; paste this back into the conversation.';
      } catch {
        output.focus();
        output.select();
        status.textContent = chinese ? '请手动复制下方文本，再粘贴回对话。' : 'Copy the selected text below and paste it back into the conversation.';
      }
    });
  }
})();
