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
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/pin/three@v0.134.0-dfARp6tVCbGvQehLfkdx/mode=imports,min/unoptimized/examples/jsm/loaders/GLTFLoader.js';
import * as Loading from './loading.js'
import * as Main from '../gameNormal.js'

/* Setting */
const timeStep = 1 / 30;

export var playerSpeed = 1500; // 플레이어의 속도를 결정
export var player_height = 500; // 플레이어의 카메라 높이 결정  
export var player_height2D = 7300; // 시작 시에 위에서 보여주는 시점의 높이

export const loadManager = new THREE.LoadingManager();
loadManager.onStart = () => {
	Loading.setLoadingValue(0);
	document.getElementById("loading").style.visibility = "visible";
	isloadingFinished = false;
}

loadManager.onProgress = (url, itemsLoaded, itemsTotal) => {
	console.log("Load " + url + "! Currently " + itemsLoaded + " Loaded, Total " + itemsTotal);
	Loading.setLoadingValue(itemsLoaded / itemsTotal * 100 | 0);
}

loadManager.onLoad = () => {
	document.getElementById("loading").style.visibility = "hidden";
	console.log("Loading Finished");
	isloadingFinished = true;
};

export const loader = new GLTFLoader(loadManager);
export const textureLoader = new THREE.TextureLoader(loadManager);
export const cubeLoader = new THREE.CubeTextureLoader(loadManager);
export let isloadingFinished = false; // 로딩 완료 여부 확인

/* camera control variable */
export var if2D = false;
export var first2DFlage = true; // 1인칭 -> 3인칭이 처음 된 건지 체크
export var nowMoveOK = true; // 이게 true일때 setCameraType에서 온전히 함수들이 작동 (false일때는 카메라가 이동중이라는 의미)
export var targetPosition; // camera 이동할 때 지정해 줄 좌표
export var isTween = false; // tween이 실행중인지

export var developerMode = false; // 개발자 모드 ON!

/* Object Dictonary */
export const object = {};

/* Pacman Transparent Body */
export let playerBody = undefined;

/* Audio List */
export const audioList = {
	'gameclear': new Audio("./audio/gameclear.mp3"),
	'gameover': new Audio("./audio/car_accident.mp3"),
	'traffic': new Audio("./audio/traffic_sound.mp3"),
};

/* Event Callback */
let userObjectCollide = undefined;
let keyUpCallback = undefined;
let keyDownCallback = undefined;
let mouseMoveCallback = undefined;

/* All Clear Check */
export let isNeedClear = false;

/* Delete Request List */
const deleteReqList = [];

/*Stopwatch*/
var hour, min, sec;
var time = 0;

/*난이도상태 */
export var Level = undefined;

/**
 * Mesh Object Class
 */
export class worldObj {
	constructor(objName, mesh, body) {
		this.objName = objName;
		this.body = body;
		this.mesh = mesh;
		this.y = undefined;
		this.currentDirection = 2;
		this.pre_detect_wall = undefined; //ghost에서 사용

		this.mesh.position.copy(body.position);
		this.mesh.quaternion.copy(body.quaternion);

		this.add = function (scene, world) {
			scene.add(this.mesh);
			world.addBody(this.body);
		}

		this.position = function (x, y, z) {
			this.y = y;
			this.mesh.position.set(x, y, z);
			this.body.position.set(x, y, z);
		}

		this.rotateX = function (angle) {
			var axis = new CANNON.Vec3(1, 0, 0);
			this.mesh.rotateX(angle * Math.PI / 180);
			this.body.quaternion.setFromAxisAngle(axis, angle * Math.PI / 180);
		}

		this.rotateY = function (angle) {
			var axis = new CANNON.Vec3(0, 1, 0);
			this.mesh.rotateY(angle * Math.PI / 180);
			this.body.quaternion.setFromAxisAngle(axis, angle * Math.PI / 180);
		}

		this.rotateZ = function (angle) {
			var axis = new CANNON.Vec3(0, 0, 1);
			this.mesh.rotateZ(angle * Math.PI / 180);
			this.body.quaternion.setFromAxisAngle(axis, angle * Math.PI / 180);
		}

		this.update = function () {
			if (this.body != undefined && this.mesh != undefined) {
				this.mesh.position.copy(body.position);
				this.mesh.quaternion.copy(body.quaternion);
			}
		}
	}
	//current 방향 알려주기 => ghost용
	getDirection() {
		return this.currentDirection;
	}

	
	getWall() {
		return this.pre_detect_wall;
	}

