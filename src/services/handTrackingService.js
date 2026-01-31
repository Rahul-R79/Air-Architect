import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

class HandTrackingService {
    constructor() {
        this.handLandmarker = null;
        this.isRunning = false;
    }

    async initialize() {
        if (this.handLandmarker) return;

        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
            );

            this.handLandmarker = await HandLandmarker.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    numHands: 2,
                    minHandDetectionConfidence: 0.7,
                    minHandPresenceConfidence: 0.7,
                    minTrackingConfidence: 0.7,
                },
            );
        } catch (error) {
            console.error("Failed to initialize HandTrackingService:", error);
            throw error;
        }
    }

    detect(videoElement) {
        if (!this.handLandmarker || !videoElement) return null;

        try {
            if (videoElement.readyState < 2) return null;

            const startTimeMs = performance.now();
            const results = this.handLandmarker.detectForVideo(
                videoElement,
                startTimeMs,
            );
            return results;
        } catch (error) {
            console.error("Error in detection loop:", error);
            return null;
        }
    }
}

export const handTrackingService = new HandTrackingService();
