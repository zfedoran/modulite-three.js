ml.module('three.renderers.renderables.RenderableLine')
.requires('three.Three',
          'three.renderers.renderables.RenderableVertex')
.defines(function(){

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.RenderableLine = function () {

	this.z = null;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();

	this.material = null;

};


});