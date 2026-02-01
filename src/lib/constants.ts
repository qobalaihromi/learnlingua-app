export const languageSuggestions = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "jp", name: "Japanese", flag: "🇯🇵" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "pt", name: "Portuguese", flag: "🇧🇷" },
]

export const getLanguageDisplay = (langCode: string | undefined | null) => {
    if (!langCode) {
        return { name: "Unknown", flag: "🌍" }
    }
    const found = languageSuggestions.find(l =>
        l.code.toLowerCase() === langCode.toLowerCase() ||
        l.name.toLowerCase() === langCode.toLowerCase()
    )
    if (found) {
        return { name: found.name, flag: found.flag }
    }
    return {
        name: langCode.charAt(0).toUpperCase() + langCode.slice(1),
        flag: "🌍"
    }
}
