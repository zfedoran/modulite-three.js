ml.module('three.lights.Light')
.requires('three.Three',
          'three.core.Color',
          'three.core.Object3D')
.defines(function(){

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
 
THREE.Light = function ( hex ) {

	THREE.Object3D.call( this );

	this.color = new THREE.Color( hex );

};

THREE.Light.prototype = Object.create( THREE.Object3D.prototype );


});