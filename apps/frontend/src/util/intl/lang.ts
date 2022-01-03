import { IStrings } from './langdef'
import MdEditor from 'react-markdown-editor-lite'

export const no: IStrings = {
  CREATE: 'Opprett',
  DELETE: 'Slett',
  UPDATE: 'Oppdater',
  abort: 'Avbryt',
  action: 'Action',
  administrate: 'Admin',
  auditNotFound: 'Audit ikke funnet',
  auditNr: 'Versjon #',
  audit: 'Versjonering',
  audits: 'Versjoneringer',
  close: 'Lukk',
  emptyTable: 'ingen',
  id: 'Id',
  lastChanges: 'Siste endringer',
  mailLog: 'Varslinger',
  nextButton: 'Neste',
  prevButton: 'Forrige',
  pageNotFound: 'Oida 404! Fant ikke den siden der nei',
  rows: 'Rader',
  save: 'Lagre',
  searchId: 'Søk etter id',
  table: 'Tabell',
  time: 'Tid',
  user: 'Bruker',
  version: 'Versjon',
  view: 'Vis',
  settings: 'Instillinger',
  questionAndAnswers: 'Spørsmål og svar',
}

// Markdown norsk locale
MdEditor.addLocale('nb', {
  clearTip: 'Bekreft tøm innhold',
  btnHeader: 'Tittel',
  btnClear: 'Tøm',
  btnBold: 'Fet',
  btnItalic: 'Kursiv',
  btnUnderline: 'Understrek',
  btnStrikethrough: 'Strek',
  btnUnordered: 'Liste',
  btnOrdered: 'Nummerert liste',
  btnQuote: 'Sitat',
  btnLineBreak: 'Linjeskift',
  btnInlineCode: 'Kodelinje',
  btnCode: 'Kode',
  btnTable: 'Tabell',
  btnImage: 'Bilde',
  btnLink: 'Lenke',
  btnUndo: 'Angre',
  btnRedo: 'Redo',
  btnFullScreen: 'Fullskjerm',
  btnExitFullScreen: 'Avslutt fullskjerm',
  btnModeEditor: 'Editor',
  btnModePreview: 'Forhåndsvisning',
  btnModeAll: 'Editor og forhåndsvisning',
  selectTabMap: 'Tillat tab',
  tab: 'Tab',
  spaces: 'Mellomrom',
})
// react tror useLocale er en hook...
const setMdLocale = MdEditor.useLocale
setMdLocale('nb')

export const en: IStrings = {
  CREATE: 'Create',
  DELETE: 'Delete',
  UPDATE: 'Update',
  abort: 'Abort',
  action: 'Action',
  administrate: 'Admin',
  auditNotFound: 'Audits not found',
  auditNr: 'Audit #',
  audit: 'Audit',
  audits: 'Audits',
  close: 'Close',
  emptyTable: 'empty',
  id: 'Id',
  lastChanges: 'Last changes',
  mailLog: 'Notification',
  nextButton: 'Next',
  prevButton: 'Prev',
  pageNotFound: "Oops 404! couldn't find page",
  rows: 'Rows',
  save: 'Save',
  searchId: 'Search for id',
  table: 'Table',
  time: 'Time',
  user: 'User',
  version: 'Version',
  view: 'View',
  settings: 'Settings',
  questionAndAnswers: 'Questions and answer',
}
