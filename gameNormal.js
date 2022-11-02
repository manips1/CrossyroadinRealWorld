/**
 * Crossy Road In Real Road
 * 2022-2 Computer Graphics Term Project
 */

/**
 * @author
 * Dept. of Software, Gachon Univ.
 * 201835465 서지원
 * 201835510 임찬호
 * 201835474 안해빈
 * 201935121 임혜균
 */
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.134.0-dfARp6tVCbGvQehLfkdx/mode=imports,min/optimized/three.js';
import { OrbitControls } from 'https://cdn.skypack.dev/pin/three@v0.134.0-dfARp6tVCbGvQehLfkdx/mode=imports,min/unoptimized/examples/jsm/controls/OrbitControls.js';
// import { VRButton } from 'https://cdn.skypack.dev/pin/three@v0.134.0-dfARp6tVCbGvQehLfkdx/mode=imports,min/unoptimized/examples/jsm/webxr/VRButton.js'
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js';
import * as Utils from './js/utils.js';
import CannonDebugRenderer from './js/CannonDebugRenderer.js';
import { initNormalMap, Level } from './js/maps/normal.js';
import * as Loading from './js/loading.js';

/* 필수 Variable */
var world, canvas, camera, scene, renderer;
var debug;
var controls;
var id;
var clicked_id;
/* VR */
export let isVRMode = false;

/**
 * Window OnLoad Event
 */
window.onload = function() {
	Loading.initLoading();
	initThreeJS();
	initCannon();
	initObject();
	reply_click(clicked_id);
	renderer.setAnimationLoop(animate);
}

/**
 * Initilaizing Three.js
 */
function initThreeJS() {
	canvas = document.getElementById("gl-canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	window.addEventListener( 'resize', onWindowResize, false );

	renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(canvas.width, canvas.height);
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 90, canvas.width / canvas.height, 1, 15000);
	camera.position.y = 0;
	camera.position.z = 0;
	scene.add( camera );

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enablePan = false; //우클릭 이동 방지
	//y축 움직임 제한
}

/**
 * Initializing CANNON.js
 */
function initCannon() {
	world = new CANNON.World();
	world.gravity.set(0, 0, 0);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 10;
	
	debug = new CannonDebugRenderer(scene, world);
}

/**
 * Initializing Object
 */
function initObject() {
	// Stage Set
	//Utils.updateStage(1);
	Utils.setLevel(Level);
	
	// 맵 생성
	initNormalMap(scene, world, controls, camera);
}

function reply_click(clicked_id){
	id = clicked_id;
}

/**
 * Window Resize CallBack Function
 */
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


export function clearAll() {
	for (var i = scene.children.length - 1; i >= 0; i--) {
		var obj = scene.children[i];
		if(obj.type.includes('Light') || obj.type.includes('Camera')) continue;
		scene.remove(obj);
	}

	for (var i = world.bodies.length - 1; i >= 0; i--) {
		var body = world.bodies[i];
		world.removeBody(body);
	}
}

/**
 * Animate
 */
function animate() {
	Utils.updatePhysics(scene, world, camera, controls);
	TWEEN.update();
	if(Utils.developerMode) debug.update();
	renderer.render(scene, camera);
}