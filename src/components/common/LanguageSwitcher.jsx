// src/components/common/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  const languages = [
    { code: 'es', label: t('idioma.es'), flag: '🇪🇨' },
    { code: 'en', label: t('idioma.en'), flag: '🇺🇸' },
    { code: 'ru', label: t('idioma.ru'), flag: '🇷🇺' },
  ]

  return (
    <div className="flex items-center gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            i18n.language === lang.code
              ? 'bg-[#d4af37] text-[#1e3a5f] font-semibold'
              : 'bg-[#2a4a6d] text-white hover:bg-[#3a5a7d]'
          }`}
          title={lang.label}
        >
          {lang.flag} {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}