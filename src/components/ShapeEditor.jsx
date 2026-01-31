import { useRef, useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { Trash2 } from 'lucide-react';

const ShapeEditor = () => {
    const shapes = useAppStore(state => state.shapes);
    const selectedShapeId = useAppStore(state => state.selectedShapeId);
    const selectShape = useAppStore(state => state.selectShape);
    const updateShape = useAppStore(state => state.updateShape);
    const removeShape = useAppStore(state => state.removeShape);

    // For handling drag
    const [dragging, setDragging] = useState(null);
    const editorRef = useRef(null);

    const handleMouseDown = (e, shape, type, handle = null) => {
        e.stopPropagation();
        selectShape(shape.id);
        setDragging({
            type,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            initialBounds: { ...shape.bounds }
        });
    };

    const handleMouseMove = (e) => {
        if (!dragging || !selectedShapeId) return;

        const shape = shapes.find(s => s.id === selectedShapeId);
        if (!shape) return;

        const container = editorRef.current.getBoundingClientRect();

        const dx = -(e.clientX - dragging.startX) / container.width;
        const dy = (e.clientY - dragging.startY) / container.height;

        let newBounds = { ...dragging.initialBounds };

        if (dragging.type === 'move') {
            newBounds.x += dx;
            newBounds.y += dy;
        } else if (dragging.type === 'resize') {
            if (dragging.handle === 'se') {
                newBounds.w += dx;
                newBounds.h += dy;
            } else if (dragging.handle === 'nw') {
                newBounds.x += dx;
                newBounds.y += dy;
                newBounds.w -= dx;
                newBounds.h -= dy;
            }
        }

        updateShape(selectedShapeId, newBounds);
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]);

    return (
        <div
            ref={editorRef}
            className="absolute inset-0 z-30 pointer-events-auto transform -scale-x-100"
            onMouseDown={(e) => {
                if (e.target === editorRef.current) {
                    selectShape(null);
                }
            }}
        >
            {shapes.map(shape => {
                const isSelected = shape.id === selectedShapeId;

                return (
                    <div
                        key={shape.id}
                        className={`absolute pointer-events-auto group ${isSelected ? 'z-40' : 'z-30'} transform -scale-x-100`} // Un-mirror content so controls/text aren't backwards
                        style={{
                            left: `${shape.bounds.x * 100}%`,
                            top: `${shape.bounds.y * 100}%`,
                            width: `${shape.bounds.w * 100}%`,
                            height: `${shape.bounds.h * 100}%`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, shape, 'move')}
                    >
                        {/* Hover/Selection Border */}
                        <div className={`absolute inset-0 border-2 transition-all ${isSelected ? 'border-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.5)]' : 'border-transparent group-hover:border-white/30'}`} />

                        {isSelected && (
                            <>
                                <div
                                    className="absolute -top-2 -left-2 w-6 h-6 bg-neon-pink rounded-full cursor-nw-resize flex items-center justify-center hover:scale-110 transition-transform"
                                    onMouseDown={(e) => handleMouseDown(e, shape, 'resize', 'nw')}
                                />
                                <div
                                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-neon-pink rounded-full cursor-se-resize flex items-center justify-center hover:scale-110 transition-transform"
                                    onMouseDown={(e) => handleMouseDown(e, shape, 'resize', 'se')}
                                />

                                {/* Delete Button */}
                                <button
                                    className="absolute -top-10 right-0 bg-red-500/90 text-white p-2 rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg backdrop-blur-sm"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        removeShape(shape.id);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ShapeEditor;
