import inherited from 'mastodon/locales/de.json';

const messages = {
  'getting_started.open_source_notice': 'Glitchsoc is free open source software forked from {Mastodon}. You can contribute or report issues on GitHub at {github}.',
  'layout.auto': 'Auto',
  'layout.current_is': 'Dein aktuelles Layout ist:',
  'layout.desktop': 'Desktop',
  'layout.mobile': 'Mobil',
  'navigation_bar.app_settings': 'App-Einstellungen',
  'navigation_bar.frontpage': 'Zeige Startseite',
  'navigation_bar.weekly': 'Unser Discord-Server ist verfügbar unter 8gbd7YR und wir veranstalten eine große Stammtischrunde auf chat.koyu.space jeden Samstag um 18:00 Uhr in UTC-Zeit.',
  'navigation_bar.radiostation': 'Aktuelle Radiostation',
  'getting_started.onboarding': 'Führe mich rum',
  'onboarding.page_one.federation': '{domain} ist eine \'Instanz\' von Mastodon. Mastodon ist ein Netzwerk unabhängiger Server, die sich zu einem größeren sozialen Netzwerk zusammenschließen. Wir nennen diese Serverinstanzen.',
  'onboarding.page_one.welcome': 'Willkommen auf {domain}!',
  'onboarding.page_six.github': '{domain} läuft auf Glitchsoc. Glitchsoc ist ein freundlicher {fork} von Mastodon und mit jeder Mastodon-Instanz oder App kompatibel. Glitchsoc ist völlig kostenlos und Open Source. Du kannst Fehler melden, Funktionen anfordern oder zum Code auf {github} beitragen.',
  'settings.auto_collapse': 'Automatisches Zusammenklappen',
  'settings.auto_collapse_all': 'Alles',
  'settings.auto_collapse_lengthy': 'Lange Beiträge',
  'settings.auto_collapse_media': 'Beiträge mit Medien',
  'settings.auto_collapse_notifications': 'Benachrichtigungen',
  'settings.auto_collapse_reblogs': 'Geteile Beiträge',
  'settings.auto_collapse_replies': 'Antworten',
  'settings.show_action_bar': 'Aktionsschaltflächen im eingeklapptem Beitrag anzeigen',
  'settings.close': 'Schließen',
  'settings.collapsed_statuses': 'Eingeklappte Beiträge',
  'settings.enable_collapsed': 'Aktiviere eingeklappte Beiträge',
  'settings.general': 'Allgemein',
  'settings.image_backgrounds': 'Bildhintergründe',
  'settings.image_backgrounds_media': 'Vorschau anzeigen für eingeklappte Beiträge',
  'settings.image_backgrounds_users': 'Gebe eingeklappten Beiträgen einen Bildhintergrund',
  'settings.media': 'Medien',
  'settings.media_letterbox': 'Letterbox-Medien',
  'settings.media_fullwidth': 'Medienvorschauen in voller Breite',
  'settings.preferences': 'Benutzereinstellungen',
  'settings.wide_view': 'Weite Ansicht (nur Desktop-Modus)',
  'settings.navbar_under': 'Navigationsleiste unten (nur für Mobilgeräte)',
  'status.collapse': 'Zusammenklappen',
  'status.uncollapse': 'Ausklappen',

  'media_gallery.sensitive': 'Heikel',

  'favourite_modal.combo': 'Du kannst {combo} drücken um dies das nächste Mal zu überspringen',

  'home.column_settings.show_direct': 'Zeige Direktnachrichten',

  'notification.markForDeletion': 'Zum Löschen markieren',
  'notifications.clear': 'Lösche alle meine Benachrichtigungen',
  'notifications.marked_clear_confirmation': 'Möchtest du wirklich alle ausgewählten Benachrichtigungen dauerhaft löschen?',
  'notifications.marked_clear': 'Benachrichtigungen löschen',

  'notification_purge.btn_all': 'Alle\nauswählen',
  'notification_purge.btn_none': 'Keine\nauswählen',
  'notification_purge.btn_invert': 'Auswahl\numkehren',
  'notification_purge.btn_apply': 'Ausgewählte\nlöschen',
  
  'notification.reaction': '{name} hat auf deinen Beitrag reagiert',
  'notifications.column_settings.reaction': 'Reaktionen:',

  'tooltips.reactions': 'Reaktionen',

  'compose.attach.upload': 'Datei hochladen',
  'compose.attach.doodle': 'Etwas malen',
  'compose.attach.gif': 'GIF anhängen',
  'compose.attach': 'Hochladen...',

  'advanced_options.local-only.short': 'Nur lokal',
  'advanced_options.local-only.long': 'Poste das nicht auf anderen Instanzen',
  'advanced_options.local-only.tooltip': 'Dieser Post ist nur lokal',
  'advanced_options.icon_title': 'Erweitere Optionen',
  'advanced_options.threaded_mode.short': 'Thread-Modus',
  'advanced_options.threaded_mode.long': 'Öffnet automatisch eine Antwort zum vorherigen Beitrag',
  'advanced_options.threaded_mode.tooltip': 'Thread-Modus aktiviert',

  'tenor.search': 'Suche nach GIFs',
  'tenor.error': 'Ups! Etwas ist schiefgelaufen. Bitte versuche es erneut.',
  'tenor.loading': 'Lädt...',
  'tenor.nomatches': 'Keine Treffer gefunden.'
};

export default Object.assign({}, inherited, messages);
