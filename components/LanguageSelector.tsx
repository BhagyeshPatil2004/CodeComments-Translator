'use client';

import { motion } from 'framer-motion';

interface LanguageSelectorProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    includeAuto?: boolean;
}

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
];

export default function LanguageSelector({
    value,
    onChange,
    label,
    includeAuto = false,
}: LanguageSelectorProps) {
    const selectedLang = languages.find((l) => l.code === value);

    return (
        <motion.div
            className="flex flex-col gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <label className="text-sm text-gray-400 font-medium">{label}</label>
            <motion.div
                className="glass rounded-xl px-5 py-3 min-w-[220px] cursor-pointer hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent text-white focus:outline-none cursor-pointer text-lg font-medium"
                >
                    {includeAuto && (
                        <option value="auto" className="bg-gray-800">
                            🌐 Auto Detect
                        </option>
                    )}
                    {languages.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-gray-800">
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>
            </motion.div>
        </motion.div>
    );
}