	setWall(wall) {
		this.pre_detect_wall = wall;
	}

	// 객체의 속도를 설정
	setDirection(flag){
		this.currentDirection = flag;
	}

	//객체의 위치를 알려줌
	getPosition() {
		return this.body.position;
	}

	//객체의 회전률을 알려줌
	getRotation() {
		return this.body.rotation;
	}

	// y
	getY() {
		return this.y;
	}

	// 객체의 속도를 설정
	setVelocity(flag, speed){
		var directionVector;

		if (flag == 1) {
			console.log("w");
			directionVector = new CANNON.Vec3(0, 0, 1);
			directionVector.z -= speed;
		}
		else if (flag == 2) {
			console.log("s");

			directionVector = new CANNON.Vec3(0, 0, 1);
			directionVector.z += speed;
		}
		else if (flag == 3) {
			console.log("a");

			directionVector = new CANNON.Vec3(1, 0, 0);
			directionVector.x -= speed;
		}
		else if (flag == 4) {
			console.log("d");

			directionVector = new CANNON.Vec3(1, 0, 0);
			directionVector.x += speed;
		}
		else if (flag == 0) {
			this.body.velocity.set(0, 0, 0);
			return;
		}

		if (if2D == false) { 
			directionVector = this.body.quaternion.vmult(directionVector);
		}

		this.body.velocity.set(directionVector.x, 0, directionVector.z);
	}

	// 삭제하기
	delete(scene, world) {

		if (this.mesh != undefined) {
			scene.remove(this.mesh);
			this.mesh = undefined;
		}

		if (this.body != undefined) {
			world.removeBody(this.body);
			this.body = undefined;
		}

		delete object[this.objName];
	}

	// 삭제 요청하기
	deleteReq() {
		deleteReqList.push(this.objName)
	}
}

/**
 * 신규 Object 추가
 * @param {String} objName
 * @param {THREE.Mesh} geometry
 * @param {CANNON.Body} body
 */
export function createNewObject(scene, world, objName, mesh, body) {
	var newObj = new worldObj(objName, mesh, body);
	newObj.add(scene, world);
	object[objName] = newObj;
}

/**
 * 플레이어 생성
 * @param {THREE.Scene} scene 
 * @param {CANNON.World} world 
 * @param {X} posx 
 * @param {Y} posy 
 * @param {Z} posz 
 * @param {Integer} radius
 */
export function createPlayer(scene, world, posx, posy, posz, radius) {
	var playerMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 256, 128), new THREE.MeshPhongMaterial({
		color: 0xffffff,
		flatShading: true
	}));

	var player = new CANNON.Body({
		shape: new CANNON.Sphere(radius),
		angularDamping: 1,
		collisionFilterGroup: 1,
		collisionFilterMask: 4 | 8,
		mass: 3,
	});

	playerBody = new CANNON.Body({
		shape: new CANNON.Sphere(radius),
		angularDamping: 1,
		collisionFilterGroup: 2,
		collisionFilterMask: 4 | 8 | 16 | 32 | 64,
		mass: 0,
		type: 1
	});

	createNewObject(scene, world, 'player', playerMesh, player);
	world.addBody(playerBody);

	object['player'].position(posx, posy, posz);
	playerBody.position.set(posx, posy, posz);
}

/**
 * 벽 생성
 * @param {THREE.Scene} scene 
 * @param {CANNON.World} world 
 * @param {String} wallname 
 * @param {String (Color Hex Code, 0xFFFFFF)} wallcolor 
 * @param {X} x 
 * @param {Y} y 
 * @param {Z} z 
 */
export function createTransparentWallObject(scene, world, wallname, wallcolor, x, y, z) {
	var wallBody = new CANNON.Body({
		shape: new CANNON.Box(new CANNON.Vec3(x / 2, y / 2, z / 2)),
		collisionFilterGroup: 8,
		collisionFilterMask: 1 | 32,
		mass: 0,
		type: 1000
	});

	createNewObject(scene, world, wallname, new THREE.Mesh(new THREE.BoxGeometry(x, y, z), new THREE.MeshLambertMaterial({
		color: wallcolor,
		transparent: true,
		opacity: 0.5
	})), wallBody);
}

/**
 * User Event Listener 등록
 * @param {THREE.Scene} scene
 * @param {CANNON.World} world 
 * @param {OrbitControls} controls
 * @param {PerspectiveCamera} camera
 */
