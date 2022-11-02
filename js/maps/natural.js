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
import * as Utils from '../utils.js';

/**
 * Stage 1 Map
 * @param {THREE.Scene} scene
 * @param {CANNON.World} world 
 * @param {OrbitControls} controls
 * @param {PerspectiveCamera} camera
 */
export function initNaturalMap(scene, world, controls, camera) {
    // 맵 배경 택스쳐 이미지 
    const texture = Utils.cubeLoader.load([

        //중도로 걸어가기
        'image/background/view/nightview3.png',
        'image/background/view/nightview1.png',
        'image/background/sky/nightview1.png',
        'image/background/view/nightview1.png',
        'image/background/view/nightview2.png',
        'image/background/view/nightview4.png',



        // ////낮
        // 'image/background/view/dayview1.png',
        // 'image/background/view/dayview3.png',
        // 'image/background/sky/sky.png',
        // 'image/background/view/dayview1.png',
        // 'image/background/view/dayview4.png',
        // 'image/background/view/dayview2.png',


        ////예시->다하면 지우기
        // 'resources/cubemaps/map2/natural_px.png',
        // 'resources/cubemaps/map2/natural_nx.png',
        // 'resources/cubemaps/map2/natural_py.png',
        // 'resources/cubemaps/map2/natural_ny.png',
        // 'resources/cubemaps/map2/natural_pz.png',
        // 'resources/cubemaps/map2/natural_nz.png',
    ]);
    scene.background = texture;

    // 바닥과 벽 택스쳐 가져오기
    Utils.textureLoader.load('image/background/ground/road2.jpg', (texture) => {
        const ground_material = new THREE.MeshBasicMaterial({
            map: texture,
        });

        // 바닥 만들기
        var groundBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(25000, 5, 15000)),
            collisionFilterGroup: 4,
            collisionFilterMask: 1 | 2 | 8 | 16 | 32 | 64,
            mass: 0
        });
        Utils.createNewObject(scene, world, 'ground', new THREE.Mesh(new THREE.BoxGeometry(50000, 5, 17000), ground_material), groundBody);
        Utils.object['ground'].position(0, -200, 0);

        // 맵 감싸는 벽
        Utils.createTransparentWallObject(scene, world, 'wall24', 0x918572, 300, 800, 50000);
        Utils.object['wall24'].position(0, 0, -9000);
        Utils.object['wall24'].rotateY(90);
        Utils.createTransparentWallObject(scene, world, 'wall25', 0x918572, 300, 800, 50000);
        Utils.object['wall25'].position(0, 0, 9000);
        Utils.object['wall25'].rotateY(90);
        Utils.createTransparentWallObject(scene, world, 'wall26', 0x918572, 300, 800, 18000);
        Utils.object['wall26'].position(25000, 0, 0);
        Utils.createTransparentWallObject(scene, world, 'wall27', 0x918572, 300, 800, 18000);
        Utils.object['wall27'].position(-25000, 0, 0);

        

       
        // 플레이어
        Utils.createPlayer(scene, world, 0, 0, 8200, 180);
        Utils.setUserEvent(scene, world, controls, camera);

        // 자동차
        Utils.createCar(scene, world, 'car1', -24700, -200, 4600, 4, 1, 4000,1100);
		Utils.createCar(scene, world, 'car1-1', -24700, -200, -4600, 3, 1, 8000,1100);
		
		
		Utils.createCar(scene, world, 'car2', -8000, -200, 4600, 4, 2, 4000, 1100);
		Utils.createCar(scene, world, 'car2-1', 8000, -200, -4600, 3, 2, 8000, 1100);
		
		Utils.createCar(scene, world, 'car3', -8000, 300, 1600, 4, 3, 9000, 1100);
		Utils.createCar(scene, world, 'car3-1', 8000, 300, -1600, 3, 3, 10000, 1100);
		
		Utils.createCar(scene, world, 'car4', -24700, -200, 6500, 4, 4, 3000, 2000);
		Utils.createCar(scene, world, 'car4-1', -24700, -200, -6500, 3, 4, 3000, 2000);


		Utils.locateItem(scene, world, 1, 1);
        // set camera
        Utils.initcamera(Utils.object['player'], controls);

        Utils.audioList['traffic'].loop = true;
        Utils.audioList['traffic'].volume = 0.2;
        Utils.audioList['traffic'].play();
    });
}
