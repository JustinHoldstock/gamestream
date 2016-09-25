
var THREE = require('three');

function DemoSceneThrees() {
	this.scene = new THREE.Scene();

	this.camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		1,
		10000
	);
	this.camera.position.set(3,3,1);
	this.camera.up.set(0,0,1);
	this.camera.lookAt(new THREE.Vector3(0,0,0));
	this.scene.add(this.camera);
}

module.exports = DemoSceneThrees;