export function setUserEvent(scene, world, controls, camera) {
	object['player'].body.velocity.set(0, 0, 0);
	object['player'].body.angularDamping = 1;

	//3인칭 뷰 일 때에는 마우스 작동이 아예 안되게! 
	if (if2D == false)
		controls.enabled = true;
	else
		controls.enabled = false;

	// Key를 눌렀을 때
	keyDownCallback = function (event) {
		object['player'].body.angularDamping = 1;
		if (isTween == true)
			return;

		switch (event.key) {
			case "W":
			case "w":
					object['player'].setVelocity(1, playerSpeed); //s		
				break;

			case "S":
			case "s":
				
					object['player'].setVelocity(2, playerSpeed);
				break;

			case "A":
			case "a":
				
					object['player'].setVelocity(3, playerSpeed); //d
				break;

			case "D":
			case "d":
					object['player'].setVelocity(4, playerSpeed);
				break;


			//임시로 넣어둔 부분! 누르면 1인칭 <-> 3인칭
			// case "C":
			// case "c":
			// 	changePointOfView(object['player'], controls);
			// 	break;

		}
	};
	document.addEventListener("keydown", keyDownCallback);

	// Key를 뗐을 때 
	keyUpCallback = function (event) {
		switch (event.key) {
			case "W":
			case "w":
			case "S":
			case "s":
			case "A":
			case "a":
			case "D":
			case "d":
				object['player'].setVelocity(0, playerSpeed);
				break;
		}
	};
	document.addEventListener("keyup", keyUpCallback);

	// mouse로 카메라 움직일 때
	mouseMoveCallback = function (event) {
		const toangle = controls.getAzimuthalAngle() * (180 / Math.PI);
		//1인칭 시점일 때만 작동함
		if (if2D == false && object['player'] != undefined)
			object['player'].rotateY(toangle); //카메라 보는 각도가 정면이 되도록

	};
	document.addEventListener("mousemove", mouseMoveCallback);

	// Collide Event
	userObjectCollide = function (e) {
		let output = Object.fromEntries(Object.entries(object).filter(([k, v]) => v.body == e.body));
		console.log(output);
		const targetItem = Object.keys(output)[0];
		if (e.body.type == 3) {
			var result=getTimeRecord();
			document.location.href="./gameover.html?timerecords=" + result;
		}else if (e.body.type == 101) {
			touchFlagEvent();
		} 		
	};
	playerBody.addEventListener("collide", userObjectCollide);
}


/** 처음에 2D 5초간 보여주기
 * @param {OrbitControls} controls
 */
export function initcamera(userObject, controls) {
	changePointOfView(userObject, controls);

	setTimeout(function(){
		changePointOfView(userObject, controls);
		Stopwatch()
	}, 5000);

}

/** 
 * 카메라 시점 변경 
*/
function changePointOfView(userObject, controls) {
	if (if2D == false) { //1인칭 -> 2D
		if2D = true;
		//set position
		targetPosition = new THREE.Vector3(0, player_height2D, 200);
		controls.target.set(0, 0, 0);
	}
	else { // 2D -> 1인칭
		if2D = false;

		//set position
		var ve = userObject.getPosition(); //현재 플레이어 중심좌표
		var direct = new THREE.Vector3();
		targetPosition = new THREE.Vector3(ve.x - 10 * direct.x, player_height, ve.z - 10 * direct.z);
	}
}

/**
 *  카메라 선택
 */
function selectCameraType(scene, userObject, camera, controls) {
	var duration = 1500; //during 3 second

	if (nowMoveOK == false) { //c에서 조절
		tweenCamera(targetPosition, duration, controls, camera);
		nowMoveOK = true;
	}
	//1인칭 시점일 때만 작동함
	if (if2D == false) {
		if (first2DFlage == false) {
			nowMoveOK = false;
			// controls.reset()
			first2DFlage = true;
			controls.minPolarAngle = Math.PI * 0.5;
			controls.maxPolarAngle = Math.PI * 0.5;
			controls.rotateSpeed = 1;
		}
		if (nowMoveOK == true)
			moveFirstPersonCameraAll(scene, userObject, camera, controls);
	}
	else if (if2D == true) {
		if (first2DFlage == true) {
			// controls.saveState()
			nowMoveOK = false;
			first2DFlage = false;
			controls.minPolarAngle = 0;
			controls.maxPolarAngle = 0;
			controls.rotateSpeed = 0;
		}

		if (nowMoveOK == true)
			move2DCameraAll(scene, camera, controls);
	}
}

