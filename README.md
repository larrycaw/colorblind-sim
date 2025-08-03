# Colorblind Simulator

A modern web application that simulates different types of color vision deficiencies, allowing users to experience how images appear to people with various forms of colorblindness. Features an interactive "Color World Split" with a draggable slider, particle effects, and real-time color transformation.

## Features

- **Interactive Color World Split**: Drag the slider to compare original vs. filtered images in real-time
- **Multiple Colorblind Types**: Simulate Protanopia (red-blind), Deuteranopia (green-blind), and Tritanopia (blue-blind)
- **Image Upload & Demo**: Upload your own images or try the built-in demo with vibrant landscapes
- **Particle Effects**: Animated particles that change color based on the selected colorblind type
- **Main Menu Navigation**: Easy navigation between upload, demo, and simulation modes
- **Modern UI**: Beautiful, responsive design with smooth animations using Framer Motion
- **Real-time Processing**: Instant color transformation using canvas and matrix transformations

## Tech Stack

### Core Frameworks & Libraries
- **React** with **Vite** - Component-based, performant web app skeleton
- **TypeScript** - Type-safe development
- **Framer Motion** - Smooth, hardware-accelerated UI animations
- **TailwindCSS** - Utility-first CSS framework for rapid UI development
- **Canvas API** - Image processing and rendering

### Image Processing
- **Matrix transformations** - Efficient colorblind simulation using 3x3 transformation matrices
- **HTML5 Canvas** - Real-time image manipulation and particle rendering
- **Split slider functionality** - Interactive before/after comparison with precise control

## Getting Started

### Prerequisites
- Node.js (v18.16.0 or higher)
- npm (v9.5.1 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd colorblind-sim
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. **Main Menu**: Start by uploading an image or trying the demo
2. **Choose Colorblind Type**: Select from Protanopia, Deuteranopia, or Tritanopia
3. **Use the Slider**: Drag the slider to compare the original image with the filtered version
4. **Toggle Particles**: Show/hide animated particles that demonstrate color perception
5. **Explore**: Try different images and colorblind types to understand how color vision affects perception

## Understanding Colorblindness

Colorblindness (color vision deficiency) affects approximately 8% of males and 0.5% of females worldwide. It occurs when certain cells in the retina, called cones, are missing or don't work properly. There are three main types of cones, each sensitive to different wavelengths of light:

### Types of Colorblindness

#### **Protanopia (Red-Blind)**
- **What it is**: Missing or non-functioning red cones (L-cones)
- **How it affects vision**: 
  - Red colors appear darker and may be confused with black
  - Difficulty distinguishing between red and green colors
  - Red traffic lights may appear dim or off
  - Red text on green backgrounds is nearly invisible
- **Prevalence**: Affects approximately 1% of males
- **Inheritance**: X-linked recessive (more common in males)

#### **Deuteranopia (Green-Blind)**
- **What it is**: Missing or non-functioning green cones (M-cones)
- **How it affects vision**:
  - Most common type of colorblindness
  - Difficulty distinguishing between red and green colors
  - Green colors may appear gray or brown
  - Red and green traffic lights may look similar
  - Difficulty reading color-coded charts and graphs
- **Prevalence**: Affects approximately 6% of males
- **Inheritance**: X-linked recessive (more common in males)

#### **Tritanopia (Blue-Blind)**
- **What it is**: Missing or non-functioning blue cones (S-cones)
- **How it affects vision**:
  - Difficulty distinguishing between blue and yellow colors
  - Blue colors may appear gray or green
  - Yellow colors may appear light gray or white
  - Difficulty with blue-yellow color combinations
  - May also affect perception of red and green
- **Prevalence**: Very rare, affects less than 1% of the population
- **Inheritance**: Autosomal dominant (affects males and females equally)

### **Monochromacy (Complete Colorblindness)**
- **What it is**: Only one type of cone or no cones at all
- **How it affects vision**:
  - Sees only in shades of gray
  - Extremely rare
  - Often accompanied by other vision problems

### **Colorblindness vs. Normal Vision**

| Aspect | Normal Vision | Colorblind Vision |
|--------|---------------|-------------------|
| **Color Range** | Full spectrum | Limited spectrum |
| **Traffic Lights** | Clear red/green distinction | May appear similar |
| **Color-coded Info** | Easy to read | Difficult to interpret |
| **Art & Design** | Full appreciation | Limited color perception |
| **Daily Tasks** | No color-related issues | May struggle with color-dependent tasks |

### **Real-World Impact**

Colorblindness affects many aspects of daily life:
- **Transportation**: Difficulty with traffic signals and color-coded maps
- **Education**: Problems with color-coded charts, graphs, and educational materials
- **Work**: Challenges in fields requiring color discrimination (electrical work, design, etc.)
- **Technology**: Difficulty with color-coded interfaces and accessibility features
- **Safety**: Problems with color-coded safety systems and warnings

## Technical Implementation

### Color Transformation Matrix
The application uses 3x3 transformation matrices to simulate colorblindness:

```typescript
// Deuteranopia matrix
[
  [0.625, 0.375, 0],
  [0.7, 0.3, 0],
  [0, 0.3, 0.7]
]

// Protanopia matrix
[
  [0.567, 0.433, 0],
  [0.558, 0.442, 0],
  [0, 0.242, 0.758]
]

// Tritanopia matrix
[
  [0.95, 0.05, 0],
  [0, 0.433, 0.567],
  [0, 0.475, 0.525]
]
```

### Canvas Processing
- Images are loaded into HTML5 Canvas
- Pixel data is processed using transformation matrices
- Real-time rendering with split slider functionality
- Particle system demonstrates color perception differences

### Particle System
- Animated particles change color based on selected colorblind type
- Particles are constrained to image bounds
- Demonstrates how different colors appear to people with colorblindness 