'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

interface UILanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (langCode: string) => void;
}

export default function UILanguageSelector({ selectedLanguage, onLanguageChange }: UILanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLang = languages.find(l => l.code === selectedLanguage) || languages[0];

    const handleSelect = (lang: Language) => {
        onLanguageChange(lang.code);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 transition-all duration-200"
            >
                <span className="text-2xl">{selectedLang.flag}</span>
                <span className="text-white font-medium">{selectedLang.code}</span>
                <svg
                    className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden z-50"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-150 ${selectedLang.code === lang.code ? 'bg-purple-500/20' : ''
                                    }`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <div className="flex flex-col items-start">
                                    <span className="text-white font-medium">{lang.name}</span>
                                    <span className="text-gray-400 text-xs">{lang.code}</span>
                                </div>
                                {selectedLang.code === lang.code && (
                                    <svg
                                        className="w-5 h-5 text-purple-400 ml-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
