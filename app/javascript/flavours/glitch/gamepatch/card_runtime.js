// ESM-first card runtime. Loaded directly by the embed page as
// <script type="module"> AND consumed by Vite in the Mastodon fork
// (both flavors import this file via mastodon/gamepatch/card_runtime
// and flavours/glitch/gamepatch/card_runtime — synced copies). The
// named export `ensureGamepatchCard` exists as a tree-shake-resistant
// symbol so Vite can't drop the module under strict sideEffects.
//
// Module-scoped (no IIFE wrap needed — ESM modules don't leak to
// globals). The customElements.define + window.GamepatchCard pin at
// the bottom run at module-load and are idempotent across multiple
// evaluations (HMR, double-import).

function setCssVariables(el, tokens, prefix) {
    Object.entries(tokens || {}).forEach(([key, value]) => {
      const path = prefix ? `${prefix}-${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        setCssVariables(el, value, path);
      } else {
        el.style.setProperty(`--gp-${path}`, String(value));
      }
    });
  }

  class GamepatchCardElement extends HTMLElement {
    connectedCallback() {
      this.uid = this.dataset.uid;
      this.api = this.dataset.api;
      this.botId = this.dataset.botId;
      this.botName = this.dataset.botName;
      this.cardInstanceId = this.dataset.cardInstanceId || null;

      // Parse pre-provided data from React wrapper (dataset attributes)
      this.data = this._parseDatasetJSON('data') || {};
      this.context = this._parseDatasetJSON('context') || {};
      this.state = this._parseDatasetJSON('state') || {};
      this._definition = this._parseDatasetJSON('definition');
      this._hostConfig = this._parseDatasetJSON('hostConfig');

      this.render();
    }

    _parseDatasetJSON(key) {
      const raw = this.dataset[key];
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (_err) { return null; }
    }

    async render() {
      // If definition provided via dataset (Mastodon React wrapper), render directly
      if (this._definition) {
        this.applyTheme(this._hostConfig || {});
        this.thread = document.createElement('div');
        this.thread.className = 'gp-thread';
        this.appendChild(this.thread);
        this.appendCard(this.expandTemplate(this._definition));
        if (this.state.story_responded) {
          const cardEl = this.thread.querySelector('.gp-card');
          if (cardEl) this.freezeCard(cardEl, { id: this.state.story_chosen_action });
        }
        return;
      }

      // Otherwise, fetch from API (standalone embed)
      if (!this.api) return;
      try {
        const data = await this.loadCardPayload();
        this.applyCardPayload(data, { resetThread: true });
      } catch (err) {
        console.error('Card render failed:', err);
        this.renderError('Unable to load card.');
      }
    }

    applyTheme(hostConfig) {
      setCssVariables(this, hostConfig, null);
    }

    appendCard(definition) {
      const container = document.createElement('div');
      container.className = 'gp-card';

      if (definition.title) {
        const title = document.createElement('div');
        title.className = 'gp-card-title';
        title.textContent = this.applyTemplate(definition.title);
        container.appendChild(title);
      }

      const body = Array.isArray(definition.body) ? definition.body : [];
      body.forEach((element) => {
        const el = this.renderElement(element);
        if (el) container.appendChild(el);
      });

      const actions = Array.isArray(definition.actions) ? definition.actions : [];
      if (actions.length > 0) {
        const actionsEl = document.createElement('div');
        actionsEl.className = 'gp-card-actions';
        actions.forEach((action) => {
          const btn = document.createElement('button');
          btn.className = 'gp-card-btn';
          btn.textContent = this.applyTemplate(action.title || action.id || 'Action');
          btn.dataset.actionId = action.id || '';
          btn.dataset.actionType = action.type || '';
          if (action.url) btn.dataset.actionUrl = this.applyTemplate(action.url);
          if (action.data) btn.dataset.actionData = JSON.stringify(action.data);
          btn.addEventListener('click', () => this.handleAction(action, container));
          actionsEl.appendChild(btn);
        });
        container.appendChild(actionsEl);
      }

      if (this.thread) {
        this.thread.appendChild(container);
      } else {
        this.appendChild(container);
      }

      this.wireCardGameChoiceSets(container);
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderFromDefinition(definition) {
      this.innerHTML = '';
      this.thread = document.createElement('div');
      this.thread.className = 'gp-thread';
      this.appendChild(this.thread);
      this.appendCard(definition);
    }

    renderError(message) {
      if (!this.thread) {
        this.innerHTML = `<div class="gp-card-error">${message}</div>`;
        return;
      }
      this.clearTransientMessages();
      const box = document.createElement('div');
      box.className = 'gp-card-error';
      box.textContent = message;
      this.thread.appendChild(box);
    }

    renderNotice(message) {
      if (!this.thread) return;
      this.clearTransientMessages();
      const box = document.createElement('div');
      box.className = 'gp-card-notice';
      box.textContent = message;
      this.thread.appendChild(box);
    }

    clearTransientMessages() {
      if (!this.thread) return;
      this.thread.querySelectorAll('.gp-card-error, .gp-card-notice').forEach((el) => el.remove());
    }

    async loadCardPayload() {
      const url = new URL(this.api, window.location.origin);
      if (this.botId) url.searchParams.set('bot_id', this.botId);
      if (this.botName) url.searchParams.set('bot_name', this.botName);
      if (this.cardInstanceId) url.searchParams.set('card_instance_id', this.cardInstanceId);

      const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.error ? data.error : 'load_failed');
      return data;
    }

    applyCardPayload(data, { resetThread = false } = {}) {
      this.data = data.data || {};
      this.context = data.context || {};
      this.state = data.state || {};
      if (data.card_instance_id) this.cardInstanceId = data.card_instance_id;
      this.applyTheme(data.host_config || {});

      if (!this.thread) {
        this.thread = document.createElement('div');
        this.thread.className = 'gp-thread';
        this.appendChild(this.thread);
      }
      if (resetThread) this.thread.innerHTML = '';
      this.clearTransientMessages();

      this.appendCard(this.expandTemplate(data.definition || {}));

      // Auto-freeze if this card was already responded to
      if (this.state.story_responded) {
        const cardEl = this.thread.querySelector('.gp-card:last-child');
        if (cardEl) this.freezeCard(cardEl, { id: this.state.story_chosen_action });
      }
    }

    async refreshCurrentCard(noticeMessage) {
      try {
        const data = await this.loadCardPayload();
        this.applyCardPayload(data, { resetThread: true });
        if (noticeMessage) this.renderNotice(noticeMessage);
        return true;
      } catch (err) {
        console.warn('Card refresh failed:', err);
        return false;
      }
    }

    renderElement(element) {
      if (!element || typeof element !== 'object') return null;
      const type = element.type || '';

      if (!this.isElementVisible(element)) return null;

      const elementId = element.id || '';

      if (type === 'Text') {
        const el = document.createElement('div');
        el.className = 'gp-card-text';
        if (element.className) el.className += ' ' + element.className;
        const text = this.applyTemplate(element.text || '');
        if (element.format === 'markdown') {
          el.innerHTML = this.renderMiniMarkdown(text);
        } else if (element.format === 'html' || /<[a-z][^>]*>/i.test(text)) {
          el.innerHTML = text.replace(/<(?!\/?(strong|em|b|i|br|span|u)\b)[^>]*>/gi, '');
        } else {
          el.textContent = text;
        }
        if (elementId) el.dataset.elementId = elementId;
        return el;
      }

      if (type === 'Image') {
        const el = document.createElement('img');
        el.className = 'gp-card-image';
        if (element.className) el.className += ' ' + element.className;
        el.src = this.applyTemplate(element.url || '');
        el.alt = this.applyTemplate(element.alt || '');
        if (elementId) el.dataset.elementId = elementId;
        return el;
      }

      if (type === 'Video') {
        const el = document.createElement('video');
        el.className = 'gp-card-video';
        if (element.className) el.className += ' ' + element.className;
        el.src = this.applyTemplate(element.url || '');
        el.controls = true;
        el.preload = 'metadata';
        el.playsInline = true;
        if (element.alt) el.title = this.applyTemplate(element.alt);
        if (elementId) el.dataset.elementId = elementId;
        return el;
      }

      if (type === 'Carousel') {
        const el = document.createElement('div');
        el.className = 'gp-carousel';
        if (elementId) el.dataset.elementId = elementId;

        const track = document.createElement('div');
        track.className = 'gp-carousel-track';

        const items = Array.isArray(element.items) ? element.items : [];
        items.forEach((item, index) => {
          const slide = document.createElement('div');
          slide.className = 'gp-carousel-slide';
          slide.dataset.index = index;

          if (item.body) {
            const bodyEl = this.renderElement(item.body);
            if (bodyEl) slide.appendChild(bodyEl);
          }

          if (item.action) {
            const btn = document.createElement('button');
            btn.className = 'gp-card-btn gp-carousel-btn';
            btn.textContent = item.action.title || 'Select';
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              // Freeze carousel: highlight chosen slide, dim others, scroll to chosen
              if (el._stopAuto) el._stopAuto();
              track.querySelectorAll('.gp-carousel-slide').forEach((s, i) => {
                s.classList.add(i === index ? 'gp-carousel-slide--chosen' : 'gp-carousel-slide--dimmed');
              });
              track.querySelectorAll('.gp-carousel-btn').forEach((b) => { b.disabled = true; });
              slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              el.dataset.chosenIndex = index;
              this.handleAction(item.action, el.closest('.gp-card'));
            });
            slide.appendChild(btn);
          }

          track.appendChild(slide);
        });

        el.appendChild(track);

        if (items.length > 1) {
          const dots = document.createElement('div');
          dots.className = 'gp-carousel-dots';
          items.forEach((_item, index) => {
            const dot = document.createElement('button');
            dot.className = 'gp-carousel-dot' + (index === 0 ? ' gp-carousel-dot--active' : '');
            dot.addEventListener('click', () => {
              track.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
            dots.appendChild(dot);
          });
          el.appendChild(dots);

          const updateDots = () => {
            const slideWidth = track.children[0] ? track.children[0].offsetWidth : 1;
            const activeIndex = Math.round(track.scrollLeft / slideWidth);
            dots.querySelectorAll('.gp-carousel-dot').forEach((d, i) => {
              d.classList.toggle('gp-carousel-dot--active', i === activeIndex);
            });
            return activeIndex;
          };

          let scrollTimeout = null;
          track.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateDots, 50);
          });

          // Auto-slide every 5 seconds, pause on hover or interaction
          const autoInterval = (element.autoInterval || 5) * 1000;
          let autoTimer = null;
          const startAuto = () => {
            if (autoTimer) return;
            autoTimer = setInterval(() => {
              const current = updateDots();
              const next = (current + 1) % items.length;
              track.children[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }, autoInterval);
          };
          const stopAuto = () => {
            clearInterval(autoTimer);
            autoTimer = null;
          };
          el.addEventListener('mouseenter', stopAuto);
          el.addEventListener('mouseleave', startAuto);
          el.addEventListener('touchstart', stopAuto, { passive: true });
          el._stopAuto = stopAuto;
          startAuto();
        }

        return el;
      }

      if (type === 'TabSet') {
        const el = document.createElement('div');
        el.className = 'gp-tabset';
        if (elementId) el.dataset.elementId = elementId;

        const headers = document.createElement('div');
        headers.className = 'gp-tabset-headers';

        const panels = document.createElement('div');
        panels.className = 'gp-tabset-panels';

        const tabs = Array.isArray(element.tabs) ? element.tabs : [];
        tabs.forEach((tab, index) => {
          // Tab header button
          const btn = document.createElement('button');
          btn.className = 'gp-tabset-tab' + (index === 0 ? ' gp-tabset-tab--active' : '');
          if (tab.color) btn.style.setProperty('--tab-color', tab.color);
          btn.textContent = tab.title || '';
          if (tab.badge) {
            const badge = document.createElement('span');
            badge.className = 'gp-tabset-badge';
            badge.textContent = tab.badge;
            btn.appendChild(badge);
          }
          btn.addEventListener('click', () => {
            headers.querySelectorAll('.gp-tabset-tab').forEach(t => t.classList.remove('gp-tabset-tab--active'));
            panels.querySelectorAll('.gp-tabset-panel').forEach(p => p.classList.remove('gp-tabset-panel--active'));
            btn.classList.add('gp-tabset-tab--active');
            panels.children[index].classList.add('gp-tabset-panel--active');
          });
          headers.appendChild(btn);

          // Tab panel
          const panel = document.createElement('div');
          panel.className = 'gp-tabset-panel' + (index === 0 ? ' gp-tabset-panel--active' : '');
          const body = Array.isArray(tab.body) ? tab.body : [];
          body.forEach(item => {
            const child = this.renderElement(item);
            if (child) panel.appendChild(child);
          });
          panels.appendChild(panel);
        });

        el.appendChild(headers);
        el.appendChild(panels);
        return el;
      }

      if (type === 'KwartetCard') {
        const el = document.createElement('div');
        const color = element.color || '#666';
        const owned = element.owned !== false;
        const category = element.category || '';

        el.className = 'gp-kwartet-card' + (!owned ? ' gp-kwartet-card--missing' : '');
        el.style.setProperty('--kc-color', color);

        // Icons row — 4 circles with FLICC/DROG icons
        const siblings = Array.isArray(element.siblings) ? element.siblings : [];
        const siblingIcons = Array.isArray(element.siblingIcons) ? element.siblingIcons : [];
        const cardIndex = typeof element.cardIndex === 'number' ? element.cardIndex : 0;
        const ownedIndices = Array.isArray(element.ownedIndices) ? element.ownedIndices : [];

        if (siblings.length > 0 && category !== 'Tegengif' && category !== 'Zwart') {
          const icons = document.createElement('div');
          icons.className = 'gp-kwartet-icons';

          for (let i = 0; i < siblings.length; i++) {
            const isOwned = ownedIndices.includes(i);
            const isCurrent = i === cardIndex;
            const dot = document.createElement('div');
            dot.className = 'gp-kwartet-dot'
              + (isCurrent ? ' gp-kwartet-dot--current' : '')
              + (isOwned ? ' gp-kwartet-dot--owned' : ' gp-kwartet-dot--empty');

            if (siblingIcons[i]) {
              const img = document.createElement('img');
              img.src = '/gamepatch/assets/kwartet-icons/' + siblingIcons[i];
              img.alt = '';
              img.className = 'gp-kwartet-dot-icon';
              img.setAttribute('aria-hidden', 'true');
              dot.appendChild(img);
            }
            icons.appendChild(dot);
          }
          el.appendChild(icons);
        }

        // Name banner
        const banner = document.createElement('div');
        banner.className = 'gp-kwartet-banner';
        banner.textContent = element.name || '';
        el.appendChild(banner);

        // Description (only shown for owned cards)
        if (element.description && owned) {
          const desc = document.createElement('div');
          desc.className = 'gp-kwartet-desc';
          desc.textContent = element.description;
          el.appendChild(desc);
        }

        return el;
      }

      if (type === 'Container') {
        const el = document.createElement('div');
        el.className = 'gp-card-container';
        if (element.className) el.className += ' ' + element.className;
        if (elementId) el.dataset.elementId = elementId;
        const items = Array.isArray(element.items) ? element.items : [];
        items.forEach((child) => {
          const childEl = this.renderElement(child);
          if (childEl) el.appendChild(childEl);
        });
        return el;
      }

      if (type === 'ColumnSet') {
        const el = document.createElement('div');
        el.className = 'gp-card-columns';
        if (element.className) el.className += ' ' + element.className;
        if (elementId) el.dataset.elementId = elementId;
        const columns = Array.isArray(element.columns) ? element.columns : [];
        columns.forEach((column) => {
          const columnEl = this.renderElement(column);
          if (columnEl) el.appendChild(columnEl);
        });
        return el;
      }

      if (type === 'Column') {
        const el = document.createElement('div');
        el.className = 'gp-card-column';
        if (element.className) el.className += ' ' + element.className;
        if (elementId) el.dataset.elementId = elementId;
        const width = columnWidth(element.width);
        if (width) el.style.flex = width;
        const items = Array.isArray(element.items) ? element.items : [];
        items.forEach((child) => {
          const childEl = this.renderElement(child);
          if (childEl) el.appendChild(childEl);
        });
        return el;
      }

      if (type === 'Input.Text') {
        const input = document.createElement('input');
        input.className = 'gp-card-input';
        input.type = 'text';
        input.placeholder = this.applyTemplate(element.placeholder || '');
        input.dataset.inputId = element.id || '';
        if (element.id) { input.id = element.id; input.name = element.id; }
        if (elementId) input.dataset.elementId = elementId;
        return input;
      }

      if (type === 'Input.Date') {
        const input = document.createElement('input');
        input.className = 'gp-card-input';
        input.type = 'date';
        input.dataset.inputId = element.id || '';
        if (element.id) { input.id = element.id; input.name = element.id; }
        if (elementId) input.dataset.elementId = elementId;
        return input;
      }

      if (type === 'Input.Number') {
        const input = document.createElement('input');
        input.className = 'gp-card-input';
        input.type = 'number';
        if (element.min !== undefined) input.min = element.min;
        if (element.max !== undefined) input.max = element.max;
        input.dataset.inputId = element.id || '';
        if (element.id) { input.id = element.id; input.name = element.id; }
        if (elementId) input.dataset.elementId = elementId;
        return input;
      }

      if (type === 'Input.Slider') {
        const wrap = document.createElement('div');
        wrap.className = 'gp-card-slider-wrap';
        if (elementId) wrap.dataset.elementId = elementId;

        const input = document.createElement('input');
        input.className = 'gp-card-input gp-card-slider';
        input.type = 'range';
        if (element.min !== undefined) input.min = element.min;
        if (element.max !== undefined) input.max = element.max;
        if (element.step !== undefined) input.step = element.step;
        if (element.value !== undefined) input.value = element.value;
        input.dataset.inputId = element.id || '';
        if (element.id) { input.id = element.id; input.name = element.id; }

        const value = document.createElement('div');
        value.className = 'gp-card-slider-value';
        value.textContent = input.value || '';
        input.addEventListener('input', () => {
          value.textContent = input.value;
        });

        wrap.appendChild(input);
        wrap.appendChild(value);
        return wrap;
      }

      if (type === 'Input.ChoiceSet') {
        const wrap = document.createElement('div');
        wrap.className = 'gp-input-group gp-input-group--choice';
        if (element.className) wrap.className += ' ' + element.className;
        if (elementId) wrap.dataset.elementId = elementId;

        const selectId = element.id || `choice_${Math.random().toString(36).slice(2)}`;

        if (element.label) {
          const label = document.createElement('label');
          label.className = 'gp-card-label';
          label.setAttribute('for', selectId);
          label.textContent = this.applyTemplate(element.label);
          wrap.appendChild(label);
        }

        if (element.helpText) {
          const hint = document.createElement('div');
          hint.className = 'gp-card-input-hint';
          hint.textContent = this.applyTemplate(element.helpText);
          wrap.appendChild(hint);
        }

        const select = document.createElement('select');
        select.className = 'gp-card-input gp-card-select';
        select.dataset.inputId = element.id || '';
        select.id = selectId;
        if (element.id) select.name = element.id;

        const placeholderText = this.applyTemplate(element.placeholder || '');
        if (placeholderText) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = placeholderText;
          option.disabled = true;
          option.selected = true;
          option.dataset.placeholder = '1';
          select.appendChild(option);
        }

        const options = Array.isArray(element.choices) ? element.choices : [];
        options.forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt.value || opt.title || '';
          option.textContent = this.applyTemplate(opt.title || opt.value || '');
          if (opt.group || opt.category) option.dataset.choiceGroup = String(opt.group || opt.category);
          select.appendChild(option);
        });

        wrap.appendChild(select);
        return wrap;
      }

      if (type === 'Input.Likert') {
        const wrap = document.createElement('div');
        wrap.className = 'gp-likert-wrap';
        if (elementId) wrap.dataset.elementId = elementId;

        const min = element.min !== undefined ? Number(element.min) : 1;
        const max = element.max !== undefined ? Number(element.max) : 7;

        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.dataset.inputId = element.id || '';
        if (element.id) { hidden.id = element.id; hidden.name = element.id; }
        hidden.value = '';
        wrap.appendChild(hidden);

        if (element.minLabel) {
          const lbl = document.createElement('span');
          lbl.className = 'gp-likert-label gp-likert-label--min';
          lbl.textContent = this.applyTemplate(element.minLabel);
          wrap.appendChild(lbl);
        }

        const scale = document.createElement('div');
        scale.className = 'gp-likert-scale';
        for (let i = min; i <= max; i++) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gp-likert-point';
          btn.dataset.value = String(i);
          btn.textContent = String(i);
          btn.addEventListener('click', () => {
            scale.querySelectorAll('.gp-likert-point').forEach((b) => b.classList.remove('gp-likert-selected'));
            btn.classList.add('gp-likert-selected');
            hidden.value = String(i);
          });
          scale.appendChild(btn);
        }
        wrap.appendChild(scale);

        if (element.maxLabel) {
          const lbl = document.createElement('span');
          lbl.className = 'gp-likert-label gp-likert-label--max';
          lbl.textContent = this.applyTemplate(element.maxLabel);
          wrap.appendChild(lbl);
        }

        return wrap;
      }

      if (type === 'Input.RadioGroup') {
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'gp-radio-group';
        if (elementId) fieldset.dataset.elementId = elementId;

        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.dataset.inputId = element.id || '';
        if (element.id) { hidden.id = element.id; hidden.name = element.id; }
        hidden.value = '';
        fieldset.appendChild(hidden);

        if (element.label) {
          const legend = document.createElement('legend');
          legend.className = 'gp-radio-group-label';
          legend.textContent = this.applyTemplate(element.label);
          fieldset.appendChild(legend);
        }

        const groupName = `rg_${element.id || Math.random().toString(36).slice(2)}`;
        const choices = Array.isArray(element.choices) ? element.choices : [];
        choices.forEach((choice) => {
          const label = document.createElement('label');
          label.className = 'gp-radio-option';

          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = groupName;
          radio.value = choice.value || choice.title || '';
          radio.addEventListener('change', () => {
            hidden.value = radio.value;
          });

          const text = document.createElement('span');
          text.textContent = this.applyTemplate(choice.title || choice.value || '');

          label.appendChild(radio);
          label.appendChild(text);
          fieldset.appendChild(label);
        });

        return fieldset;
      }

      return null;
    }

    async ensureInstance() {
      if (this.cardInstanceId) return this.cardInstanceId;
      if (!this.api) return null;

      const url = new URL(`${this.api}/instances`, window.location.origin);
      if (this.botId) url.searchParams.set('bot_id', this.botId);
      if (this.botName) url.searchParams.set('bot_name', this.botName);

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await res.json();
      this.cardInstanceId = data.card_instance_id;
      return this.cardInstanceId;
    }

    collectInputs() {
      const inputs = {};
      this.querySelectorAll('[data-input-id]').forEach((input) => {
        const id = input.dataset.inputId;
        if (!id) return;
        inputs[id] = input.value;
      });
      return inputs;
    }

    freezeCard(cardEl, chosenAction) {
      const actionsEl = cardEl.querySelector('.gp-card-actions');
      if (actionsEl) {
        actionsEl.querySelectorAll('.gp-card-btn').forEach((btn) => {
          btn.disabled = true;
          if (btn.dataset.actionId === chosenAction.id) {
            btn.classList.add('gp-card-btn--chosen');
          } else {
            btn.classList.add('gp-card-btn--dimmed');
          }
        });
      }

      // Freeze carousels: highlight chosen slide, scroll to it
      cardEl.querySelectorAll('.gp-carousel').forEach((carousel) => {
        const slides = carousel.querySelectorAll('.gp-carousel-slide');
        let chosenIdx = carousel.dataset.chosenIndex;
        // If no index stored, find by matching action id on buttons
        if (chosenIdx == null) {
          slides.forEach((s, i) => {
            const btn = s.querySelector('.gp-carousel-btn');
            if (btn && btn.textContent === (chosenAction.title || chosenAction.id)) {
              chosenIdx = i;
            }
          });
        }
        if (chosenIdx != null) {
          slides.forEach((s, i) => {
            s.classList.add(Number(i) === Number(chosenIdx) ? 'gp-carousel-slide--chosen' : 'gp-carousel-slide--dimmed');
          });
          slides[chosenIdx]?.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
        carousel.querySelectorAll('.gp-carousel-btn').forEach((b) => { b.disabled = true; });
      });

      cardEl.querySelectorAll('[data-input-id]').forEach((input) => {
        input.disabled = true;
      });

      cardEl.classList.add('gp-card--done');
    }

    // Reverse freezeCard when an action fails before the server confirms it.
    // Without this a transient failure (network blip, 5xx, rate-limit) leaves
    // the card in a dead state with all buttons disabled — the renderError
    // message would be visible but the user couldn't retry the click.
    unfreezeCard(cardEl) {
      if (!cardEl) return;
      const actionsEl = cardEl.querySelector('.gp-card-actions');
      if (actionsEl) {
        actionsEl.querySelectorAll('.gp-card-btn').forEach((btn) => {
          btn.disabled = false;
          btn.classList.remove('gp-card-btn--chosen', 'gp-card-btn--dimmed');
        });
      }
      cardEl.querySelectorAll('.gp-carousel').forEach((carousel) => {
        carousel.querySelectorAll('.gp-carousel-slide').forEach((s) => {
          s.classList.remove('gp-carousel-slide--chosen', 'gp-carousel-slide--dimmed');
        });
        carousel.querySelectorAll('.gp-carousel-btn').forEach((b) => { b.disabled = false; });
      });
      cardEl.querySelectorAll('[data-input-id]').forEach((input) => {
        input.disabled = false;
      });
      cardEl.classList.remove('gp-card--done');
    }

    appendChoice(label) {
      if (!this.thread) return;
      const bubble = document.createElement('div');
      bubble.className = 'gp-choice';
      bubble.textContent = label;
      this.thread.appendChild(bubble);
    }

    async showThinkingPause() {
      if (!this.thread) return;

      const bubble = document.createElement('div');
      bubble.className = 'gp-thinking';

      const label = document.createElement('span');
      label.className = 'gp-thinking-label';
      const enChoices = ['Bot is thinking', 'Checking move', 'Choosing tactic'];
      const nlChoices = ['Bot denkt na', 'Zet wordt berekend', 'Tactiek wordt gekozen'];
      label.textContent = this.localizedCardChoice(enChoices, nlChoices);
      bubble.appendChild(label);

      const dots = document.createElement('span');
      dots.className = 'gp-thinking-dots';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dots.appendChild(dot);
      }
      bubble.appendChild(dots);

      this.thread.appendChild(bubble);
      bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      const delayMs = 850 + Math.floor(Math.random() * 850);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      bubble.remove();
    }

    wireCardGameChoiceSets(cardEl) {
      if (!cardEl) return;

      const categorySelect = cardEl.querySelector('select[data-input-id="category"]');
      const cardSelect = cardEl.querySelector('select[data-input-id="card"]');
      if (!categorySelect || !cardSelect || cardSelect.dataset.gpBound === '1') return;

      cardSelect.dataset.gpBound = '1';

      const allCardChoices = Array.from(cardSelect.options)
        .filter((opt) => opt.dataset.placeholder !== '1')
        .map((opt) => ({
          value: opt.value,
          title: opt.textContent,
          group: opt.dataset.choiceGroup || '',
        }));

      const categoryHint = cardEl.querySelector('#category')?.parentElement?.querySelector('.gp-card-input-hint');
      const cardHint = cardEl.querySelector('#card')?.parentElement?.querySelector('.gp-card-input-hint');

      const setHintState = (hasCategory) => {
        if (!cardHint) return;
        cardHint.textContent = hasCategory
          ? this.localizedCardText(
            'Choose one missing card from this quartet.',
            'Kies nu een ontbrekende kaart uit dit kwartet.'
          )
          : this.localizedCardText(
            'First choose a quartet above.',
            'Kies eerst hierboven een kwartet.'
          );
      };

      const resetCardChoices = (categoryValue) => {
        Array.from(cardSelect.options)
          .filter((opt) => opt.dataset.placeholder !== '1')
          .forEach((opt) => opt.remove());

        const placeholder = cardSelect.querySelector('option[data-placeholder="1"]');
        if (placeholder) {
          placeholder.selected = true;
          placeholder.disabled = false;
        }

        if (!categoryValue) {
          cardSelect.disabled = true;
          setHintState(false);
          return;
        }

        const filtered = allCardChoices.filter((choice) => !choice.group || choice.group === categoryValue);
        filtered.forEach((choice) => {
          const option = document.createElement('option');
          option.value = choice.value;
          option.textContent = choice.title;
          option.dataset.choiceGroup = choice.group;
          cardSelect.appendChild(option);
        });

        cardSelect.disabled = filtered.length === 0;
        setHintState(true);
      };

      categorySelect.addEventListener('change', () => {
        if (categoryHint) {
          categoryHint.textContent = this.localizedCardText(
            'Good. Now pick one missing card.',
            'Mooi. Kies nu een ontbrekende kaart.'
          );
        }
        resetCardChoices(categorySelect.value);
      });

      resetCardChoices(categorySelect.value);
    }

    localizedCardText(en, nl) {
      const lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
      return lang.startsWith('nl') ? nl : en;
    }

    localizedCardChoice(enChoices, nlChoices) {
      const lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
      const list = lang.startsWith('nl') ? nlChoices : enChoices;
      return list[Math.floor(Math.random() * list.length)] || list[0] || '';
    }

    async handleAction(action, cardEl) {
      const didOpenUrl = action.type === 'Action.OpenUrl' && action.url;
      const didToggleVisibility = action.type === 'Action.ToggleVisibility' && action.targetElements;

      if (action.type === 'Action.OpenUrl' && action.url) {
        window.open(this.applyTemplate(action.url), '_blank', 'noopener');
      }

      if (action.type === 'Action.ToggleVisibility' && action.targetElements) {
        this.applyToggleVisibility(action.targetElements);
      }

      if (cardEl) this.freezeCard(cardEl, action);

      const instanceId = await this.ensureInstance();
      if (!instanceId) {
        if (cardEl) this.unfreezeCard(cardEl);
        this.renderError("Couldn't start a session for this card.");
        return;
      }

      const payload = {
        card_id: this.uid,
        action: {
          id: action.id,
          type: action.type,
          data: action.data
        },
        inputs: this.collectInputs(),
        context: {}
      };

      const res = await fetch(`${this.api}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_payload: payload, card_instance_id: instanceId })
      });

      let result = null;
      try {
        result = await res.json();
      } catch (err) {
        result = null;
      }

      if (!res.ok || !result || result.error) {
        const staleError = result && (result.error === 'story_error' || result.error === 'card_instance_not_active');
        if (staleError) {
          const recovered = await this.refreshCurrentCard('Card updated. Continue from the latest step.');
          if (recovered) return;
        }

        const detail = result && result.error_detail && (
          result.error_detail.detail ||
          result.error_detail.message ||
          JSON.stringify(result.error_detail)
        );
        const base = result && result.error ? result.error : 'Response failed.';
        const message = detail ? `${base}: ${detail}` : base;
        if (cardEl) this.unfreezeCard(cardEl);
        this.renderError(message);
        return;
      }

      if (result.open_url && !didOpenUrl) {
        window.open(this.applyTemplate(result.open_url), '_blank', 'noopener');
      }

      if (result.toggle_visibility && !didToggleVisibility) {
        this.applyToggleVisibility(result.toggle_visibility);
      }

      // Update card_instance_id if the server provides a new one (e.g. card game turns)
      if (result.card_instance_id) {
        this.cardInstanceId = result.card_instance_id;
      }

      // Story/submit: card is already frozen with chosen action highlighted
      if (result.submit) return;

      if (result.next_card) {
        const choiceLabel = action.title || action.id || 'Action';
        this.appendChoice(choiceLabel);
        const needsThinkingPause = action.id === 'play_move';
        if (needsThinkingPause) {
          await this.showThinkingPause();
        }
        const next = result.next_card;
        if (next.uid) {
          this.uid = next.uid;
          this.dataset.uid = next.uid;
        }
        if (next.host_config) {
          this.applyTheme(next.host_config);
        }
        this.data = next.data || this.data;
        this.context = next.context || this.context;
        this.state = next.state || this.state;
        this.appendCard(this.expandTemplate(next.definition || next));
        return;
      }

      if (result.show_card) {
        const choiceLabel = action.title || action.id || 'Action';
        this.appendChoice(choiceLabel);
        const needsThinkingPause = action.id === 'play_move';
        if (needsThinkingPause) {
          await this.showThinkingPause();
        }
        const show = result.show_card;
        if (show.host_config) {
          this.applyTheme(show.host_config);
        }
        this.data = show.data || this.data;
        this.context = show.context || this.context;
        this.state = show.state || this.state;
        this.appendCard(this.expandTemplate(show.definition || show));
        return;
      }

      if (result.execute) {
        this.dispatchEvent(new CustomEvent('gamepatch:card:execute', { detail: result, bubbles: true }));
      }
    }

    renderMiniMarkdown(text) {
      // Minimal markdown: **bold**, ~~strike~~, newlines → <br>
      return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/~~(.+?)~~/g, '<s>$1</s>')
        .replace(/\n/g, '<br>');
    }

    applyTemplate(value) {
      if (typeof value !== 'string') return value;
      // Handle ${...} (Adaptive Card Templating)
      let result = value.replace(/\$\{([^}]+)\}/g, (_match, expr) => {
        const resolved = this.resolveValue(expr.trim());
        return resolved === undefined || resolved === null ? '' : String(resolved);
      });
      // Handle {{...}} (legacy)
      result = result.replace(/{{\s*([^}]+)\s*}}/g, (_match, expr) => {
        const resolved = this.resolveValue(expr.trim());
        return resolved === undefined || resolved === null ? '' : String(resolved);
      });
      return result;
    }

    resolveValue(expr) {
      if (expr.startsWith('input.')) {
        return this.getInputValue(expr.slice(6));
      }
      if (expr.startsWith('data.')) {
        return resolvePath(this.data, expr.slice(5));
      }
      if (expr.startsWith('context.')) {
        return resolvePath(this.context, expr.slice(8));
      }
      if (expr.startsWith('state.')) {
        return resolvePath(this.state, expr.slice(6));
      }
      // Try data first (flat access), then context, state, input
      const fromData = resolvePath(this.data, expr);
      if (fromData !== undefined) return fromData;
      const fromContext = resolvePath(this.context, expr);
      if (fromContext !== undefined) return fromContext;
      const fromState = resolvePath(this.state, expr);
      if (fromState !== undefined) return fromState;
      const inputValue = this.getInputValue(expr);
      return inputValue !== undefined ? inputValue : undefined;
    }

    // --- Adaptive Card Templating ---

    expandTemplate(definition) {
      // Use official SDK if loaded externally
      if (typeof ACData !== 'undefined' && ACData.Template) {
        try {
          const template = new ACData.Template(definition);
          return template.expand({
            $root: { ...this.data, data: this.data, context: this.context, state: this.state }
          });
        } catch (e) {
          console.warn('ACData template expansion failed:', e);
        }
      }
      // Lightweight fallback
      return this._expandLite(definition);
    }

    _expandLite(obj) {
      if (typeof obj === 'string') return this._resolveExpr(obj);
      if (Array.isArray(obj)) return this._expandArray(obj);
      if (obj && typeof obj === 'object') return this._expandObject(obj);
      return obj;
    }

    _expandArray(arr) {
      const result = [];
      for (const item of arr) {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          // $when: skip element if falsy
          if (item['$when'] !== undefined) {
            const expr = item['$when'];
            const val = (typeof expr === 'string' && expr.startsWith('${'))
              ? this.resolveValue(expr.slice(2, -1).trim())
              : expr;
            if (!val || val === 'false' || val === '0') continue;
          }
          // $data: array repetition or context scoping
          if (item['$data'] !== undefined) {
            const src = this._resolveDataSource(item['$data']);
            if (Array.isArray(src)) {
              for (let i = 0; i < src.length; i++) {
                const clone = JSON.parse(JSON.stringify(item));
                delete clone['$data'];
                delete clone['$when'];
                result.push(this._expandWithScope(clone, src[i], i));
              }
              continue;
            } else if (src && typeof src === 'object') {
              const clone = JSON.parse(JSON.stringify(item));
              delete clone['$data'];
              delete clone['$when'];
              result.push(this._expandWithScope(clone, src, 0));
              continue;
            }
          }
          const expanded = this._expandObject(item);
          result.push(expanded);
        } else {
          result.push(this._expandLite(item));
        }
      }
      return result;
    }

    _expandObject(obj) {
      // Handle $data scoping: merge data into scope before expanding children
      if (obj['$data'] !== undefined) {
        const src = this._resolveDataSource(obj['$data']);
        if (src && typeof src === 'object' && !Array.isArray(src)) {
          const clone = JSON.parse(JSON.stringify(obj));
          delete clone['$data'];
          delete clone['$when'];
          return this._expandWithScope(clone, src, 0);
        }
      }
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === '$data' || key === '$when') continue;
        result[key] = this._expandLite(value);
      }
      return result;
    }

    _resolveExpr(str) {
      if (typeof str !== 'string') return str;
      // If the entire string is a single ${...} expression, return native type
      const singleMatch = str.match(/^\$\{([^}]+)\}$/);
      if (singleMatch) {
        const val = this.resolveValue(singleMatch[1].trim());
        return val !== undefined ? val : '';
      }
      // Mixed: resolve inline
      return str.replace(/\$\{([^}]+)\}/g, (_m, expr) => {
        const val = this.resolveValue(expr.trim());
        return val === undefined || val === null ? '' : String(val);
      });
    }

    _resolveDataSource(source) {
      if (Array.isArray(source)) return source;
      if (source && typeof source === 'object') return source;
      if (typeof source === 'string') {
        const match = source.match(/^\$\{([^}]+)\}$/);
        if (match) {
          const val = this.resolveValue(match[1].trim());
          return val;
        }
      }
      return null;
    }

    _expandWithScope(obj, scopeData, index) {
      const savedData = this.data;
      if (typeof scopeData === 'object' && scopeData !== null) {
        this.data = { ...this.data, ...scopeData, $index: index, $data: scopeData };
      } else {
        this.data = { ...this.data, $index: index, $data: scopeData };
      }
      const result = this._expandLite(obj);
      this.data = savedData;
      return result;
    }

    isElementVisible(element) {
      if (element.isVisible === false) return false;
      if (!element.when) return true;
      return this.evaluateCondition(element.when);
    }

    evaluateCondition(condition) {
      if (typeof condition === 'string') {
        return Boolean(this.resolveValue(condition));
      }
      if (!condition || typeof condition !== 'object') return false;

      let value = null;
      if (condition.input) value = this.resolveValue(`input.${condition.input}`);
      if (condition.context) value = this.resolveValue(`context.${condition.context}`);
      if (condition.state) value = this.resolveValue(`state.${condition.state}`);
      if (condition.key) value = this.resolveValue(condition.key);

      const valueString = value === undefined || value === null ? '' : String(value);
      const present = !(value === undefined || value === null || (typeof value === 'string' && value.length === 0));

      if (condition.equals !== undefined) return valueString === String(condition.equals);
      if (condition.in) return Array.isArray(condition.in) && condition.in.map(String).includes(valueString);
      if (condition.present !== undefined) return present === Boolean(condition.present);
      return present;
    }

    applyToggleVisibility(targets) {
      const elements = normalizeTargets(targets);
      elements.forEach((target) => {
        const selector = `[data-element-id="${escapeSelector(target.id)}"]`;
        const el = this.querySelector(selector);
        if (!el) return;
        if (target.isVisible === undefined) {
          el.style.display = el.style.display === 'none' ? '' : 'none';
        } else {
          el.style.display = target.isVisible ? '' : 'none';
        }
      });
    }

    getInputValue(inputId) {
      if (!inputId) return undefined;
      const selector = `[data-input-id="${escapeSelector(inputId)}"]`;
      const input = this.querySelector(selector);
      if (!input) return undefined;
      if (input.type === 'checkbox') return input.checked;
      if (input.type === 'radio') {
        const checked = this.querySelector(`${selector}:checked`);
        return checked ? checked.value : undefined;
      }
      return input.value;
    }
  }

  function resolvePath(obj, path) {
    if (!obj || typeof path !== 'string') return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  function columnWidth(width) {
    if (typeof width === 'number') {
      return `${width} 1 0%`;
    }
    if (typeof width === 'string') {
      if (width === 'auto') return '0 0 auto';
      if (width === 'stretch') return '1 1 0%';
    }
    return '1 1 0%';
  }

  function normalizeTargets(targets) {
    if (!targets) return [];
    if (Array.isArray(targets)) {
      return targets.map((target) => {
        if (typeof target === 'string') return { id: target };
        if (target && typeof target === 'object') return { id: target.elementId || target.id, isVisible: target.isVisible };
        return null;
      }).filter(Boolean);
    }
    if (typeof targets === 'string') return [{ id: targets }];
    if (targets && typeof targets === 'object') return [{ id: targets.elementId || targets.id, isVisible: targets.isVisible }];
    return [];
  }

  function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(String(value));
    }
    return String(value).replace(/["\\]/g, '\\$&');
  }

if (typeof window !== 'undefined' && !window.GamepatchCard) {
  if (!customElements.get('gamepatch-card')) {
    customElements.define('gamepatch-card', GamepatchCardElement);
  }
  window.GamepatchCard = GamepatchCardElement;
}

// Tree-shake-resistant export. The customElements.define above runs at
// module evaluation; this function exists purely so importers can hold
// a callable reference Vite won't prune under sideEffects:false.
export function ensureGamepatchCard() {}
