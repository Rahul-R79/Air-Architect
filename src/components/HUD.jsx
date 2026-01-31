import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { Mic, Square } from 'lucide-react';
import { voiceManager } from '../services/voiceManager';
import { geminiService } from '../services/geminiService';

const HUD = () => {
    const mode = useAppStore(state => state.mode);
    const setMode = useAppStore(state => state.setMode);
    const shapes = useAppStore(state => state.shapes);
    const setTranscript = useAppStore(state => state.setTranscript);
    const transcript = useAppStore(state => state.transcript);
    const isHandDetected = useAppStore(state => state.handLandmarks.length > 0);

    // Local State
    const [localTranscript, setLocalTranscript] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [lastSnapshot, setLastSnapshot] = useState(null);

    // Generate Button logic
    const handleGenerate = async () => {
        const placeholder = "Click the mic to record instructions...";
        let effectiveTranscript = (localTranscript && localTranscript !== placeholder)
            ? localTranscript
            : transcript;

        if (effectiveTranscript === placeholder) effectiveTranscript = "";

        if (!effectiveTranscript && shapes.length === 0) {
            alert("Draw something or speak instructions first!");
            return;
        }

        setMode('GENERATING');

        try {
            const getSnapshot = useAppStore.getState().getCanvasSnapshot;
            let snapshot = null;
            if (getSnapshot) {
                snapshot = getSnapshot();
                setLastSnapshot(snapshot);
            }

            // Send Image + Voice to Gemini
            const code = await geminiService.generateLayout(effectiveTranscript, snapshot);

            useAppStore.getState().setGeneratedCode(code);
            setMode('RESULT');
        } catch (e) {
            console.error("Gemini Failure:", e);
            alert(`AI Generation Failed:\n${e.message}`);
            setMode('DRAWING');
        }
    };

    // Recording Logic
    const toggleRecording = async () => {
        if (!isRecording) {
            const started = await voiceManager.startRecording();
            if (started) {
                setIsRecording(true);
                setLocalTranscript("");
            }
        } else {
            setIsRecording(false);
            setIsTranscribing(true);
            try {
                const base64Audio = await voiceManager.stopRecording();
                if (base64Audio) {
                    const text = await geminiService.transcribeAudio(base64Audio);
                    setLocalTranscript(text);
                    setTranscript(text);
                }
            } catch (err) {
                console.error("Transcription error", err);
                setLocalTranscript("Error transcribing audio. Please try again.");
            } finally {
                setIsTranscribing(false);
            }
        }
    };

    const showExpanded = localTranscript && !isRecording && !isTranscribing;

    return (
        <>
            {mode === 'GENERATING' && (
                <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center animate-in fade-in duration-700 overflow-hidden">
                    {/* Background Snapshot - Full Screen & Crisp */}
                    {lastSnapshot && (
                        <>
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] ease-linear transform-gpu"
                                style={{ backgroundImage: `url(${lastSnapshot})` }}
                            />
                            <div className="absolute inset-0 bg-slate-900/80" />
                        </>
                    )}

                    {/* Scanning Grid Effect */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                    {/* Content */}
                    <div className="relative z-20 flex flex-col items-center gap-6">
                        {/* Smaller Spinner */}
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-sky-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-sky-500 rounded-full animate-[spin_1s_linear_infinite]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <h2 className="font-orbitron text-2xl text-white tracking-[0.3em] font-bold animate-pulse drop-shadow-lg">
                                GENERATING
                            </h2>
                            <span className="text-sky-400/80 font-mono text-xs tracking-widest uppercase">
                                Analyzing {shapes.length} Components...
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-30 p-4 md:p-8">

                {/* Top Bar: Status */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${isHandDetected ? 'text-emerald-700' : 'text-rose-700'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${isHandDetected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="font-orbitron text-xs md:text-sm tracking-wider font-bold">
                                {isHandDetected ? 'SYSTEM READY' : 'NO HAND DETECTED'}
                            </span>
                        </div>
                        <div className="backdrop-blur-md self-start px-3 py-1 rounded-md text-[10px] text-slate-600 font-mono font-bold">
                            SHAPES: {shapes.length}
                        </div>
                    </div>

                    <div className="backdrop-blur-md px-4 py-2 rounded-lg text-xs font-mono text-slate-700 font-bold hidden md:block">
                        PINCH TO DRAW • RELEASE TO FINISH
                    </div>
                </div>

                {/* Center Action */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-4 md:gap-8 w-full max-w-6xl mx-auto">

                    {/* Voice Interface */}
                    <div className={`transition-all duration-300 w-full md:w-auto ${showExpanded ? 'flex-1 md:max-w-2xl' : ''}`}>

                        {/* 1. IDLE STATE: Simple Button */}
                        {!isRecording && !isTranscribing && !localTranscript && (
                            <button
                                onClick={toggleRecording}
                                className="pointer-events-auto flex items-center gap-3 px-6 py-4 backdrop-blur-xl shadow-xl rounded-full hover:scale-105 transition-all group w-full md:w-auto justify-center md:justify-start"
                            >
                                <div className="p-2 bg-sky-100 text-sky-600 rounded-full group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                    <Mic size={24} />
                                </div>
                                <span className="font-orbitron text-slate-800 tracking-widest text-sm font-bold">VOICE COMMAND</span>
                            </button>
                        )}

                        {/* 2. RECORDING STATE: Pulsing Red Pill */}
                        {isRecording && (
                            <button
                                onClick={toggleRecording}
                                className="pointer-events-auto flex items-center gap-4 px-8 py-4 bg-rose-500 text-white shadow-xl shadow-rose-500/40 border-2 border-white/20 rounded-full animate-pulse transition-all transform hover:scale-105 w-full md:w-auto justify-center md:justify-start"
                            >
                                <Square size={24} />
                                <span className="font-orbitron tracking-widest text-sm font-bold">RECORDING...</span>
                            </button>
                        )}

                        {/* 3. TRANSCRIBING STATE: Pulsing Yellow Pill */}
                        {isTranscribing && (
                            <div className="pointer-events-auto flex items-center justify-center md:justify-start gap-3 px-6 py-4 backdrop-blur-xl shadow-lg rounded-full w-full md:w-auto">
                                <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" />
                                <span className="font-orbitron text-white tracking-widest text-sm font-bold">TRANSCRIBING...</span>
                            </div>
                        )}

                        {/* 4. RESULT STATE: Expanded Text Area */}
                        {showExpanded && (
                            <div className="bg-white/95 backdrop-blur-xl border border-sky-100 border-l-4 border-l-sky-500 p-4 rounded-r-2xl rounded-l-md relative animate-in slide-in-from-bottom-2 shadow-2xl">
                                <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-widest">
                                        <Mic size={14} /> VOICE COMMAND
                                    </div>
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        <button
                                            onClick={() => { setLocalTranscript(""); setTranscript(""); }}
                                            className="text-xs text-slate-400 hover:text-rose-500 transition-colors px-2 font-bold"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={toggleRecording}
                                            className="p-1.5 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-500 hover:text-white transition-colors"
                                        >
                                            <Mic size={18} />
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={localTranscript}
                                    onChange={(e) => {
                                        setLocalTranscript(e.target.value);
                                        setTranscript(e.target.value);
                                    }}
                                    className="bg-transparent text-slate-800 font-medium text-lg leading-snug w-full h-32 resize-none focus:outline-none placeholder:text-slate-400 pointer-events-auto custom-scrollbar"
                                    placeholder="Click mic to record instructions..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <div className="w-full md:w-auto mt-4 md:mt-0">
                        <button
                            className={`w-full md:w-auto pointer-events-auto group relative px-8 py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-xl ${shapes.length > 0 || localTranscript ? 'text-white hover:bg-sky-400 hover:scale-105' : 'text-slate-400 border-slate-300 cursor-not-allowed'}`}
                            disabled={shapes.length === 0 && !localTranscript}
                            onClick={handleGenerate}
                        >
                            <span className="font-orbitron font-bold text-lg tracking-widest">GENERATE</span>

                            {/* Shapes Count Badge */}
                            {shapes.length > 0 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-xs font-bold flex items-center justify-center rounded-full shadow-lg animate-bounce ring-2 ring-white">
                                    {shapes.length}
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HUD;
