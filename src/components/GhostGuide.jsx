import useAppStore from '../store/useAppStore';
import { Hand } from 'lucide-react';

const GhostGuide = () => {
    const shapes = useAppStore(state => state.shapes);
    if (shapes.length > 0) return null;

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-50 animate-pulse">
            <div className="w-64 h-40 flex items-center justify-center relative">
                <div className="text-center">
                    <Hand className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-white font-orbitron text-sm">PINCH TO DRAW</p>
                </div>
            </div>
        </div>
    );
};

export default GhostGuide;
