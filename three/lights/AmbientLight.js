ml.module('three.lights.AmbientLight')
.requires('three.lights.Light')
.defines(function(){

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AmbientLight = function ( hex ) {

	THREE.Light.call( this, hex );

};

THREE.AmbientLight.prototype = Object.create( THREE.Light.prototype );


});