export class GestureEngine {
    constructor() {
        this.PINCH_THRESHOLD = 0.06;
    }

    /**
     * Calculates Euclidean distance between two 2D points
     */
    distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    /**
     * Detects if the hand is currently pinching
     * @param {Object} landmarks - MediaPipe hand landmarks
     * @returns {Object} { isPinching: boolean, position: {x, y} }
     */
    detectPinch(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return { isPinching: false, position: null };
        }

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const dist = this.distance(thumbTip, indexTip);

        const isPinching = dist < this.PINCH_THRESHOLD;

        // Midpoint between thumb and index for drawing cursor
        const position = {
            x: (thumbTip.x + indexTip.x) / 2,
            y: (thumbTip.y + indexTip.y) / 2,
        };

        return { isPinching, position };
    }
}

export const gestureEngine = new GestureEngine();
