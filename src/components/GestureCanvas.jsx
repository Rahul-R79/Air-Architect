import { useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { DrawingUtils, HandLandmarker } from "@mediapipe/tasks-vision";
import { handTrackingService } from '../services/handTrackingService';
import { gestureEngine } from '../services/gestureEngine';
import { shapeRecognizer } from '../services/shapeRecognizer';

const GestureCanvas = () => {
    const canvasRef = useRef(null);

    const permissionGranted = useAppStore(state => state.permissionGranted);
    const addShape = useAppStore(state => state.addShape);
    const shapes = useAppStore(state => state.shapes);
    const setHandLandmarks = useAppStore(state => state.setHandLandmarks);

    const currentPath = useRef([]);
    const isPinching = useRef(false);
    const pinchHistory = useRef(0);

    const setGetCanvasSnapshot = useAppStore(state => state.setGetCanvasSnapshot);

    useEffect(() => {
        if (canvasRef.current) {
            setGetCanvasSnapshot(() => {
                return canvasRef.current.toDataURL("image/png");
            });
        }
        return () => setGetCanvasSnapshot(null);
    }, [setGetCanvasSnapshot]);

    useEffect(() => {
        if (!permissionGranted) return;

        const video = document.querySelector('video');
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        const drawingUtils = new DrawingUtils(ctx);
        let animationFrameId;

        const renderLoop = async () => {
            if (video.videoWidth && canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            // 1. Detect Hands
            const results = handTrackingService.detect(video);

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);

            // 2. Process Landmarks
            if (results && results.landmarks && results.landmarks.length > 0) {
                setHandLandmarks(results.landmarks); 

                for (const landmarks of results.landmarks) {
                    drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
                        color: "#0aff0a",
                        lineWidth: 2
                    });
                    drawingUtils.drawLandmarks(landmarks, {
                        color: "#00f3ff",
                        radius: 3
                    });

                    // 3. Detect Pinch
                    const pinchState = gestureEngine.detectPinch(landmarks);
                    const point = {
                        x: pinchState.position.x,
                        y: pinchState.position.y
                    };

                    ctx.beginPath();
                    ctx.arc(point.x * canvas.width, point.y * canvas.height, 8, 0, 2 * Math.PI);
                    ctx.strokeStyle = isPinching.current ? "#ff00ff" : "#00f3ff";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    if (pinchState.isPinching) {
                        pinchHistory.current = Math.min(pinchHistory.current + 1, 5);
                    } else {
                        pinchHistory.current = Math.max(pinchHistory.current - 1, 0);
                    }

                    const STABILITY_THRESHOLD = 3;

                    if (!isPinching.current && pinchHistory.current >= STABILITY_THRESHOLD) {
                        isPinching.current = true;
                        currentPath.current = [];
                    }
                    if (isPinching.current && pinchHistory.current === 0) {
                        isPinching.current = false;

                        if (currentPath.current.length > 5) {
                            const shape = shapeRecognizer.recognize(currentPath.current, { width: canvas.width, height: canvas.height });
                            if (shape) {
                                addShape(shape);
                            }
                        }
                        currentPath.current = [];
                    }

                    if (isPinching.current) {
                        ctx.fillStyle = "#ff00ff";
                        ctx.fill();
                        currentPath.current.push(point);
                    }
                }
            } else {
                setHandLandmarks([]);
            }

            if (isPinching.current && currentPath.current.length > 0) {
                let minX = Infinity, minY = Infinity;
                let maxX = -Infinity, maxY = -Infinity;

                currentPath.current.forEach(p => {
                    if (p.x < minX) minX = p.x;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.y > maxY) maxY = p.y;
                });

                const w = maxX - minX;
                const h = maxY - minY;
                const x = minX;
                const y = minY;

                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 5]);
                ctx.strokeRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height);
                ctx.setLineDash([]);
            }

            // 5. Draw Recognized Shapes
            shapes.forEach((shape, index) => {
                if (shape.type === 'rectangle') {
                    const { x, y, w, h } = shape.bounds;
                    ctx.strokeStyle = "#00f3ff";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x * canvas.width, y * canvas.height, w * canvas.width, h * canvas.height);

                    ctx.scale(-1, 1);
                    ctx.fillStyle = "#00f3ff";
                    ctx.font = "16px Orbitron";
                    const mirroredX = -(x * canvas.width + w * canvas.width);
                    ctx.fillText(`BOX ${index + 1}`, mirroredX, y * canvas.height - 10);
                    ctx.scale(-1, 1);
                }
            });

            ctx.restore();
            animationFrameId = requestAnimationFrame(renderLoop);
        };

        handTrackingService.initialize().then(() => {
            renderLoop();
        });

        return () => cancelAnimationFrame(animationFrameId);
    }, [permissionGranted, addShape, shapes, setHandLandmarks]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-20 pointer-events-none w-full h-full" />;
};

export default GestureCanvas;
