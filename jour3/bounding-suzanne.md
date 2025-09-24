# Bouncing Suzanne Implementation Plan

## Concept
Create a floating Suzanne mesh that moves vertically with a sine wave, where vertices follow the movement with a delay, creating a soft-body deformation similar to a bouncing ball or jelly effect.

## Core Mechanics

### 1. Main Floating Motion
- **Base Y-axis oscillation**: Use `sin(uTime * frequency)` for primary vertical movement
- **Amplitude control**: Add `uFloatAmplitude` uniform to control bounce height
- **Frequency control**: Add `uFloatSpeed` uniform to control oscillation speed
- **Base formula**: `baseY = sin(uTime * uFloatSpeed) * uFloatAmplitude`

### 2. Vertex Deformation System

#### A. Delay-based Following
Each vertex follows the main motion with a delay based on its position:
- **Vertical delay**: Lower vertices lag behind upper vertices (stretching effect)
- **Radial delay**: Outer vertices lag behind center vertices (wobble effect)
- **Delay calculation**:
  ```glsl
  float verticalDelay = (position.y - uMinY) / (uMaxY - uMinY) * uDelayFactor;
  float radialDelay = length(position.xz) * uRadialDelayFactor;
  float totalDelay = verticalDelay + radialDelay;
  ```

#### B. Squash and Stretch
Implement momentum-based deformation:
- **Velocity calculation**: Track motion direction and speed
- **Compression on downward motion**: Squash in Y, expand in XZ
- **Extension on upward motion**: Stretch in Y, contract in XZ
- **Formula**:
  ```glsl
  float velocity = cos(uTime * uFloatSpeed) * uFloatAmplitude;
  float squashFactor = 1.0 + velocity * uSquashIntensity;
  position.y *= squashFactor;
  position.xz *= 1.0 / sqrt(squashFactor); // Volume preservation
  ```

### 3. Secondary Motion Effects

#### A. Wobble Effect
Add oscillation to vertices based on their height:
- **Phase offset**: Each vertex layer oscillates with different phase
- **Amplitude variation**: Stronger wobble at extremities
- **Implementation**:
  ```glsl
  float wobblePhase = position.y * uWobbleFrequency;
  float wobble = sin(uTime * uWobbleSpeed + wobblePhase) * uWobbleAmount;
  position.xz += normalize(position.xz) * wobble * (1.0 - abs(position.y) / uMaxY);
  ```

#### B. Trailing Effect
Vertices "remember" previous positions:
- **History buffer**: Store previous frame positions (simplified with math)
- **Blend factor**: Mix current and previous positions
- **Damping**: Gradually reduce trailing over time

### 4. Volume Preservation
Maintain mesh volume during deformation:
- **Conservation law**: When compressed in Y, expand in XZ
- **Smooth transitions**: Use easing functions for natural motion
- **Local preservation**: Apply per-vertex based on deformation amount

## Implementation Steps

### Step 1: Basic Floating
1. Add `uFloatAmplitude` and `uFloatSpeed` uniforms
2. Apply sine-based Y offset to entire mesh
3. Test with simple vertical motion

### Step 2: Vertex Delay System
1. Add `uDelayFactor` and `uRadialDelayFactor` uniforms
2. Calculate per-vertex delay based on position
3. Apply delayed motion to each vertex: `sin(uTime * uFloatSpeed - totalDelay)`

### Step 3: Squash and Stretch
1. Add `uSquashIntensity` uniform
2. Calculate velocity from derivative of sine wave
3. Apply deformation with volume preservation

### Step 4: Secondary Effects
1. Add wobble uniforms (`uWobbleSpeed`, `uWobbleAmount`, `uWobbleFrequency`)
2. Implement phase-based wobbling
3. Add trailing/damping for smoother motion

### Step 5: Fine-tuning
1. Add easing functions for smoother transitions
2. Implement bounds checking to prevent excessive deformation
3. Add control for effect intensity based on reveal progress

## Uniforms to Add
```glsl
uniform float uFloatAmplitude;    // Main bounce height (0.5 - 2.0)
uniform float uFloatSpeed;        // Oscillation speed (0.5 - 3.0)
uniform float uDelayFactor;       // Vertex follow delay (0.1 - 1.0)
uniform float uRadialDelayFactor; // Radial delay factor (0.0 - 0.5)
uniform float uSquashIntensity;   // Squash/stretch strength (0.1 - 0.5)
uniform float uWobbleSpeed;       // Secondary wobble speed (2.0 - 8.0)
uniform float uWobbleAmount;      // Wobble amplitude (0.0 - 0.3)
uniform float uWobbleFrequency;   // Wobble frequency multiplier (0.5 - 2.0)
```

## Visual Goals
- **Natural motion**: Smooth, organic movement like a floating jellyfish or bouncing ball
- **Coherent deformation**: All vertices move in harmony, no breaking or tearing
- **Readable effect**: Clear squash/stretch that enhances the floating sensation
- **Performance**: Efficient calculations, no complex physics simulation

## Integration with Existing Effects
- Maintain compatibility with current twist effect
- Apply floating after twist transformation
- Preserve reveal animation functionality
- Keep normal calculations accurate for lighting

## Testing Scenarios
1. **Low amplitude, slow speed**: Gentle floating
2. **High amplitude, fast speed**: Energetic bouncing
3. **High delay factor**: Extreme jelly effect
4. **Zero delay**: Rigid body floating
5. **Combined with twist**: Ensure effects complement each other