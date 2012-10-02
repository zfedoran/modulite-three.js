ml.module('three.extras.objects.ImmediateRenderObject')
.requires('three.Three',
          'three.core.Object3D')
.defines(function(){

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ImmediateRenderObject = function ( ) {

	THREE.Object3D.call( this );

	this.render = function ( renderCallback ) { };

};

THREE.ImmediateRenderObject.prototype = Object.create( THREE.Object3D.prototype );


});