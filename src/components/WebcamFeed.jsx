import useWebcam from '../hooks/useWebcam';
import { Camera, AlertTriangle } from 'lucide-react';

const WebcamFeed = () => {
    const { videoRef, stream, error } = useWebcam();

    if (error) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-red-500 z-40">
                <AlertTriangle size={48} className="mb-4" />
                <h2 className="text-2xl font-bold mb-2">Camera Access Denied</h2>
                <p className="text-gray-400">Please allow camera access to use Air-Architect.</p>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0">
            {/* Loading State */}
            {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neon-cyan z-10">
                    <Camera className="w-12 h-12 mb-4 animate-bounce" />
                    <p className="font-orbitron tracking-widest text-sm">INITIALIZING VISION...</p>
                </div>
            )}

            {/* Video Feed */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                autoPlay
                playsInline
                muted
            />

            {/* Dark Overlay for UI contrast */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        </div>
    );
};

export default WebcamFeed;