/**
 * 1인칭 <-> 3인칭 변환을 부드럽게 
 * ref : https://stackoverflow.com/questions/45252751/how-to-use-tween-to-animate-the-cameras-position
 * https://stackoverflow.com/questions/28091876/tween-camera-position-while-rotation-with-slerp-three-js 
*/
function tweenCamera(targetPosition, duration, controls, camera) {
	controls.enabled = false;
	isTween = true;

	//camera position
	var position = new THREE.Vector3().copy(camera.position);

	//position
	var tween = new TWEEN.Tween(position)
		.to(targetPosition, duration)
		.easing(TWEEN.Easing.Linear.None)
		.onUpdate(function () {
			camera.position.copy(position);
			camera.lookAt(controls.target);
		})
		.onComplete(function () {
			camera.position.copy(targetPosition);
			controls.enabled = true;
			isTween = false;
		}).start();
}


/**
 * orbitcontrol을 first person 시점으로 사용
 */
export function moveFirstPersonCameraAll(scene, userObject, camera, controls) {
	userObject.body.angularDamping = 1; //계속 회전 방지

	var ve = userObject.getPosition(); //현재 플레이어 중심좌표
	var direct = new THREE.Vector3();
	camera.getWorldDirection(direct); // 카메라가 바라보는 방향 받아오기

	camera.position.set(ve.x - 10 * direct.x, player_height, ve.z - 10 * direct.z); //카메라 셋팅
	controls.target.set(ve.x, player_height, ve.z); //타겟 설정 - 얘를 중심으로 공전

	userObject.body.angularDamping = 1; //계속 회전 방지
	controls.update();
	

}

/**
 * orbitcontrol을 3인칭 시점(2D)으로 사용
 */
function move2DCameraAll(scene, camera, controls) {
	//1인칭 시점일 때만 작동함
	camera.position.set(0, player_height2D, 0); //카메라 셋팅
	controls.target.set(0, 0, 0); //타겟 설정 - 얘를 중심으로 공전
	controls.update();
}

/**
 * Global Event Listener 삭제
 */
export function removeGlobalEventListener() {
	document.removeEventListener("mousemove", mouseMoveCallback);
	document.removeEventListener("keydown", keyDownCallback);
	document.removeEventListener("keyup", keyUpCallback);
}

/**
 * 상자 만들기
 * @param {THREE.Scene} scene 
 * @param {CANNON.World} world 
 * @param {Object Name} name 
 * @param {X} x 
 * @param {Y} y
 * @param {Z} z
 * @param {Color} sur_color 
 * @param {collisionFilterGroup} collisionFilterGroup_val 
 * @param {mass} mass_val 
 * @param {type} type_val 
 */
export function makeBox(scene, world, name, x, y, z, sur_color, collisionFilterGroup_val, mass_val, type_val) {
	var boxBody = new CANNON.Body({
		shape: new CANNON.Box(new CANNON.Vec3(x / 2, y / 2, z / 2)),
		collisionFilterGroup: collisionFilterGroup_val,
		mass: mass_val,
		type: type_val
	});
	createNewObject(scene, world, name, new THREE.Mesh(new THREE.BoxGeometry(x, y, z), new THREE.MeshPhongMaterial({
		color: sur_color,
		flatShading: true
	})), boxBody);
}

/**
 * 상자 만들기
 * @param {THREE.Scene} scene 
 * @param {CANNON.World} world 
 * @param {Object Name} name 
 * @param {X} x 
 * @param {Y} y 
 * @param {Z} z 
 */
export function createTeleportBox(scene, world, name, x, y, z) {
	var boxBody = new CANNON.Body({
		shape: new CANNON.Box(new CANNON.Vec3(x / 2, y / 2, z / 2)),
		collisionFilterGroup: 8,
		collisionFilterMask: 1 | 2,
		mass: 0,
		type: 1001
	});
	createNewObject(scene, world, name, new THREE.Mesh(new THREE.BoxGeometry(x, y, z), new THREE.MeshPhongMaterial({
		color: 0x008000,
		flatShading: true
	})), boxBody);
}


