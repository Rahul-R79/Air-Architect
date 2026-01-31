import { useState, useEffect, useRef } from "react";
import useAppStore from "../store/useAppStore";

const useWebcam = () => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const setPermissionGranted = useAppStore(
        (state) => state.setPermissionGranted,
    );

    useEffect(() => {
        const startWebcam = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        facingMode: "user",
                    },
                    audio: false,
                });

                setStream(mediaStream);
                setPermissionGranted(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                    };
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
                setError(err);
                setPermissionGranted(false);
            }
        };

        startWebcam();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [setPermissionGranted]);

    return { videoRef, stream, error };
};

export default useWebcam;
