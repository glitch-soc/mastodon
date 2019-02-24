//  This file will be loaded on embed pages, regardless of theme.

window.addEventListener('message', e => {
  const data = e.data || {};

  if (!window.parent || data.type !== 'setHeight') {
    return;
  }

  function setEmbedHeight () {
    window.parent.postMessage({
      type: 'setHeight',
      id: data.id,
      height: document.getElementsByTagName('html')[0].scrollHeight,
    }, '*');
  };

  if (['interactive', 'complete'].includes(document.readyState)) {
    setEmbedHeight();
  } else {
    document.addEventListener('DOMContentLoaded', setEmbedHeight);
  }

  document.querySelectorAll('.status__content__spoiler-link').forEach(function (el) {
    const contentEl = el.parentNode.parentNode.querySelector('.e-content');
    el.addEventListener('click', function () {
      if (contentEl.style.display === 'block') {
        contentEl.style.display = 'none';
        target.parentNode.style.marginBottom = 0;
      } else {
        contentEl.style.display = 'block';
        target.parentNode.style.marginBottom = null;
      }
      setEmbedHeight();
      return false;
    });
  });
});
