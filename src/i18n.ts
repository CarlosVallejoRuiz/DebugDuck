import { useStore } from './store'

export type LangCode = 'es' | 'en' | 'fr' | 'de' | 'pt'

export const LANGUAGE_NAMES: Record<LangCode, string> = {
  es: 'español',
  en: 'English',
  fr: 'français',
  de: 'Deutsch',
  pt: 'português',
}

export const LANGUAGES: { code: LangCode; flag: string; label: string }[] = [
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'pt', flag: '🇵🇹', label: 'PT' },
]

export interface T {
  // SpeechBubble
  listening: string
  eureka: string
  pomo: string
  // SettingsPanel
  settingsTitle: string
  personality: string
  programmer: string
  general: string
  memoryTitle: string
  memorySubtitle: string
  clearMemory: string
  tamagotchiTitle: string
  tamagotchiSubtitle: string
  gamesTitle: string
  gamesDisabled: string
  gamesPlaying: string
  gamesNext: string
  gamesNow: string
  frequency: string
  activeModel: string
  forceModel: string
  windowPosition: string
  crueltyPedagogical: string
  crueltyCruel: string
  crueltyLabelMentor: string
  crueltyLabelBalance: string
  crueltyLabelBrutal: string
  crueltySubMentor: string
  crueltySubBalance: string
  crueltySubBrutal: string
  languageTitle: string
  // Server selector
  serverTitle: string
  providerConnected: string
  providerDisconnected: string
  providerDetecting: string
  autoDetect: string
  customUrlLabel: string
  customUrlPlaceholder: string
  // App
  gameSuggestion: string
  gameSuggestionYes: string
  gameSuggestionNo: string
  // useAIResponse
  errorNoServer: string
  errorNoContent: string
}

const es: T = {
  listening:          'Escuchando…',
  eureka:             '¡Eureka! 💡',
  pomo:               'Pomo 🍅',
  settingsTitle:      'Ajustes',
  personality:        'Personalidad',
  programmer:         'Programador',
  general:            'General',
  memoryTitle:        'Memoria de conversación',
  memorySubtitle:     'El pato recuerda el contexto',
  clearMemory:        'Limpiar memoria de sesión',
  tamagotchiTitle:    '🥚 Modo Tamagotchi',
  tamagotchiSubtitle: 'El pato tiene sentimientos. Cuídalo.',
  gamesTitle:         '🎮 Minijuegos',
  gamesDisabled:      'Desactivado',
  gamesPlaying:       '¡Jugando ahora!',
  gamesNext:          'Próximo en:',
  gamesNow:           '¡Es hora de jugar!',
  frequency:          'Frecuencia',
  activeModel:        'Modelo activo',
  forceModel:         'Forzar modelo',
  windowPosition:     'Posición ventana',
  crueltyPedagogical: '🎓 Pedagógico',
  crueltyCruel:       '😈 Cruel',
  crueltyLabelMentor: '🎓 Mentor paciente — ideal para principiantes',
  crueltyLabelBalance:'🦆 Pato equilibrado — para todos los niveles',
  crueltyLabelBrutal: '😈 Sin piedad — solo para valientes',
  crueltySubMentor:   'El pato te guía con paciencia y sin juzgar',
  crueltySubBalance:  'El pato equilibra humor y utilidad',
  crueltySubBrutal:   'El pato no tiene tiempo para excusas',
  languageTitle:         'Idioma',
  serverTitle:           '🔌 Servidor de IA',
  providerConnected:     '🟢 Conectado',
  providerDisconnected:  '🔴 Sin conexión',
  providerDetecting:     '🔍 Detectando…',
  autoDetect:            '↺ Auto-detectar',
  customUrlLabel:        'URL personalizada',
  customUrlPlaceholder:  'http://localhost:XXXX',
  gameSuggestion:     'Llevas mucho tiempo trabajando... ¿jugamos? 🎮',
  gameSuggestionYes:  '¡Vamos!',
  gameSuggestionNo:   'Ahora no',
  errorNoServer:      'Parece que LM Studio no está corriendo. ¿Seguro que abriste el servidor local?',
  errorNoContent:     '...ni yo sé qué decir. ¿Tienes código?',
}

