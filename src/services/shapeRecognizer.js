export class ShapeRecognizer {
    /**
     * Analyzes a stroke (array of points) and returns a shape definition
     * @param {Array} stroke - Array of {x, y} points (normalized 0-1)
     * @param {Object} canvasSize - { width, height } for absolute conversion
     */
    recognize(stroke, canvasSize = { width: 1920, height: 1080 }) {
        if (!stroke || stroke.length < 10) return null;

        let minX = Infinity,
            minY = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity;

        stroke.forEach((p) => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });

        const width = Math.abs(maxX - minX);
        const height = Math.abs(maxY - minY);

        if (width < 0.05 && height < 0.05) return null;

        return {
            id: crypto.randomUUID(),
            type: "rectangle",
            bounds: {
                x: minX,
                y: minY,
                w: width,
                h: height,
            },
        };
    }
}

export const shapeRecognizer = new ShapeRecognizer();
