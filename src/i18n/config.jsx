import { toAbsoluteUrl } from '@/utils';
import enMessages from './messages/en.json';
const I18N_MESSAGES = {
  en: enMessages
};
const I18N_CONFIG_KEY = 'i18nConfig';
const I18N_LANGUAGES = [{
  label: 'English',
  code: 'en',
  direction: 'ltr',
  flag: toAbsoluteUrl('/media/flags/united-states.svg'),
  messages: I18N_MESSAGES.en
}];
const I18N_DEFAULT_LANGUAGE = I18N_LANGUAGES[0];
export { I18N_CONFIG_KEY, I18N_DEFAULT_LANGUAGE, I18N_LANGUAGES, I18N_MESSAGES };