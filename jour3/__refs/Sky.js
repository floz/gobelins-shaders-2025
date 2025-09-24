import stage from "mnf/core/stage"
import stage3d from "mnf/core/stage3d"
// import gui from 'mnf/utils/gui'
// import getRandomHSL from 'mnf/utils/colors'

import vs from "./Sky.vs"
import fs from "./Sky.fs"

class Sky extends THREE.Group {

  constructor(){
		const geometry = new THREE.IcosahedronBufferGeometry(1,5)
		const material = new THREE.ShaderMaterial({
				vertexShader: vs,
				fragmentShader: fs,
				uniforms: {
					color1:{type:'v3', value:new THREE.Color(0xFFFFFF*Math.random())},
					color2:{type:'v3', value:new THREE.Color(0xFFFFFF*Math.random())},
					color3:{type:'v3', value:new THREE.Color(0xFFFFFF*Math.random())},
					brightness:{type:'f',value:0}
				},
				side:THREE.BackSide,
		});
		super()
		this.material = material
		this.add(new THREE.Mesh(geometry,material))
		this.scale.multiplyScalar(10000)
		// this.createGUI()
		// stage3d.add(this)
  }

  show(){
	  TweenMax.to(this.material.uniforms.brightness,3,{delay:.4,value:.7})
  }

	// start() {
	// 	setInterval(this.randomColorTween,2000)
	// }

  // randomColorTween = ()=>{
	//   switch(this.state){
	// 		//example
	// 		case "winter" : {
	// 			let c1 = new THREE.Color()
	// 			let c2 = new THREE.Color()
	// 			let c3 = new THREE.Color()
	// 			let hsl = getRandomHSL({hue:160,sat:120,lum:Math.random()*255})
	// 			c1.setHSL(hsl.h/255,hsl.s/255,hsl.l/255)
	// 			hsl = getRandomHSL({hue:160,sat:120,lum:Math.random()*255})
	// 			c2.setHSL(hsl.h/255,hsl.s/255,hsl.l/255)
	// 			hsl = getRandomHSL({hue:160,sat:120,lum:Math.random()*255})
	// 			c3.setHSL(hsl.h/255,hsl.s/255,hsl.l/255)
	// 			this.tweenTo(c1,c2,c3)
	// 			break
	// 		}
	// 		default:{
	// 			this.tweenTo(
	// 					{r:Math.random(),g:Math.random(),b:Math.random()},
	// 					{r:Math.random(),g:Math.random(),b:Math.random()},
	// 					{r:Math.random(),g:Math.random(),b:Math.random()}
	// 			)
	// 		}
	//   }
  // }

  tweenTo = (color1,color2,color3)=>{
	  const c1 = {r:this.material.uniforms.color1.value.r,g:this.material.uniforms.color1.value.g,b:this.material.uniforms.color1.value.b}
	  const c2 = {r:this.material.uniforms.color2.value.r,g:this.material.uniforms.color2.value.g,b:this.material.uniforms.color2.value.b}
	  const c3 = {r:this.material.uniforms.color3.value.r,g:this.material.uniforms.color3.value.g,b:this.material.uniforms.color3.value.b}
	 TweenMax.to(c1,.8,{ease:Linear.easeNone,r:color1.r,g:color1.g,b:color1.b})
	 TweenMax.to(c2,.8,{ease:Linear.easeNone,r:color2.r,g:color2.g,b:color2.b})
	 TweenMax.to(c3,.8,{ease:Linear.easeNone,r:color3.r,g:color3.g,b:color3.b,onUpdate:()=>{
		 this.material.uniforms.color1.value.setRGB(c1.r,c1.g,c1.b)
		 this.material.uniforms.color2.value.setRGB(c2.r,c2.g,c2.b)
		 this.material.uniforms.color3.value.setRGB(c3.r,c3.g,c3.b)
	 }})
	 TweenMax.to( this.material.uniforms.brightness, .8, {
		 value: .7,
		 ease: Cubic.easeInOut
	 })

  }

  // createGUI(){
	//   const f = gui.addFolder('sky')
	//   const o = {
	// 	  c1 : {r:0,g:0,b:255},
	// 	  c2 : {r:0,g:0,b:255},
	// 	  c3 : {r:0,g:0,b:255},
	//   }
	//   f.addColor(o,'c1').onChange(()=>{this.material.uniforms.color1.value.setRGB(o.c1.r,o.c1.g,o.c1.b)})
	//   f.addColor(o,'c2').onChange(()=>{this.material.uniforms.color2.value.setRGB(o.c2.r,o.c2.g,o.c2.b)})
	//   f.addColor(o,'c3').onChange(()=>{this.material.uniforms.color3.value.setRGB(o.c3.r,o.c3.g,o.c3.b)})
	//   f.add(this,'randomColorTween')
	//   f.add(this.material.uniforms.brightness,'value',0,1.2)
  // }

}

export default new Sky()