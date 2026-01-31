import { useEffect, useRef } from 'react';

const GridBackground = () => {
    const canvasRef = useRef(null);
    const gridRef = useRef([]); 
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const blockSize = 100;
        const fadeSpeed = 0.02; 

        const colors = [
            '#38bdf8', 
            '#0ea5e9', 
            '#bae6fd', 
            '#e0f2fe', 
            '#0f172a', 
        ];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'; 
            ctx.lineWidth = 1;

            for (let x = 0; x <= canvas.width; x += blockSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }

            for (let y = 0; y <= canvas.height; y += blockSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();

            gridRef.current.forEach((cell, index) => {
                ctx.fillStyle = cell.color;
                ctx.globalAlpha = cell.opacity;
                ctx.fillRect(cell.x, cell.y, blockSize, blockSize);

                cell.opacity -= fadeSpeed;

                if (cell.opacity <= 0) {
                    gridRef.current.splice(index, 1);
                }
            });
            ctx.globalAlpha = 1.0; 
        };

        const animate = () => {
            drawGrid();
            animationRef.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor(x / blockSize) * blockSize;
            const row = Math.floor(y / blockSize) * blockSize;

            const existingCell = gridRef.current.find(c => c.x === col && c.y === row);

            if (!existingCell) {
                gridRef.current.push({
                    x: col,
                    y: row,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    opacity: 1.0
                });
            } else {
                existingCell.opacity = 1.0;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 bg-transparent pointer-events-none"
        />
    );
};

export default GridBackground;
