ml.module('three.objects.Particle')
.requires('three.Three',
          'three.core.Object3D')
.defines(function(){

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Particle = function ( material ) {

	THREE.Object3D.call( this );

	this.material = material;

};

THREE.Particle.prototype = Object.create( THREE.Object3D.prototype );


});