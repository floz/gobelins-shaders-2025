import vs from "./shaders/floor.vs"
import fs from "./shaders/floor.fs"

import resources from "grow/prez/core/resources"

export default class Floor extends THREE.Mesh {

  constructor( w, h ) {
    const geometry = new THREE.PlaneBufferGeometry( w, h, 1, 1 )

		const t = new THREE.Texture()
		t.image = resources.images.vegetal_floor
		t.needsUpdate = true 
		t.wrapS = THREE.RepeatWrapping
		t.wrapT = THREE.RepeatWrapping
		t.repeat.set( 1, 1 )
		
    const uniforms = {
      color: { type: "c", value: new THREE.Color( 0x7cb44a ) },
			tAlphaMap: { type: "t", value: t },
			toColor: { type: "f", value: 0 },
			alpha: { type: "f", value: 0 }
    }

    const material = new THREE.RawShaderMaterial( {
      uniforms: uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true
    } )

    super( geometry, material )
	}
	
	show() {
		TweenLite.to( this.material.uniforms.alpha, 1, {
			value: 1,
			ease: Cubic.easeInOut
		})
	}

	showColors() {
		TweenLite.to( this.material.uniforms.toColor, 1, {
			value: 1,
			ease: Cubic.easeInOut
		})
	}

}