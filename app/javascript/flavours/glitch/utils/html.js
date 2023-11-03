import highlightjs from 'highlight.js';

// NB: This function can still return unsafe HTML
export const unescapeHTML = (html) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.replace(/<br\s*\/?>/g, '\n').replace(/<\/p><p>/g, '\n\n').replace(/<[^>]*>/g, '');
  return wrapper.textContent;
};

/**
 * Highlights code in code tags.\
 * Uses highlight.js to convert content inside code tags to span elements with class attributes
 * @param {string} content - String containing html code tags
 * @returns {string} content with highlighted code inside code tags, or content if not highlighted
 */
export const highlightCode = (content) => {
  // highlightJS complains when unescaped html is given
  highlightjs.configure({ ignoreUnescapedHTML: true });

  // Create a new temporary element to work on
  const wrapper = document.createElement('div');
  wrapper.innerHTML = content;

  // Get code elements and run highlightJS on each.
  wrapper.querySelectorAll('code')
    .forEach((code) => {
      // Get language from data attribute containing code language of code element
      let lang = highlightjs.getLanguage(code.dataset.codelang);

      // Check if lang is a valid language
      if (lang !== undefined) {
        // Set codelang as class attribute, since highlightElement cannot be given a language
        // highlightJS will read this attribute and use it to highlight in the proper language
        code.setAttribute('class', code.dataset.codelang);

        // Set title attribute to language name, i.e. "js" will become "Javascript"
        code.setAttribute('title', lang.name);

        // Replace <br> as highlightJS removes them, messing up formatting
        let brTags = Array.from(code.getElementsByTagName('br'));
        for (let br of brTags) {
          br.replaceWith('\n');
        }

        // Highlight the code element
        highlightjs.highlightElement(code);

        // highlightJS adds own class attribute, remove it again to not mess up styling
        code.removeAttribute('class');
      } else {
        // Remove data attribute as it's not a valid language.
        delete code.dataset.codelang;
      }
    });

  // return content with highlighted code
  return wrapper.innerHTML;
};
