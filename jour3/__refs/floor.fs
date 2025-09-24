precision highp float;

uniform vec3 color;
uniform sampler2D tAlphaMap;
uniform float toColor;
uniform float alpha;

varying vec2 vUv;

void main() {

	vec4 alphaMap = texture2D( tAlphaMap, vUv );

  vec2 center = vec2( .5 );
  float dist = 1. - distance( center, vUv ) * 1.5;

  gl_FragColor = vec4( color * toColor + vec3( 1. ) * ( 1. - toColor ), dist * alphaMap.r * alpha );
  // gl_FragColor = vec4( 1., 0., 1., 1. );

}