/**
 * 차량 생성
 * @param {THREE.Scene} scene 
 * @param {CANNON.World} world 
 * @param {Object Name} objName 
 * @param {Position X} x 
 * @param {Position Y} y 
 * @param {Position Z} z 
 * @param {Color} color
 * @param {direction} direction  
 */
export function createCar(scene, world, objName, x, y, z, direction, num , speed, hit) {
		var carBody = new CANNON.Body({
		shape: new CANNON.Box(new CANNON.Vec3(hit, 2000, 1200)),
		collisionFilterGroup: 32,
		angularDamping: 1,
		collisionFilterMask: 2 | 4 | 8 | 32,
		mass: 10,
		type: 3
		}); 	
	if(num==1) {
		loader.load("./models/mustang/scene.gltf", (gltf) => {
		const root = gltf.scene;
		var mustang = root.children[0];
		mustang.scale.set(7, 7, 7);
		if(direction==4) mustang.rotation.z = 1.55;
		else mustang.rotation.z = -1.55;
		
		createNewObject(scene, world, objName, root, carBody);
		object[objName].position(x, y, z);
		object[objName].setDirection(direction)
		object[objName].setVelocity(direction, speed);

		object[objName].body.addEventListener("collide",  function(e) {
			let output = Object.fromEntries(Object.entries(object).filter(([k,v]) => v.body == e.body));
			const targetWall = Object.keys(output)[0];
			var wall = object[objName].getWall();

			if (wall != targetWall){
				object[objName].setWall(targetWall);

				setTimeout(function(){
					if(object[objName] != undefined) {
						object[objName].setVelocity(direction, speed);
			
						var ghostPosition = object[objName].getPosition();
						if(direction==4) object[objName].position(-24700, -200, 4600);
						else object[objName].position(24700, -200, -4600);
					}
				}, 500);
			}
		});

		});
	}
	
	if(num==2) {
		loader.load("./models/toyota/scene.gltf", (gltf) => {
		const root = gltf.scene;
		var toyota = root.children[0];
		toyota.scale.set(800, 800, 800);
		if(direction==4) toyota.rotation.z = 1.55;
		else toyota.rotation.z = -1.55;
		
		createNewObject(scene, world, objName, root, carBody);
		object[objName].position(x, y, z);
		object[objName].setDirection(direction)
		object[objName].setVelocity(direction, speed);

		object[objName].body.addEventListener("collide",  function(e) {
			let output = Object.fromEntries(Object.entries(object).filter(([k,v]) => v.body == e.body));
			const targetWall = Object.keys(output)[0];
			var wall = object[objName].getWall();

			if (wall != targetWall){
				object[objName].setWall(targetWall);

				setTimeout(function(){
					if(object[objName] != undefined) {
						object[objName].setVelocity(direction, speed);
						var ghostPosition = object[objName].getPosition();
						if(direction==4) object[objName].position(-24700, -200, 4600);
						else object[objName].position(24700, -200, -4600);
					}
				}, 500);
			}
		});

		});
	}
	
	if(num==3) {
		loader.load("./models/lambo/scene.gltf", (gltf) => {
		const root = gltf.scene;
		var lambo = root.children[0];
		lambo.scale.set(400, 400, 400);
		if(direction==3) lambo.rotation.z = 1.55;
		else lambo.rotation.z = -1.55;
		
		createNewObject(scene, world, objName, root, carBody);
		object[objName].position(x, y, z);
		object[objName].setDirection(direction)
		object[objName].setVelocity(direction, speed);

		object[objName].body.addEventListener("collide",  function(e) {
			let output = Object.fromEntries(Object.entries(object).filter(([k,v]) => v.body == e.body));
			const targetWall = Object.keys(output)[0];
			var wall = object[objName].getWall();

			if (wall != targetWall){
				object[objName].setWall(targetWall);

				setTimeout(function(){
					if(object[objName] != undefined) {
						object[objName].setVelocity(direction, speed);
						var ghostPosition = object[objName].getPosition();
						if(direction==4) object[objName].position(-24700, 300, 1600);
						else object[objName].position(24700, 300, -1600);
					}
				}, 500);
			}
		});

		});
	}
	
	if(num==4) {
		loader.load("./models/bus/scene.gltf", (gltf) => {
		const root = gltf.scene;
		var bus = root.children[0];
		bus.scale.set(50, 50, 50);
		if(direction==3) bus.rotation.z = -3.15;
		else bus.rotation.z = 0;
		
		createNewObject(scene, world, objName, root, carBody);
		object[objName].position(x, y, z);
		object[objName].setDirection(direction)
		object[objName].setVelocity(direction, speed);

		object[objName].body.addEventListener("collide",  function(e) {
			let output = Object.fromEntries(Object.entries(object).filter(([k,v]) => v.body == e.body));
			const targetWall = Object.keys(output)[0];
			var wall = object[objName].getWall();

			if (wall != targetWall){
				object[objName].setWall(targetWall);

				setTimeout(function(){
					if(object[objName] != undefined) {
						object[objName].setVelocity(direction, speed);
						var ghostPosition = object[objName].getPosition();
						if(direction==4) object[objName].position(-24700, -200, 6500);
						else object[objName].position(24700, -200, -6500);
					}
				}, 500);
			}
		});

		});
	}
	
}

