// Shader Preprocessor
// Handles #pragma glslify imports in GLSL shaders

// Import all library modules
import randomGlsl from '../libs/random.glsl?raw';
import simplexGlsl from '../libs/simplex.glsl?raw';
import perlinGlsl from '../libs/perlin.glsl?raw';
import valueNoiseGlsl from '../libs/value-noise.glsl?raw';
import fbmGlsl from '../libs/fbm.glsl?raw';
import blendingGlsl from '../libs/blending.glsl?raw';
import colorGlsl from '../libs/color.glsl?raw';
import mathGlsl from '../libs/math.glsl?raw';
import sdfGlsl from '../libs/sdf.glsl?raw';
import curlNoiseGlsl from '../libs/curl-noise.glsl?raw';

// Library map
const libraries = {
  'random': randomGlsl,
  'simplex': simplexGlsl,
  'perlin': perlinGlsl,
  'value-noise': valueNoiseGlsl,
  'fbm': fbmGlsl,
  'blending': blendingGlsl,
  'color': colorGlsl,
  'math': mathGlsl,
  'sdf': sdfGlsl,
  'curl-noise': curlNoiseGlsl
};

export class ShaderPreprocessor {
  constructor() {
    this.includes = new Set();
    this.processedLibs = new Map();
    // Define library dependencies
    this.dependencies = {
      'curl-noise': ['simplex'],
      'sdf': ['math']
    };
  }

  process(shaderSource) {
    this.includes.clear();
    this.processedLibs.clear();

    // Extract precision declaration from source if present
    const precisionMatch = shaderSource.match(/precision\s+(highp|mediump|lowp)\s+float\s*;/);
    const hasPrecision = precisionMatch !== null;

    // Remove precision from source to avoid duplicates
    let processed = shaderSource.replace(/precision\s+(highp|mediump|lowp)\s+float\s*;\s*/g, '');

    // Process the shader recursively
    processed = this.processIncludes(processed);

    // Build the final shader
    let finalShader = '';

    // Add precision at the very top (use highp by default if not specified)
    if (hasPrecision || this.processedLibs.size > 0) {
      const precision = precisionMatch ? precisionMatch[1] : 'highp';
      finalShader += `precision ${precision} float;\n\n`;
    }

    // Add all included libraries
    for (const [name, content] of this.processedLibs) {
      finalShader += `// ===== Library: ${name} =====\n${content}\n\n`;
    }

    // Add the processed main shader code
    finalShader += processed;

    return finalShader;
  }

  processIncludes(source) {
    // Handle #pragma glslify: import() syntax
    const importRegex = /#pragma\s+glslify:\s*import\(['"]([^'"]+)['"]\)/g;

    source = source.replace(importRegex, (match, libPath) => {
      const libName = this.extractLibName(libPath);

      this.includeLibrary(libName);

      return ''; // Remove the import line
    });

    // Handle simpler #include syntax
    const includeRegex = /#include\s+["']([^"']+)["']/g;

    source = source.replace(includeRegex, (match, libPath) => {
      const libName = this.extractLibName(libPath);

      this.includeLibrary(libName);

      return ''; // Remove the include line
    });

    return source;
  }

  includeLibrary(libName) {
    if (this.includes.has(libName)) return;

    // First, include any dependencies
    if (this.dependencies[libName]) {
      for (const dep of this.dependencies[libName]) {
        this.includeLibrary(dep);
      }
    }

    this.includes.add(libName);

    if (libraries[libName]) {
      // Process the library for nested imports
      const processedLib = this.processLibraryIncludes(libraries[libName]);
      this.processedLibs.set(libName, processedLib);
    } else {
      console.warn(`Library not found: ${libName}`);
    }
  }

  processLibraryIncludes(libSource) {
    // Process nested includes in libraries
    const requireRegex = /#pragma\s+glslify:\s*\w+\s*=\s*require\(([^)]+)\)/g;

    return libSource.replace(requireRegex, (match, requirePath) => {
      const libName = this.extractLibName(requirePath);

      if (!this.includes.has(libName)) {
        this.includes.add(libName);

        if (libraries[libName]) {
          const processedLib = this.processLibraryIncludes(libraries[libName]);
          this.processedLibs.set(libName, processedLib);
        }
      }

      return ''; // Remove the require line as the content will be included
    });
  }

  extractLibName(path) {
    // Extract library name from path
    // e.g., "./random.glsl" -> "random"
    // e.g., "libs/simplex" -> "simplex"
    const match = path.match(/([^/\\]+?)(?:\.glsl)?$/);
    return match ? match[1] : path;
  }
}