ml.module('three.core.Vertex')
.requires('three.Three',
          'three.core.Vector3')
.defines(function(){

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Vertex = function ( v ) {

	console.warn( 'THREE.Vertex has been DEPRECATED. Use THREE.Vector3 instead.')
	return v;

};


});