import { useEffect, useState } from 'react';
import { Cloudy, ArrowRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import GridBackground from './GridBackground.jsx';

const LandingPage = () => {
    const setMode = useAppStore((state) => state.setMode);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-white to-sky-100">
            {/* Interactive Canvas Grid */}
            <GridBackground />

            <div className={`relative z-10 text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Floating cloud */}
                <div className="animate-float mb-8 inline-flex items-center gap-2 px-6 py-2 rounded-full glass-panel text-sky-700 text-sm font-semibold tracking-wide">
                    <Cloudy size={16} className="text-sky-500" />
                </div>

                {/* Main Title */}
                <h1 className="animate-drift text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-sky-600 to-slate-800 font-pixel tracking-tighter mb-8 drop-shadow-sm select-none leading-tight">
                    AIR<br />
                    <span className="text-4xl md:text-8xl text-sky-600">ARCHITECTURE</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-slate-400 mb-5 max-w-2xl mx-auto font-light leading-relaxed animate-float-delayed select-none">
                    Don't write code. <span className="text-sky-600 font-medium">Just wave.</span><br />
                    Design your next landing page in mid-air with voice commands.
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => setMode('PERMISSION')}
                    className="group relative px-10 py-5 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-sky-200 transition-all hover:-translate-y-1 hover:shadow-sky-300 hover:scale-105"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        ENTER STUDIO <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-slate-400 text-xs font-medium tracking-widest uppercase opacity-70">
                Powered by Gemini • MediaPipe • React
            </div>
        </div>
    );
};

export default LandingPage;
