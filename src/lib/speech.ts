export const speakText = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
        // Cancel any current speaking
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        // Try to set voice based on language detection or mapping if needed
        // For now, simple lang setting
        // utterance.lang = lang // Optional: we might want to pass deck language here

        window.speechSynthesis.speak(utterance)
    }
}
