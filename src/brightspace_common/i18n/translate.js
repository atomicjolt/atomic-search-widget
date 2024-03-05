// I chose not to include a translation package since the widget currently has
// no dependencies. The use is simple enough so far that this is fine.
import en from './en';
import nl from './nl';

function getSelectedLanguage() {
  // Brightspace adds this attribute to the html tag when the language is set
  switch (document.documentElement.lang) {
    // dutch
    case 'nl-nl': return 'nl';
    default: return 'en';
  }
}

const selectedLanguage = getSelectedLanguage();

function getTranslatedText(key) {
  switch (selectedLanguage) {
    case 'nl': return nl[key];
    default: return en[key];
  }
}

export default function t(key) {
  const translated = getTranslatedText(key);
  if (translated) return translated;

  console.warn(`No translation found for key: "${key}"`);
  return key;
}
