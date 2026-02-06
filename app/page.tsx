'use client';

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import LanguageSelector from '@/components/LanguageSelector';
import UILanguageSelector from '@/components/UILanguageSelector';
import { motion } from 'framer-motion';
import { translations, type LanguageCode } from '@/lib/translations';

export default function Home() {
    const [sourceCode, setSourceCode] = useState('');
    const [translatedCode, setTranslatedCode] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('auto');
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [isTranslating, setIsTranslating] = useState(false);
    const [uiLanguage, setUiLanguage] = useState<LanguageCode>('en');
    const [githubUrl, setGithubUrl] = useState('');
    const [isFetchingGithub, setIsFetchingGithub] = useState(false);
    const [riskCounts, setRiskCounts] = useState({ security: 0, critical: 0, caution: 0, safe: 0 });

    const t = translations[uiLanguage];

    // Count risk levels in translated code
    const countRisks = (code: string) => {
        const lines = code.split('\n');
        let security = 0, critical = 0, caution = 0, safe = 0;
        lines.forEach(line => {
            // Check for security violations (highest priority)
            if (line.includes('[SECURITY]')) security++;
            // Check for critical indicators (red circle emoji or [CRITICAL] text)
            else if (line.includes('🔴') || line.includes('[CRITICAL]')) critical++;
            // Check for caution indicators (yellow circle, warning triangle, or [CAUTION] text)
            else if (line.includes('🟡') || line.includes('⚠️') || line.includes('[CAUTION]')) caution++;
            // Check for safe indicators (green circle or [SAFE] text)
            else if (line.includes('🟢') || line.includes('[SAFE]')) safe++;
        });
        setRiskCounts({ security, critical, caution, safe });
    };

    // Scan source code for security vulnerabilities (secrets, API keys, etc.)
    const scanForSecrets = (code: string): number => {
        const securityPatterns = [
            /api[_-]?key\s*[:=]/gi,              // API keys
            /secret[_-]?key\s*[:=]/gi,           // Secret keys
            /password\s*[:=]\s*["'][^"']+["']/gi, // Hardcoded passwords
            /Bearer\s+[A-Za-z0-9\-._~+\/]+/g,    // Bearer tokens
            /sk-[A-Za-z0-9]{20,}/g,              // OpenAI-like API keys
            /ghp_[A-Za-z0-9]{36}/g,              // GitHub tokens
            /aws[_-]?(access|secret)/gi,         // AWS credentials
            /private[_-]?key/gi,                 // Private keys
            /credentials?\s*[:=]/gi,             // Credentials
            /["'][A-Za-z0-9]{32,}["']/g,         // Long string secrets
        ];

        let secretCount = 0;
        securityPatterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) {
                secretCount += matches.length;
                console.log('🔴 Security issue found:', matches);
            }
        });
        return secretCount;
    };

    // Fetch code from GitHub URL
    const handleFetchGithub = async () => {
        if (!githubUrl.trim()) return;
        setIsFetchingGithub(true);
        try {
            // Convert GitHub URL to raw content URL
            const rawUrl = githubUrl
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');

            const response = await fetch(rawUrl);
            if (!response.ok) throw new Error('Failed to fetch file');
            const code = await response.text();
            setSourceCode(code);
            setGithubUrl('');
        } catch (error) {
            alert('Failed to fetch from GitHub. Make sure the URL is a valid file link.');
        } finally {
            setIsFetchingGithub(false);
        }
    };

    // Export translated code as file
    const handleExport = () => {
        if (!translatedCode.trim()) return;
        const blob = new Blob([translatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'translated_code.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleTranslate = async () => {
        if (!sourceCode.trim()) return;

        setIsTranslating(true);
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: sourceCode,
                    sourceLanguage,
                    targetLanguage,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setTranslatedCode(data.translatedCode);

                // Scan SOURCE CODE for security vulnerabilities (secrets in actual code)
                const secretsInCode = scanForSecrets(sourceCode);

                // Count risks in translated comments
                const lines = data.translatedCode.split('\n');
                let security = 0, critical = 0, caution = 0, safe = 0;
                lines.forEach((line: string) => {
                    if (line.includes('[SECURITY]')) security++;
                    else if (line.includes('🔴') || line.includes('[CRITICAL]')) critical++;
                    else if (line.includes('🟡') || line.includes('⚠️') || line.includes('[CAUTION]')) caution++;
                    else if (line.includes('🟢') || line.includes('[SAFE]')) safe++;
                });

                // Combine: add secrets found in code to security count
                setRiskCounts({
                    security: security + secretsInCode,
                    critical,
                    caution,
                    safe
                });
            } else {
                alert('Translation failed: ' + data.error);
            }
        } catch (error) {
            alert('Translation failed. Please check your API key.');
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="min-h-screen relative p-6">
            {/* Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-50">
                <UILanguageSelector
                    selectedLanguage={uiLanguage}
                    onLanguageChange={(lang) => setUiLanguage(lang as LanguageCode)}
                />
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-6xl font-bold mb-3">
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                        {t.title}
                    </span>
                </h1>
                <p className="text-gray-300 text-xl">
                    {t.subtitle}
                </p>
            </motion.div>

            {/* GitHub URL Input */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex justify-center items-center gap-3 mb-6"
            >
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/10">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <input
                            type="text"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            placeholder="Paste GitHub file URL..."
                            className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-80 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleFetchGithub()}
                        />
                        <button
                            onClick={handleFetchGithub}
                            disabled={isFetchingGithub || !githubUrl.trim()}
                            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-300"
                        >
                            {isFetchingGithub ? (
                                <span className="flex items-center gap-1">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Fetching
                                </span>
                            ) : 'Fetch'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Language Selectors */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center items-center gap-4 mb-6"
            >
                <LanguageSelector
                    value={sourceLanguage}
                    onChange={setSourceLanguage}
                    label={t.from}
                    includeAuto
                />
                <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-6"
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-purple-400"
                    >
                        <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.div>
                <LanguageSelector
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                    label={t.to}
                />
            </motion.div>

            {/* Editors */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-6 mb-6"
            >
                <CodeEditor
                    value={sourceCode}
                    onChange={setSourceCode}
                    title={t.sourceCodeTitle}
                    placeholder={t.sourcePlaceholder}
                />
                <CodeEditor
                    value={translatedCode}
                    onChange={() => { }}
                    title={t.translatedCodeTitle}
                    placeholder={t.translatedPlaceholder}
                    readOnly
                />
            </motion.div>

            {/* Translate Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
            >
                <button
                    onClick={handleTranslate}
                    disabled={isTranslating || !sourceCode.trim()}
                    className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                    {isTranslating ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t.translating}
                        </span>
                    ) : (
                        t.translateButton
                    )}
                </button>
            </motion.div>

            {/* Risk Summary & Export */}
            {translatedCode && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 mt-6"
                >
                    {/* Risk Summary Panel - Enhanced */}
                    <div className="flex items-center gap-6 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-2 pr-6 border-r border-white/10">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-white font-semibold">Security Scan</span>
                        </div>

                        {/* Security Card - NEW! */}
                        {riskCounts.security > 0 && (
                            <div className="flex flex-col items-center px-4 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/50 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-3xl font-bold text-purple-400">{riskCounts.security}</span>
                                </div>
                                <span className="text-purple-300/70 text-xs font-medium uppercase tracking-wider">Secrets</span>
                            </div>
                        )}

                        {/* Critical Card */}
                        <div className="flex flex-col items-center px-4 py-1 bg-red-500/10 rounded-xl border border-red-500/30">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔴</span>
                                <span className="text-3xl font-bold text-red-400">{riskCounts.critical + riskCounts.security}</span>
                            </div>
                            <span className="text-red-300/70 text-xs font-medium uppercase tracking-wider">Critical</span>
                        </div>

                        {/* Caution Card */}
                        <div className="flex flex-col items-center px-4 py-1 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🟡</span>
                                <span className="text-3xl font-bold text-yellow-400">{riskCounts.caution}</span>
                            </div>
                            <span className="text-yellow-300/70 text-xs font-medium uppercase tracking-wider">Caution</span>
                        </div>

                        {/* Safe Card */}
                        <div className="flex flex-col items-center px-4 py-1 bg-green-500/10 rounded-xl border border-green-500/30">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🟢</span>
                                <span className="text-3xl font-bold text-green-400">{riskCounts.safe}</span>
                            </div>
                            <span className="text-green-300/70 text-xs font-medium uppercase tracking-wider">Safe</span>
                        </div>

                        {/* Export Button - Integrated */}
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ml-4"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Code
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-8 text-gray-400"
            >
                <p>⚡ Deterministic Translation · No LLMs · Powered by <span className="text-purple-400 font-semibold">Lingo.dev</span></p>
            </motion.div>
        </div>
    );
}
