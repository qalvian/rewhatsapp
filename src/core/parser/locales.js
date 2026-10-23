// @ts-check

/**
 * System event pattern table across international locales.
 * If any of these patterns match the message body before or after a colon split,
 * the message is unconditionally classified as a system event.
 *
 * @type {RegExp[]}
 */
export const SYSTEM_EVENT_PATTERNS = [
  // End-to-end encryption notice (English, Spanish, Portuguese, German, French, Italian, Hindi, etc.)
  /Messages and calls are end-to-end encrypted/i,
  /Las llamadas y los mensajes están cifrados de extremo a extremo/i,
  /As mensagens e chamadas são protegidas com a criptografia de ponta a ponta/i,
  /Nachrichten und Anrufe sind Ende-zu-Ende-verschlüsselt/i,
  /Les messages et les appels sont chiffrés de bout en bout/i,
  /I messaggi e le chiamate sono crittografati end-to-end/i,
  /Berichten en oproepen zijn end-to-end versleuteld/i,
  /Сообщения и звонки защищены сквозным шифрованием/i,
  /संदेश और कॉल एंड-टू-एंड एन्क्रिप्टेड हैं/i,
  /الرسائل والمكالمات مشفرة تماماً بین الطرفین/i,

  // Security code changes
  /security code changed/i,
  /código de seguridad cambió/i,
  /código de segurança mudou/i,
  /Sicherheitsnummer hat sich geändert/i,
  /code de sécurité a changé/i,
  /codice di sicurezza è cambiato/i,

  // Group membership & subject/icon actions
  /created group/i,
  /creó el grupo/i,
  /criou o grupo/i,
  /hat die Gruppe erstellt/i,
  /a créé le groupe/i,
  /ha creato il gruppo/i,
  /heeft de groep gemaakt/i,

  /added\s+/i,
  /añadió a\s+/i,
  /adicionou\s+/i,
  /hat .* hinzugefügt/i,
  /a ajouté\s+/i,
  /ha aggiunto\s+/i,

  /removed\s+/i,
  /eliminó a\s+/i,
  /removeu\s+/i,
  /hat .* entfernt/i,
  /a retiré\s+/i,
  /ha rimosso\s+/i,

  /left$/i,
  /saliste del grupo/i,
  /saiu do grupo/i,
  /hat die Gruppe verlassen/i,
  /a quitté le groupe/i,
  /ha abbandonato il gruppo/i,

  /changed the subject/i,
  /changed this group's icon/i,
  /changed the group description/i,
  /cambió el asunto/i,
  /cambió el ícono de este grupo/i,
  /alterou o assunto/i,
  /hat das Gruppenbild geändert/i,
  /hat den Betreff geändert/i,

  // Disappearing messages
  /disappearing messages/i,
  /mensajes temporales/i,
  /mensagens temporárias/i,
  /selbstlöschende Nachrichten/i,

  // Calls
  /Missed (?:voice|video)?\s*call/i,
  /Llamada (?:perdida|(?:de voz|de video) perdida)/i,
  /Chamada (?:perdida|(?:de voz|de vídeo) perdida)/i,
  /Verpasster (?:Sprachanruf|Videoanruf|Anruf)/i,
  /Appel (?:vocal|vidéo)?\s*manqué/i,
  /Chiamata (?:vocale|video)?\s*persa/i,
];

/**
 * Locale mapping for deleted message indicators.
 * @type {RegExp[]}
 */
export const DELETED_MESSAGE_PATTERNS = [
  /^(This message was deleted|You deleted this message)\.?$/i,
  /^(Este mensaje fue eliminado|Eliminaste este mensaje)\.?$/i,
  /^(Esta mensagem foi apagada|Você apagou esta mensagem)\.?$/i,
  /^(Diese Nachricht wurde gelöscht|Du hast diese Nachricht gelöscht)\.?$/i,
  /^(Ce message a été supprimé|Vous avez supprimé ce message)\.?$/i,
  /^(Questo messaggio è stato eliminato|Hai eliminato questo messaggio)\.?$/i,
  /^(Dit bericht is verwijderd|Je hebt dit bericht verwijderd)\.?$/i,
  /^(Это сообщение было удалено|Вы удалили это сообщение)\.?$/i,
];

/**
 * Locale placeholder mapping for media types.
 * @type {Array<{ kind: 'image' | 'video' | 'audio' | 'sticker' | 'document' | 'voice'; pattern: RegExp }>}
 */
export const MEDIA_PLACEHOLDER_PATTERNS = [
  // Voice messages
  {
    kind: 'voice',
    pattern:
      /(?:<attached:\s*)?PTT-\d+-\w+\.(?:opus|m4a|aac|ogg|mp3)>?|\b(?:voice message|mensaje de voz|Sprachnachricht|message vocal|messaggio vocale)(?:\s+omitted|\s+weggelassen)?\b/i,
  },
  // Audio omitted
  {
    kind: 'audio',
    pattern:
      /(?:<attached:\s*)?AUD-\d+-\w+\.(?:opus|m4a|aac|ogg|mp3)>?|\b(?:audio|audio file)(?:\s+omitted|\s+weggelassen|\s+ausgeblendet)?\b/i,
  },
  // Stickers
  {
    kind: 'sticker',
    pattern:
      /(?:<attached:\s*)?STK-\d+-\w+\.webp>?|\b(?:sticker)(?:\s+omitted|\s+weggelassen|\s+ausgeblendet|\s+omitido)?\b/i,
  },
  // Video
  {
    kind: 'video',
    pattern:
      /(?:<attached:\s*)?VID-\d+-\w+\.(?:mp4|mov|avi)>?|\b(?:video|video file|vídeo)(?:\s+omitted|\s+weggelassen|\s+ausgeblendet|\s+omitido)?\b/i,
  },
  // Image
  {
    kind: 'image',
    pattern:
      /(?:<attached:\s*)?IMG-\d+-\w+\.(?:jpg|jpeg|png|heic|webp)>?|\b(?:image|photo|foto|imagen|bild)(?:\s+omitted|\s+weggelassen|\s+ausgeblendet|\s+omitida)?\b/i,
  },
  // General media omitted / attached
  {
    kind: 'image',
    pattern: /<Media omitted>|<archivo omitido>|<mídia omitida>|<Medien weggelassen>/i,
  },
  // Document / file attached
  {
    kind: 'document',
    pattern:
      /(?:<attached:\s*)?DOC-\d+-\w+\.\w+>?|\b(?:document|documento|dokument)(?:\s+omitted|\s+weggelassen)?\b|\(.* (file attached|archivo adjunto|Datei angehängt)\)/i,
  },
];