/**
 * Stop Timer
 * @param {Timer} timer 
 */
export function stopTimer(timer) {
	clearInterval(timer);
}

/**
 * 오디오 재생
 * @param {Audio Name} audioName 
 */
export function playAudio(audioName) {
	audioList[audioName].currentTime = 0;
	audioList[audioName].play();
}

/**
 * 오디오 정지
 * @param {Audio Name} audioName 
 */
export function stopAudio(audioName) {
	audioList[audioName].currentTime = 0;
	audioList[audioName].pause();
}

/**
 * 오디오 전부 정지
 */
export function stopAllAudio() {
	for(var audioName in audioList) {
		console.log(audioName);
		audioList[audioName].currentTime = 0;
		audioList[audioName].pause()
	}
	
}

//Finish item
export function locateItem(scene, world, stageNum, Item1Num) {
	if (stageNum == 1) {	
		// 9: 'item' -> 'finishFlag'
			createItemObject(scene, world, 'finishFlag', 101, 0, 0, -8400);
	}
}

export function createItemObject(scene, world, itemName, itemNumber, posx, posy, posz) { // item 번호 붙여서 번호마다 기능 다르게 넣기
	var itemBody = new CANNON.Body({
		shape: new CANNON.Sphere(80),
		collisionFilterGroup: 16,
		collisionFilterMask: 2 | 4,
		mass: 0,
		type: itemNumber,
	});
	loader.load("./models/flag/scene.gltf", (gltf) => {
		const root = gltf.scene;
		var flag = root.children[0];
		flag.scale.set(1000, 1000, 1000);
		
		createNewObject(scene, world, itemName, root, itemBody);
		object[itemName].position(posx, posy, posz);
		});
		
}
//change 10: applyItem1Event -> touchFlagEvent
export function touchFlagEvent() {
	var result=getTimeRecord();
	window.location.href = 'gameclear.html?timerecords=' + result +"&level="+Level; 
}

/**
 * Update Physical Engine 
 */
export function updatePhysics(scene, world, camera, controls, renderer) {
	if (isloadingFinished) {
		// Step the physics world
		world.step(timeStep);

		// 삭제 요청 리스트를 통한 삭제 처리
		while (deleteReqList.length > 0) {
			let deleteItem = deleteReqList.pop();
		}

		if (object['player'] != undefined) {
			// 카메라 설정
			selectCameraType(scene, object['player'], camera, controls, renderer);
			playerBody.position = object['player'].body.position; 
		}
		Object.keys(object).forEach(function (key) {
			object[key].update();
		});
		
	}
}


//make Stopwath for time record
export function Stopwatch(){
	var timer;
	var obj=document.getElementById("timeSpan");
	if(time==0){
		obj.innerHTML="00:00:00";
		}
    	timer = setInterval(function(){
        time++; 

        min = Math.floor(time/60);
        hour = Math.floor(min/60);
        sec = time%60;
        min = min%60;

        var th = hour;
        var tm = min;
        var ts = sec;
        
        if(th < 10){
            th = "0" + hour;
        }
        if(tm < 10){
            tm = "0" + min;
        }
        if(ts < 10){
            ts = "0" + sec;
        }
        obj.innerHTML = th + ":" + tm + ":" + ts;
    }
, 1000);
}

export function getTimeRecord(){
	var th = hour;
	var tm = min;
	var ts = sec;
	if(th < 10){
		th = "0" + hour;
	}
	if(tm < 10){
		tm = "0" + min;
	}
	if(ts < 10){
		ts = "0" + sec;
	}
	return th+":"+tm+":"+ts; 
}

export function setLevel(level){
	Level=level;
}