const en: T = {
  listening:          'Listening…',
  eureka:             'Eureka! 💡',
  pomo:               'Pomo 🍅',
  settingsTitle:      'Settings',
  personality:        'Personality',
  programmer:         'Developer',
  general:            'General',
  memoryTitle:        'Conversation memory',
  memorySubtitle:     'The duck remembers context',
  clearMemory:        'Clear session memory',
  tamagotchiTitle:    '🥚 Tamagotchi Mode',
  tamagotchiSubtitle: 'The duck has feelings. Take care of it.',
  gamesTitle:         '🎮 Minigames',
  gamesDisabled:      'Disabled',
  gamesPlaying:       'Playing now!',
  gamesNext:          'Next in:',
  gamesNow:           'Time to play!',
  frequency:          'Frequency',
  activeModel:        'Active model',
  forceModel:         'Force model',
  windowPosition:     'Window position',
  crueltyPedagogical: '🎓 Pedagogical',
  crueltyCruel:       '😈 Cruel',
  crueltyLabelMentor: '🎓 Patient mentor — ideal for beginners',
  crueltyLabelBalance:'🦆 Balanced duck — for all levels',
  crueltyLabelBrutal: '😈 No mercy — for the brave only',
  crueltySubMentor:   'The duck guides you patiently, without judgement',
  crueltySubBalance:  'The duck balances humor and helpfulness',
  crueltySubBrutal:   'The duck has no time for excuses',
  languageTitle:         'Language',
  serverTitle:           '🔌 AI Server',
  providerConnected:     '🟢 Connected',
  providerDisconnected:  '🔴 Not connected',
  providerDetecting:     '🔍 Detecting…',
  autoDetect:            '↺ Auto-detect',
  customUrlLabel:        'Custom URL',
  customUrlPlaceholder:  'http://localhost:XXXX',
  gameSuggestion:     "You've been at it a while... wanna take a break? 🎮",
  gameSuggestionYes:  "Let's go!",
  gameSuggestionNo:   'Not now',
  errorNoServer:      "Looks like LM Studio isn't running. Did you start the local server?",
  errorNoContent:     "...even I don't know what to say. Got any code?",
}

const fr: T = {
  listening:          "J'écoute…",
  eureka:             'Eurêka ! 💡',
  pomo:               'Pomo 🍅',
  settingsTitle:      'Réglages',
  personality:        'Personnalité',
  programmer:         'Développeur',
  general:            'Général',
  memoryTitle:        'Mémoire de conversation',
  memorySubtitle:     'Le canard retient le contexte',
  clearMemory:        'Effacer la mémoire de session',
  tamagotchiTitle:    '🥚 Mode Tamagotchi',
  tamagotchiSubtitle: 'Le canard a des sentiments. Prenez-en soin.',
  gamesTitle:         '🎮 Mini-jeux',
  gamesDisabled:      'Désactivé',
  gamesPlaying:       'En train de jouer !',
  gamesNext:          'Prochain dans :',
  gamesNow:           "C'est l'heure de jouer !",
  frequency:          'Fréquence',
  activeModel:        'Modèle actif',
  forceModel:         'Forcer le modèle',
  windowPosition:     'Position fenêtre',
  crueltyPedagogical: '🎓 Pédagogique',
  crueltyCruel:       '😈 Cruel',
  crueltyLabelMentor: '🎓 Mentor patient — idéal pour les débutants',
  crueltyLabelBalance:'🦆 Canard équilibré — pour tous les niveaux',
  crueltyLabelBrutal: '😈 Sans pitié — pour les courageux seulement',
  crueltySubMentor:   'Le canard vous guide avec patience, sans juger',
  crueltySubBalance:  'Le canard équilibre humour et utilité',
  crueltySubBrutal:   "Le canard n'a pas de temps pour les excuses",
  languageTitle:         'Langue',
  serverTitle:           '🔌 Serveur IA',
  providerConnected:     '🟢 Connecté',
  providerDisconnected:  '🔴 Hors ligne',
  providerDetecting:     '🔍 Détection…',
  autoDetect:            '↺ Auto-détecter',
  customUrlLabel:        'URL personnalisée',
  customUrlPlaceholder:  'http://localhost:XXXX',
  gameSuggestion:     'Tu travailles depuis un moment... on joue ? 🎮',
  gameSuggestionYes:  'Allons-y !',
  gameSuggestionNo:   'Pas maintenant',
  errorNoServer:      "LM Studio ne semble pas actif. As-tu lancé le serveur local ?",
  errorNoContent:     "...même moi je ne sais pas quoi dire. T'as du code ?",
}

