import React, { useEffect, useRef } from 'react';
import useAppStore from '../store/useAppStore';
import { ArrowLeft, Copy, Check, Code as CodeIcon, Eye } from 'lucide-react';

const ResultView = () => {
    const setMode = useAppStore(state => state.setMode);
    const generatedCode = useAppStore(state => state.generatedCode);

    const iframeRef = useRef(null);
    const [copied, setCopied] = React.useState(false);
    const [view, setView] = React.useState('split'); 

    // Inject code into iframe
    useEffect(() => {
        const updateIframe = () => {
            if (iframeRef.current) {
                const doc = iframeRef.current.contentWindow.document;
                doc.open();
                doc.write(generatedCode || '');
                doc.close();
            }
        };

        const timeout = setTimeout(updateIframe, 50);
        return () => clearTimeout(timeout);
    }, [generatedCode, view]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMode('DRAWING')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="font-orbitron text-xl text-slate-800 tracking-wider font-bold">GENERATION RESULT</h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Toggles */}
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 mr-4">
                        <button
                            onClick={() => setView('preview')}
                            className={`p-2 rounded-md transition-all ${view === 'preview' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Preview Only"
                        >
                            <Eye size={18} />
                        </button>
                        <div className="w-[1px] bg-slate-200 my-1 mx-1"></div>
                        <button
                            onClick={() => setView('split')}
                            className={`p-2 rounded-md transition-all ${view === 'split' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Split View"
                        >
                            <div className="flex gap-1">
                                <Eye size={18} />
                                <div className="w-[1px] h-full bg-current opacity-30"></div>
                                <CodeIcon size={18} />
                            </div>
                        </button>
                        <div className="w-[1px] bg-slate-200 my-1 mx-1"></div>
                        <button
                            onClick={() => setView('code')}
                            className={`p-2 rounded-md transition-all ${view === 'code' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Code Only"
                        >
                            <CodeIcon size={18} />
                        </button>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold shadow-sm ${copied ? 'bg-green-500 text-white' : 'bg-sky-500 text-white hover:bg-sky-600 hover:shadow-md'}`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span className="font-orbitron text-xs tracking-wider">{copied ? 'COPIED' : 'COPY CODE'}</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">

                {/* Preview Pane */}
                <div className={`
                    bg-white relative transition-all duration-300 ease-in-out border-r border-slate-200
                    ${view === 'code' ? 'w-0 flex-none hidden overflow-hidden' : ''}
                    ${view === 'preview' ? 'w-full flex-1' : ''}
                    ${view === 'split' ? 'w-1/2 flex-none' : ''}
                `}>
                    <iframe
                        ref={iframeRef}
                        title="Live Preview"
                        className="w-full h-full border-none bg-white"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>

                {/* Code Pane */}
                <div className={`
                    bg-[#0f172a] overflow-auto transition-all duration-300 ease-in-out relative
                    ${view === 'preview' ? 'w-0 flex-none hidden overflow-hidden' : ''}
                    ${view === 'code' ? 'w-full flex-1' : ''}
                    ${view === 'split' ? 'w-1/2 flex-none' : ''}
                `}>
                    <div className="absolute top-4 right-4 px-2 py-1 bg-white/10 text-white/50 text-[10px] uppercase font-mono tracking-widest rounded border border-white/10 pointer-events-none">
                        HTML / TAILWIND
                    </div>

                    <pre className="p-6 font-mono text-sm text-blue-100/90 leading-relaxed overflow-x-auto tab-4">
                        <code>{generatedCode}</code>
                    </pre>
                </div>

            </div>
        </div>
    );
};

export default ResultView;
