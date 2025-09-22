precision highp float;

varying vec2 vUv;
uniform float u_time;
uniform float u_contrast;
uniform sampler2D u_texture;

#define PI 3.14159265359


// Simplex noise helpers
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

// Simplex noise
float simplexNoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0

  // First corner
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // Other corners
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // Permutations
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;

  // Gradients
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  // Normalize gradients
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  // Compute final value
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g) * 0.5 + 0.5;
}

void main() {
  vec2 uv = vUv;


	// uv = cos( uv * 2.0 * PI + u_time ) * 0.5 + 0.5;
	uv.x += .2 * cos( u_time ) * length( uv - 0.5 );
	float noise = simplexNoise( uv * 3.0 + u_time * 0.1 );
	uv.y += pow( .4 * sin( uv.x + u_time * .41 )* length( uv - 0.5 ), 3. );
	uv += max( 0., noise * .8 );
	float d = length( abs(uv)-.3 );
	uv += fract( d * 10. );
	// uv.y += pow( sin( uv.y ), 4. );
	vec4 tex = texture2D( u_texture, uv );

	// Apply contrast adjustment
	float noiseTest = noise;
  noiseTest = (noiseTest - 0.5) * u_contrast + 0.5;
  noiseTest = clamp(noiseTest, 0.0, 1.0);

  gl_FragColor = vec4( uv, 0., 1. );
  // gl_FragColor = vec4( vec3( noiseTest ), 1. );
}