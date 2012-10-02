ml.module('three.materials.MeshFaceMaterial')
.requires('three.Three')
.defines(function(){

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MeshFaceMaterial = function () {};

THREE.MeshFaceMaterial.prototype.clone = function () {

	return new THREE.MeshFaceMaterial();

};


});