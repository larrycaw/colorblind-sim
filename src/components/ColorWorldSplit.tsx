import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ParticleSystem from './ParticleSystem';
import './ColorWorldSplit.css';

interface ColorblindType {
  id: string;
  name: string;
  matrix: number[][];
  description: string;
}

const colorblindTypes: ColorblindType[] = [
  {
    id: 'deuteranopia',
    name: 'Deuteranopia',
    description:
      'Green-blind: Most common type. Difficulty distinguishing red and green colors. Green appears gray/brown.',
    matrix: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
  },
  {
    id: 'protanopia',
    name: 'Protanopia',
    description:
      'Red-blind: Red colors appear darker. Difficulty with red-green distinction. Red may look black.',
    matrix: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
  },
  {
    id: 'tritanopia',
    name: 'Tritanopia',
    description:
      'Blue-blind: Very rare. Difficulty distinguishing blue and yellow. Blue appears gray/green.',
    matrix: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
  },
];

const ColorWorldSplit: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ColorblindType>(
    colorblindTypes[0]
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true); // Start on main menu
  const [sliderPosition, setSliderPosition] = useState(50);
  const [canvasBounds, setCanvasBounds] = useState({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
  });
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setUploadedImage(e.target?.result as string);
        setShowMainMenu(false); // Exit main menu when uploading image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDemoImage = () => {
    // Create a demo image by generating a data URL from a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Create a vibrant landscape
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FF6B6B'); // Vibrant pink
    gradient.addColorStop(0.3, '#4ECDC4'); // Turquoise
    gradient.addColorStop(0.6, '#45B7D1'); // Blue
    gradient.addColorStop(1, '#96CEB4'); // Green

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add sun
    ctx.beginPath();
    ctx.arc(700, 100, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();

    // Add mountains with vibrant colors
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(200, 200);
    ctx.lineTo(400, 300);
    ctx.lineTo(600, 150);
    ctx.lineTo(800, 250);
    ctx.lineTo(800, 600);
    ctx.closePath();
    ctx.fillStyle = '#6A5ACD'; // Slate blue
    ctx.fill();

    // Add more mountains with different colors
    ctx.beginPath();
    ctx.moveTo(0, 450);
    ctx.lineTo(150, 250);
    ctx.lineTo(300, 350);
    ctx.lineTo(500, 200);
    ctx.lineTo(800, 300);
    ctx.lineTo(800, 600);
    ctx.closePath();
    ctx.fillStyle = '#9370DB'; // Medium purple
    ctx.fill();

    // Add trees with autumn colors
    for (let i = 0; i < 12; i++) {
      const x = 50 + i * 70;
      const y = 450 + Math.sin(i) * 20;

      // Tree trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 5, y, 10, 60);

      // Tree leaves with vibrant colors
      ctx.beginPath();
      ctx.arc(x, y - 20, 30, 0, 2 * Math.PI);
      const colors = ['#FF6347', '#FFD700', '#32CD32', '#FF4500', '#FF69B4'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
    }

    // Add flowers with bright colors
    for (let i = 0; i < 20; i++) {
      const x = 100 + i * 40;
      const y = 520 + Math.sin(i * 0.5) * 30;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      const colors = [
        '#FF0000',
        '#FF69B4',
        '#FFD700',
        '#00FF00',
        '#FF4500',
        '#FF1493',
      ];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
    }

    // Add clouds
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 150;
      const y = 80 + Math.sin(i) * 20;

      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.arc(x + 25, y, 20, 0, 2 * Math.PI);
      ctx.arc(x + 50, y, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }

    // Add a lake reflection
    ctx.fillStyle = 'rgba(70, 130, 180, 0.6)';
    ctx.fillRect(0, 550, canvas.width, 50);

    // Convert canvas to data URL and set as uploaded image
    const dataURL = canvas.toDataURL('image/png');
    setUploadedImage(dataURL);
    setShowMainMenu(false); // Exit main menu when starting demo
  };

  const handleMainMenu = () => {
    setShowMainMenu(true);
    setUploadedImage(null);
    setSliderPosition(50); // Reset slider position
    setCanvasBounds({ left: 0, width: 0, top: 0, height: 0 }); // Reset canvas bounds
  };

  const applyColorblindFilter = useCallback(
    (imageData: ImageData, matrix: number[][]) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
        data[i + 1] = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
        data[i + 2] = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];
      }
      return imageData;
    },
    []
  );

  const renderImage = useCallback(() => {
    if (!uploadedImage || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Get device pixel ratio for high-DPI support
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Calculate canvas size to maintain aspect ratio with better quality
      const containerRect = container.getBoundingClientRect();
      const containerAspect = containerRect.width / containerRect.height;
      const imageAspect = img.width / img.height;

      // Use a larger size factor for better quality, especially on mobile
      const sizeFactor = window.innerWidth <= 768 ? 0.95 : 0.9; // Larger factor on mobile
      let canvasWidth, canvasHeight;
      
      if (imageAspect > containerAspect) {
        // Image is wider than container
        canvasWidth = containerRect.width * sizeFactor;
        canvasHeight = (containerRect.width * sizeFactor) / imageAspect;
      } else {
        // Image is taller than container
        canvasHeight = containerRect.height * sizeFactor;
        canvasWidth = containerRect.height * sizeFactor * imageAspect;
      }

      // Set canvas dimensions with high-DPI support
      canvas.width = canvasWidth * devicePixelRatio;
      canvas.height = canvasHeight * devicePixelRatio;
      
      // Scale the context to account for device pixel ratio
      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      // Set the CSS size to maintain the visual size
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      // Update canvas bounds for slider positioning
      const canvasRect = canvas.getBoundingClientRect();
      setCanvasBounds({
        left: canvasRect.left,
        width: canvasRect.width,
        top: canvasRect.top,
        height: canvasRect.height,
      });

      // Force a small delay to ensure DOM is updated before calculating bounds
      setTimeout(() => {
        if (canvasRef.current) {
          const updatedRect = canvasRef.current.getBoundingClientRect();
          setCanvasBounds({
            left: updatedRect.left,
            width: updatedRect.width,
            top: updatedRect.top,
            height: updatedRect.height,
          });
        }
      }, 0);

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Calculate split position based on slider percentage
      const splitX = Math.round((canvasWidth * sliderPosition) / 100);

      // Ensure we have valid dimensions
      if (splitX <= 0) {
        // If slider is at 0%, show only filtered image
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        const imageData = ctx.getImageData(0, 0, canvasWidth * devicePixelRatio, canvasHeight * devicePixelRatio);
        const filteredData = applyColorblindFilter(
          imageData,
          selectedType.matrix
        );
        ctx.putImageData(filteredData, 0, 0);
        return;
      }

      if (splitX >= canvasWidth) {
        // If slider is at 100%, show only original image
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        return;
      }

      // Draw original image on left side
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, canvasHeight);
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();

      // Draw filtered image on right side
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, canvasWidth - splitX, canvasHeight);
      ctx.clip();

      // Apply colorblind filter to the right side only
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      const rightWidth = canvasWidth - splitX;
      if (rightWidth > 0) {
        const imageData = ctx.getImageData(
          splitX * devicePixelRatio,
          0,
          rightWidth * devicePixelRatio,
          canvasHeight * devicePixelRatio
        );
        const filteredData = applyColorblindFilter(
          imageData,
          selectedType.matrix
        );
        ctx.putImageData(filteredData, splitX * devicePixelRatio, 0);
      }
      ctx.restore();
    };
    img.src = uploadedImage;
  }, [uploadedImage, selectedType, sliderPosition, applyColorblindFilter]);

  // Re-render when slider moves
  useEffect(() => {
    renderImage();
  }, [renderImage]);

  // Update canvas bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        setCanvasBounds({
          left: canvasRect.left,
          width: canvasRect.width,
          top: canvasRect.top,
          height: canvasRect.height,
        });
        
        // Force a re-render after bounds update
        setTimeout(() => {
          renderImage();
        }, 0);
      }
    };

    // Initial bounds update
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [uploadedImage, renderImage]); // Re-run when image changes or renderImage changes

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Add touch move and end listeners to document
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !canvasBounds.width) return;
    e.preventDefault();
    e.stopPropagation();

    // Only handle single touch events
    if (e.touches.length !== 1) return;

    // Get the first touch point
    const touch = e.touches[0];
    const x = touch.clientX - canvasBounds.left;
    const percentage = Math.max(
      0,
      Math.min(100, (x / canvasBounds.width) * 100)
    );
    setSliderPosition(percentage);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
  };

  // Add global touch move handler for better responsiveness
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && canvasBounds.width) {
        e.preventDefault();
        e.stopPropagation();
        
        const touch = e.touches[0];
        const x = touch.clientX - canvasBounds.left;
        const percentage = Math.max(
          0,
          Math.min(100, (x / canvasBounds.width) * 100)
        );
        setSliderPosition(percentage);
      }
    };

    if (isDragging) {
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    }

    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isDragging, canvasBounds]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !canvasBounds.width) return;

    // Calculate position relative to the actual canvas
    const x = e.clientX - canvasBounds.left;
    const percentage = Math.max(
      0,
      Math.min(100, (x / canvasBounds.width) * 100)
    );
    setSliderPosition(percentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!canvasBounds.width) return;

    const x = e.clientX - canvasBounds.left;
    const percentage = Math.max(
      0,
      Math.min(100, (x / canvasBounds.width) * 100)
    );
    setSliderPosition(percentage);
  };

  const handleContainerTouch = (e: React.TouchEvent) => {
    if (!canvasBounds.width) return;
    e.preventDefault();
    e.stopPropagation();

    // Only handle single touch events
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const x = touch.clientX - canvasBounds.left;
    const percentage = Math.max(
      0,
      Math.min(100, (x / canvasBounds.width) * 100)
    );
    setSliderPosition(percentage);
  };

  // Add global mouse move handler for better responsiveness
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && canvasBounds.width) {
        const x = e.clientX - canvasBounds.left;
        const percentage = Math.max(
          0,
          Math.min(100, (x / canvasBounds.width) * 100)
        );
        setSliderPosition(percentage);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, canvasBounds]);

  const handleTypeChange = (type: ColorblindType) => {
    setSelectedType(type);
  };

  const handleTooltipShow = (text: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      x: rect.left - 15, // Position to the left of the button
      y: rect.top + rect.height / 2, // Center vertically with the button
    });
  };

  const handleTooltipHide = () => {
    setTooltip(null);
  };

  if (showMainMenu) {
    return (
      <div className='color-world-split'>
        <div className='upload-placeholder'>
          <div className='upload-content'>
            <h2>Color World Split</h2>
            <p>
              Upload a vibrant landscape image to experience the colorblind
              simulation
            </p>
            <div className='upload-buttons'>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                id='world-upload'
                className='file-input'
              />
              <label htmlFor='world-upload' className='upload-button'>
                Choose Image
              </label>
              <button onClick={handleDemoImage} className='demo-button'>
                Try Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='color-world-split'>
      <div className='main-content-wrapper'>
        {/* Full-screen canvas container */}
        <div
          ref={containerRef}
          className='canvas-container'
          onClick={handleContainerClick}
          onTouchStart={handleContainerTouch}
          onTouchMove={(e) => e.preventDefault()}
          onTouchEnd={(e) => e.preventDefault()}
        >
          {uploadedImage ? (
            <>
              <canvas ref={canvasRef} className='main-canvas' />

              {/* Interactive particles */}
              <ParticleSystem
                width={canvasBounds.width}
                height={canvasBounds.height}
                particleCount={24}
                colorblindType={selectedType.id as any}
                visible={showParticles}
                offsetX={canvasBounds.left}
                offsetY={canvasBounds.top}
              />

              {/* Draggable slider */}
              <div
                ref={sliderRef}
                className='slider-handle'
                style={{
                  left: `${canvasBounds.left + (canvasBounds.width * sliderPosition) / 100}px`,
                  transform: 'translateX(-50%)',
                  position: 'fixed',
                  top: `${canvasBounds.top}px`,
                  height: `${canvasBounds.height}px`,
                  zIndex: 20,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className='slider-line' />
                <div className='slider-grip' />
                {/* Invisible touch area for better mobile interaction */}
                <div 
                  className='slider-touch-area'
                  style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '0',
                    width: '40px',
                    height: '100%',
                    zIndex: 25,
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                />
              </div>

              {/* Split indicator */}
              <div className='split-indicator'>
                <div className='indicator-left'>Normal Vision</div>
                <div className='indicator-right'>{selectedType.name}</div>
              </div>
            </>
          ) : null}
        </div>

        {/* Controls overlay - only show when not on main menu */}
        {!showMainMenu && (
          <div className='controls-overlay'>
            <div className='control-panel'>
              <div className='type-selector'>
                <h3>Colorblind Type</h3>
                <div className='type-buttons'>
                  {colorblindTypes.map(type => (
                    <motion.button
                      key={type.id}
                      onClick={() => handleTypeChange(type)}
                      className={`type-button ${selectedType.id === type.id ? 'active' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={e => handleTooltipShow(type.description, e)}
                      onMouseLeave={handleTooltipHide}
                    >
                      {type.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className='particle-controls'>
                <h3>Particles</h3>
                <motion.button
                  onClick={() => setShowParticles(!showParticles)}
                  className={`particle-toggle ${showParticles ? 'active' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showParticles ? 'Hide' : 'Show'} Particles
                </motion.button>
              </div>

              {uploadedImage && (
                <>
                  <div className='upload-section'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      id='change-image'
                      className='file-input'
                    />
                    <label htmlFor='change-image' className='change-button'>
                      Change Image
                    </label>
                  </div>

                  <div className='menu-section'>
                    <motion.button
                      onClick={handleMainMenu}
                      className='menu-button'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Main Menu
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className='custom-tooltip'
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-100%) translateY(-50%)',
          }}
        >
          <div className='tooltip-content'>{tooltip.text}</div>
          <div className='tooltip-arrow'></div>
        </div>
      )}
    </div>
  );
};

export default ColorWorldSplit;
