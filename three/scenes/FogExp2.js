ml.module('three.scenes.FogExp2')
.requires('three.core.Color')
.defines(function(){

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.FogExp2 = function ( hex, density ) {

	this.color = new THREE.Color( hex );
	this.density = ( density !== undefined ) ? density : 0.00025;

};


});