const de: T = {
  listening:          'Höre zu…',
  eureka:             'Heureka! 💡',
  pomo:               'Pomo 🍅',
  settingsTitle:      'Einstellungen',
  personality:        'Persönlichkeit',
  programmer:         'Entwickler',
  general:            'Allgemein',
  memoryTitle:        'Gesprächsgedächtnis',
  memorySubtitle:     'Die Ente merkt sich den Kontext',
  clearMemory:        'Sitzungsspeicher leeren',
  tamagotchiTitle:    '🥚 Tamagotchi-Modus',
  tamagotchiSubtitle: 'Die Ente hat Gefühle. Kümmere dich darum.',
  gamesTitle:         '🎮 Minispiele',
  gamesDisabled:      'Deaktiviert',
  gamesPlaying:       'Jetzt spielen!',
  gamesNext:          'Nächstes in:',
  gamesNow:           'Zeit zu spielen!',
  frequency:          'Häufigkeit',
  activeModel:        'Aktives Modell',
  forceModel:         'Modell erzwingen',
  windowPosition:     'Fensterposition',
  crueltyPedagogical: '🎓 Pädagogisch',
  crueltyCruel:       '😈 Grausam',
  crueltyLabelMentor: '🎓 Geduldiger Mentor — ideal für Anfänger',
  crueltyLabelBalance:'🦆 Ausgewogene Ente — für alle Stufen',
  crueltyLabelBrutal: '😈 Kein Erbarmen — nur für Mutige',
  crueltySubMentor:   'Die Ente führt dich geduldig, ohne zu urteilen',
  crueltySubBalance:  'Die Ente balanciert Humor und Hilfsbereitschaft',
  crueltySubBrutal:   'Die Ente hat keine Zeit für Ausreden',
  languageTitle:         'Sprache',
  serverTitle:           '🔌 KI-Server',
  providerConnected:     '🟢 Verbunden',
  providerDisconnected:  '🔴 Keine Verbindung',
  providerDetecting:     '🔍 Erkennung…',
  autoDetect:            '↺ Auto-erkennen',
  customUrlLabel:        'Benutzerdefinierte URL',
  customUrlPlaceholder:  'http://localhost:XXXX',
  gameSuggestion:     'Du arbeitest schon zu lange... spielen wir? 🎮',
  gameSuggestionYes:  'Los!',
  gameSuggestionNo:   'Nicht jetzt',
  errorNoServer:      'LM Studio scheint nicht zu laufen. Hast du den lokalen Server gestartet?',
  errorNoContent:     '...selbst ich weiß nicht, was ich sagen soll. Hast du Code?',
}

const pt: T = {
  listening:          'Ouvindo…',
  eureka:             'Eureka! 💡',
  pomo:               'Pomo 🍅',
  settingsTitle:      'Configurações',
  personality:        'Personalidade',
  programmer:         'Programador',
  general:            'Geral',
  memoryTitle:        'Memória de conversa',
  memorySubtitle:     'O pato lembra o contexto',
  clearMemory:        'Limpar memória da sessão',
  tamagotchiTitle:    '🥚 Modo Tamagotchi',
  tamagotchiSubtitle: 'O pato tem sentimentos. Cuide dele.',
  gamesTitle:         '🎮 Minijogos',
  gamesDisabled:      'Desativado',
  gamesPlaying:       'Jogando agora!',
  gamesNext:          'Próximo em:',
  gamesNow:           'Hora de jogar!',
  frequency:          'Frequência',
  activeModel:        'Modelo ativo',
  forceModel:         'Forçar modelo',
  windowPosition:     'Posição janela',
  crueltyPedagogical: '🎓 Pedagógico',
  crueltyCruel:       '😈 Cruel',
  crueltyLabelMentor: '🎓 Mentor paciente — ideal para iniciantes',
  crueltyLabelBalance:'🦆 Pato equilibrado — para todos os níveis',
  crueltyLabelBrutal: '😈 Sem piedade — só para os corajosos',
  crueltySubMentor:   'O pato te guia com paciência, sem julgamentos',
  crueltySubBalance:  'O pato equilibra humor e utilidade',
  crueltySubBrutal:   'O pato não tem tempo para desculpas',
  languageTitle:         'Idioma',
  serverTitle:           '🔌 Servidor de IA',
  providerConnected:     '🟢 Conectado',
  providerDisconnected:  '🔴 Sem conexão',
  providerDetecting:     '🔍 Detectando…',
  autoDetect:            '↺ Auto-detectar',
  customUrlLabel:        'URL personalizada',
  customUrlPlaceholder:  'http://localhost:XXXX',
  gameSuggestion:     'Você está trabalhando há muito tempo... vamos jogar? 🎮',
  gameSuggestionYes:  'Vamos!',
  gameSuggestionNo:   'Agora não',
  errorNoServer:      'Parece que o LM Studio não está rodando. Você iniciou o servidor local?',
  errorNoContent:     '...nem eu sei o que dizer. Tem algum código?',
}

export const translations: Record<LangCode, T> = { es, en, fr, de, pt }

export function useTranslation(): T {
  const lang = useStore((s) => s.responseLanguage) as LangCode
  return translations[lang] ?? translations.es
}
