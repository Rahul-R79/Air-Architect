import { create } from "zustand";

const useAppStore = create((set) => ({
    // UI State
    mode: "IDLE", 
    setMode: (mode) => set({ mode }),

    // Camera State
    permissionGranted: false,
    setPermissionGranted: (granted) => set({ permissionGranted: granted }),

    // Hand Tracking State
    handLandmarks: [],
    setHandLandmarks: (landmarks) => set({ handLandmarks: landmarks }),
    isHandDetected: false,
    setIsHandDetected: (detected) => set({ isHandDetected: detected }),

    // Drawing State
    shapes: [],
    selectedShapeId: null,
    addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
    selectShape: (id) => set({ selectedShapeId: id }),
    updateShape: (id, newBounds) =>
        set((state) => ({
            shapes: state.shapes.map((s) =>
                s.id === id ? { ...s, bounds: newBounds } : s,
            ),
        })),
    removeShape: (id) =>
        set((state) => ({
            shapes: state.shapes.filter((s) => s.id !== id),
            selectedShapeId:
                state.selectedShapeId === id ? null : state.selectedShapeId,
        })),
    clearShapes: () => set({ shapes: [] }),
    gestureState: "IDLE", 

    // Voice State
    transcript: "",
    setTranscript: (text) => set({ transcript: text }),
    // Generated Code
    generatedCode: null,
    setGeneratedCode: (code) => set({ generatedCode: code }),
    // Canvas Snapshot Bridge
    getCanvasSnapshot: null,
    setGetCanvasSnapshot: (fn) => set({ getCanvasSnapshot: fn }),
}));

export default useAppStore;
