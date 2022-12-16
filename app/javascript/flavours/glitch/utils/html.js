export const unescapeHTML = (html) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.replace(/<br\s*\/?>/g, '\n').replace(/<\/p><p>/g, '\n\n').replace(/<[^>]*>/g, '');
  return wrapper.textContent;
};

/**
 * Convert \&amp;, \&lt; and \&gt; to &, < and > respectively
 */
export const convertToChar = (html) => {
  return html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};
