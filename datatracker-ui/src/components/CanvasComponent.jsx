import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Button from './Button';

const CanvasComponent = forwardRef(({ onDrawSubmit, onSaveDrawing, canSave }, ref) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil'); // 'pencil' or 'eraser'
    const [thickness, setThickness] = useState(2);

    useImperativeHandle(ref, () => ({
        loadBlob: (blob) => {
            const canvas = canvasRef.current;
            if (!canvas || !blob) return;

            const ctx = canvas.getContext('2d');
            const imgData = ctx.createImageData(256, 192);
            const data = imgData.data;

            let bytes;
            if (typeof blob === 'string') {
                const binaryString = atob(blob);
                bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
            } else if (blob?.toUint8Array) {
                bytes = blob.toUint8Array();
            } else if (blob instanceof Uint8Array) {
                bytes = blob;
            } else if (Array.isArray(blob)) {
                bytes = new Uint8Array(blob);
            } else {
                bytes = new Uint8Array(blob);
            }

            for (let i = 0; i < bytes.length; i++) {
                const byte = bytes[i];
                for (let j = 0; j < 8; j++) {
                    const pixelIndex = i * 8 + j;
                    if (pixelIndex >= 256 * 192) break;

                    const isBlack = (byte >> (7 - j)) & 1;
                    const color = isBlack ? 0 : 255;

                    data[pixelIndex * 4] = color; // r
                    data[pixelIndex * 4 + 1] = color; // g
                    data[pixelIndex * 4 + 2] = color; // b
                    data[pixelIndex * 4 + 3] = 255;   // a
                }
            }
            ctx.putImageData(imgData, 0, 0);
        }
    }));

    // Initialize canvas with white background
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX = e.clientX;
        let clientY = e.clientY;

        // Support touch events
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : '#000000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    useEffect(() => {
        clearCanvas();
    }, []);

    const getPackedBlob = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const bitArray = new Array(canvas.width * canvas.height);
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const isBlack = brightness < 128;
            bitArray[i / 4] = isBlack ? 1 : 0;
        }

        const packed = new Uint8Array(6144);
        for (let i = 0; i < bitArray.length; i++) {
            if (bitArray[i] === 1) {
                const byteIndex = Math.floor(i / 8);
                const bitInByte = i % 8;
                packed[byteIndex] |= (1 << (7 - bitInByte));
            }
        }
        return Array.from(packed);
    };

    const submitDrawing = () => {
        onDrawSubmit(getPackedBlob());
    };

    const saveDrawing = () => {
        if (onSaveDrawing) onSaveDrawing(getPackedBlob());
    };

    const exportPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `InkToChat_${new Date().getTime()}.png`;
        link.href = dataURL;
        link.click();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <canvas
                ref={canvasRef}
                width={256}
                height={192}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white border-2 border-picto-border touch-none w-[256px] h-[192px] sm:w-[512px] sm:h-[384px]"
                style={{ imageRendering: 'pixelated' }}
            />
            <div className="flex flex-wrap gap-2 justify-center w-full max-w-[512px]">
                <Button onClick={() => setTool('pencil')} disabled={tool === 'pencil'}>Pencil</Button>
                <Button onClick={() => setTool('eraser')} disabled={tool === 'eraser'}>Eraser</Button>
                <div className="flex items-center gap-2 mx-4 text-picto-border font-ds text-lg">
                    Thick:
                    <Button onClick={() => setThickness(2)} disabled={thickness === 2}>S</Button>
                    <Button onClick={() => setThickness(4)} disabled={thickness === 4}>M</Button>
                    <Button onClick={() => setThickness(8)} disabled={thickness === 8}>L</Button>
                </div>
                <Button onClick={clearCanvas}>Clear</Button>
                <div className="mt-2 flex w-full max-w-[512px] gap-2 justify-end">
                    <Button onClick={exportPNG} className="!bg-emerald-500 !text-white">Export PNG</Button>
                    {canSave && (
                        <Button onClick={saveDrawing} className="!bg-blue-500 !text-white text-xs whitespace-nowrap">
                            SAVE TO DATAHUB
                        </Button>
                    )}
                    <Button onClick={submitDrawing}>SEND DRAWING</Button>
                </div>
            </div>
        </div>
    );
});

export default CanvasComponent;
