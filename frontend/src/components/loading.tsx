import React from 'react';

const LoadingAnimation: React.FC = () => {
  // CSS variables
  const w = 96;
  const h = 112;
  const xspace = w / 2;
  const yspace = h / 4 - 1;
  const speed = '1.5s';

  // Styles
  const styles = {
    tetrominos: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-${w}px, -${h}px)`, // Correct for width and height
    },
    tetromino: {
        width: `96px`,
        height: `112px`,
        position: 'absolute',
        transition: 'all ease .3s',
        background: `url('data:image/svg+xml;utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 684"%3E%3Cpath fill="%23010101" d="M305.7 0L0 170.9v342.3L305.7 684 612 513.2V170.9L305.7 0z"/%3E%3Cpath fill="%23fff" d="M305.7 80.1l-233.6 131 233.6 131 234.2-131-234.2-131"/%3E%3C/svg%3E') no-repeat top center`,
    },
    box1: {
      animation: `tetromino1 ${speed} ease-out infinite`,
    },
    box2: {
      animation: `tetromino2 ${speed} ease-out infinite`,
    },
    box3: {
      animation: `tetromino3 ${speed} ease-out infinite`,
      zIndex: 2,
    },
    box4: {
      animation: `tetromino4 ${speed} ease-out infinite`,
    },
  };

  // Keyframes
  const keyframes = `
    @keyframes tetromino1 {
      0%, 40% { 
        transform: translate(0, 0);
      }
      50% {
        transform: translate(${xspace}px, -${yspace}px);
      }
      60%, 100% {
        transform: translate(${xspace * 2}px, 0);
      }
    }

    @keyframes tetromino2 {
      0%, 20% { 
        transform: translate(${xspace * 2}px, 0px);
      }
      40%, 100% { 
        transform: translate(${xspace * 3}px, ${yspace}px);
      }
    }

    @keyframes tetromino3 {
      0% { 
        transform: translate(${xspace * 3}px, ${yspace}px);
      }
      20%, 60% { 
        transform: translate(${xspace * 2}px, ${yspace * 2}px);
      }
      90%, 100% { 
        transform: translate(${xspace}px, ${yspace}px);
      }
    }

    @keyframes tetromino4 {
      0%, 60% {
        transform: translate(${xspace}px, ${yspace}px);
      }
      90%, 100% { 
        transform: translate(0, 0);
      }
    }
  `;

  return (
    <div className="relative w-full h-screen">
      <style>{keyframes}</style>
      <div style={styles.tetrominos as React.CSSProperties}>
        <div style={{ ...styles.tetromino, ...styles.box1 } as React.CSSProperties} />
        <div style={{ ...styles.tetromino, ...styles.box2 } as React.CSSProperties} />
        <div style={{ ...styles.tetromino, ...styles.box3 } as React.CSSProperties} />
        <div style={{ ...styles.tetromino, ...styles.box4 } as React.CSSProperties} />
      </div>
    </div>
  );
};

export default LoadingAnimation;
