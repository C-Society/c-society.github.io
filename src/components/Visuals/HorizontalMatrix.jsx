import React, { useEffect, useRef } from 'react';

const HorizontalMatrix = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const snippets = [
      '0', '1', '10', '01', '0001', '1110', '1010', '0101', '11001', '00110', '101010', '010101'
    ];

    const fontSize = 14;
    const rowHeight = 24;
    
    // Calculate how many rows we can fit
    const rows = Math.floor(canvas.height / rowHeight);
    
    // Initialize streams
    const streams = [];
    for (let i = 0; i < rows; i++) {
        streams.push({
            x: Math.random() * -canvas.width, // Start off-screen left
            y: i * rowHeight + fontSize,
            speed: 0.5 + Math.random() * 2,
            text: snippets[Math.floor(Math.random() * snippets.length)],
            opacity: 0.1 + Math.random() * 0.4
        });
    }

    const draw = () => {
      // Clear with very low opacity for trailing effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px "Fira Code", monospace`;

      streams.forEach((stream) => {
        ctx.fillStyle = `rgba(129, 140, 248, ${stream.opacity})`; // Indigo theme
        ctx.fillText(stream.text, stream.x, stream.y);

        // Update position (Left to Right)
        stream.x += stream.speed;

        // If off-screen, reset to left
        if (stream.x > canvas.width) {
          stream.x = -ctx.measureText(stream.text).width - 50;
          stream.text = snippets[Math.floor(Math.random() * snippets.length)];
          stream.speed = 0.5 + Math.random() * 2;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        opacity: 0.3, // Subtle background
        pointerEvents: 'none'
      }}
    />
  );
};

export default HorizontalMatrix;
