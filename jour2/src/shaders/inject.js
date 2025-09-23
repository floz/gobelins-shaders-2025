import * as THREE from 'three';

export function patchPhysicalMaterial(material, uniforms) {
    material.userData.uniforms = uniforms;

    material.onBeforeCompile = (shader) => {
        // 1. Add all uniforms
        Object.keys(uniforms).forEach(key => {
            shader.uniforms[key] = uniforms[key];
        });

        // 2. Add custom varying for UV (always available)
        // Add after uv_pars_vertex to have our own UV varying
        shader.vertexShader = shader.vertexShader.replace(
            '#include <uv_pars_vertex>',
            `#include <uv_pars_vertex>
            varying vec2 vCustomUv;`
        );

        // Set our custom UV in vertex shader
        shader.vertexShader = shader.vertexShader.replace(
            '#include <uv_vertex>',
            `#include <uv_vertex>
            vCustomUv = uv;`
        );

        // 3. Add custom functions to vertex shader
        const vertexHeader = `
            uniform float uTwist;
            uniform float uDispAmp;
            uniform float uTime;

            float hash(vec3 p) {
                return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
            }

            mat2 rotate2D(float angle) {
                float s = sin(angle);
                float c = cos(angle);
                return mat2(c, -s, s, c);
            }
        `;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
            ${vertexHeader}`
        );

        // 4. Replace the transformation in begin_vertex
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            vec3 transformed = vec3( position );

            // Apply twist deformation
            float twistAngle = uTwist * transformed.y * 3.14159;
            mat2 rot = rotate2D(twistAngle);
            transformed.xz = rot * transformed.xz;

            // Apply displacement based on noise
            float noiseValue = hash(transformed * 3.0 + vec3(uTime * 0.2));
            transformed += normal * (noiseValue - 0.5) * 2.0 * uDispAmp;
            `
        );

        // 5. Add custom varying to fragment shader
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <uv_pars_fragment>',
            `#include <uv_pars_fragment>
            varying vec2 vCustomUv;`
        );

        // 6. Add custom functions to fragment shader
        const fragmentHeader = `
            uniform float uThreshold;
            uniform bool uUseTextures;
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform sampler2D uMapA;
            uniform sampler2D uMapB;

            float edge(float x, float t) {
                return smoothstep(t - 0.02, t + 0.02, x);
            }

            vec3 blendTextures(vec2 uv) {
                vec3 A = uUseTextures ? texture2D(uMapA, uv).rgb : uColorA;
                vec3 B = uUseTextures ? texture2D(uMapB, uv).rgb : uColorB;
                float mask = edge(uv.y, uThreshold);
                return mix(A, B, mask);
            }
        `;

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
            ${fragmentHeader}`
        );

        // 7. Override the color right after map_fragment
        // This ensures our custom colors are applied
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
            #include <map_fragment>

            // Override diffuseColor with our custom blended colors
            vec3 customColor = blendTextures(vCustomUv);
            diffuseColor.rgb = customColor;
            `
        );

        // Debug
        console.log('Shader patching complete - textures should work now');
    };

    material.needsUpdate = true;
    return material;
}

export function buildShaderMaterial(uniforms) {
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        uniform float uTwist;
        uniform float uDispAmp;
        uniform float uTime;

        float hash(vec3 p) {
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        mat2 rotate2D(float angle) {
            float s = sin(angle);
            float c = cos(angle);
            return mat2(c, -s, s, c);
        }

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);

            vec3 pos = position;

            float twistAngle = uTwist * pos.y * 3.14159;
            pos.xz = rotate2D(twistAngle) * pos.xz;

            float noiseValue = hash(pos * 3.0 + vec3(uTime * 0.2));
            pos += normal * (noiseValue - 0.5) * 2.0 * uDispAmp;

            vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
            vWorldPosition = worldPosition.xyz;

            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `;

    const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        uniform float uThreshold;
        uniform bool uUseTextures;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform sampler2D uMapA;
        uniform sampler2D uMapB;

        float edge(float x, float t) {
            return smoothstep(t - 0.02, t + 0.02, x);
        }

        void main() {
            vec3 A = uUseTextures ? texture2D(uMapA, vUv).rgb : uColorA;
            vec3 B = uUseTextures ? texture2D(uMapB, vUv).rgb : uColorB;

            float mask = edge(vUv.y, uThreshold);
            vec3 finalColor = mix(A, B, mask);

            vec3 normal = normalize(vNormal);
            vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
            float diff = max(dot(normal, lightDir), 0.0);

            vec3 ambient = finalColor * 0.3;
            vec3 diffuse = finalColor * diff * 0.7;

            vec3 result = ambient + diffuse;

            gl_FragColor = vec4(result, 1.0);
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide
    });
}