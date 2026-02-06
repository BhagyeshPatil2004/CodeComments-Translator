'use client';

import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    title: string;
    placeholder?: string;
    readOnly?: boolean;
}

export default function CodeEditor({
    value,
    onChange,
    title,
    placeholder,
    readOnly = false,
}: CodeEditorProps) {
    const [copied, setCopied] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync scrolling
    const handleScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Syntax highlighting
    useEffect(() => {
        if (preRef.current) {
            Prism.highlightElement(preRef.current.querySelector('code')!);
        }
    }, [value]);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Generate line numbers
    const lines = value.split('\n');
    const lineNumbers = lines.map((_, i) => i + 1).join('\n');

    return (
        <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-gray-700 font-mono shadow-2xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#252526] px-4 py-3 border-b border-gray-700">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    {title.toUpperCase()}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
                        title="Copy to Clipboard"
                    >
                        {copied ? '✓' : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 flex overflow-hidden bg-[#1e1e1e]">
                {/* Line Numbers */}
                <div className="py-4 px-3 text-right bg-[#1e1e1e] border-r border-gray-800 text-gray-600 select-none text-sm leading-6 min-w-[3rem]">
                    <pre className="font-mono">{lineNumbers || '1'}</pre>
                </div>

                {/* Code Area */}
                <div className="relative flex-1 h-full">
                    {/* Syntax Highlight Layer */}
                    <pre
                        ref={preRef}
                        className="absolute inset-0 m-0 pointer-events-none overflow-hidden h-full w-full code-layer whitespace-pre"
                        aria-hidden="true"
                    >
                        <code className={`language-${value.trim().startsWith('//') || value.trim().startsWith('/*') ? 'javascript' : 'python'} !bg-transparent !p-0 !m-0 !shadow-none code-layer`}>
                            {value}
                        </code>
                    </pre>

                    {/* Input Layer */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onScroll={handleScroll}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none z-10 selection:bg-purple-500/30 code-layer whitespace-pre transparent-input"
                        spellCheck={false}
                        wrap="off"
                    />

                    {readOnly && !value && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none">
                            <div className="text-center">
                                <div className="text-2xl mb-2 opacity-50">✨</div>
                                <div>Translation waiting...</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
