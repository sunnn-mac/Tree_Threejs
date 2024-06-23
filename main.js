import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import * as TWEEN from "tween";

const canvas = document.getElementById("canvas");

//シーン
const scene = new THREE.Scene();

const images = ["1.jpg", "2.jpg", "3.jpg"];

/**
 * カメラ
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  60,
  sizes.width / sizes.height,
  0.1,
  5000
);
camera.position.set(0, -700, 0);
//下記動作しない
// camera.lookAt(new THREE.Vector3(0, -1000, 0));

scene.add(camera);

/**
 * レンダラー
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
}); //透明をtrue
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

/**
 * オブジェクト作成 BufferGeometryを使わない→最初の表示がとても遅い
 */
// テクスチャ設定
const count = 50;
const circles = [];
const textureLoafer = new THREE.TextureLoader();
const vector = new THREE.Vector3();

//線のマテリアル
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x87cefa,
  // linewidth: 5,
  // vertexColors: true,
  // alphaToCoverage: true,
});

for (let i = 0; i < count; i++) {
  /***** 球の表面の座標を持つオブジェクトを作る ここから *****/
  // const phi = Math.acos(-1 + (2 * i) / count);  //緯度
  const num = Math.floor((i+3)/4);
  const phi = Math.acos(-1 + (2 * num) / 90);  //緯度
  const phi2 = Math.acos(-1 + (2 * i) / count);  //緯度
  // const theta = Math.sqrt(count * Math.PI) * phi; //経度
  let theta = (phi2 % 8) * Math.PI * 4; //経度
  // theta = (Math.trunc(theta * 100) % (Math.PI*100))/100 + i/50;
  console.log(theta);

  // console.log(phi);
  // console.log(theta);
  // 半径 500
  const sphericalPos = new THREE.Spherical(500, phi, theta);

  const target = new THREE.Object3D();
  target.position.setFromSpherical(sphericalPos);

  vector.copy(target.position).multiplyScalar(2);
  target.lookAt(vector);  //中心を向く
  /***** 球の表面の座標を持つオブジェクトを作る ここまで *****/

  const texture = textureLoafer.load(images[i % 3]);

  //ジオメトリ
  const geometory = new THREE.CircleGeometry(30, 32);
  //マテリアル
  const material = new THREE.MeshBasicMaterial({
    transparent: true, //画像の背景を透明化（バグにより、透過が完全ではない）
    map: texture,
    side: THREE.DoubleSide, //平面の両面を表示
  });

  //メッシュ化
  const mesh = new THREE.Mesh(geometory, material);
  mesh.position.set(
    target.position.x, 
    target.position.y, 
    target.position.z);
  // mesh.rotation.set(target.rotation.x,target.rotation.y, target.rotation.z );
  mesh.lookAt(vector);
  scene.add(mesh);
  //ジオメトリ,マテリアル, x,y,z
  circles.push(mesh);

  //自分より下流のオブジェクトの配列番号 0-
  let line_nos = [];
  if(i <= 5){
    line_nos.push(0);
  }
  let no = Math.trunc(Math.random() * 50);
  if (no > i){
    no = no % i;
  }
  line_nos.push( no );
  for(const line_no of line_nos){
    if(line_no >= 0){
      //下流への線を引く
      const points = [];
      points.push( 
        new THREE.Vector3(     
        target.position.x, 
        target.position.y, 
        target.position.z,
      )); 
      points.push( 
        new THREE.Vector3(     
        circles[line_no].position.x, 
        circles[line_no].position.y, 
        circles[line_no].position.z,
      ));
      // const lineGeometry = new LineGeometry();
      // lineGeometry.setPositions( points );
      const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
      const line = new THREE.Line( lineGeometry, lineMaterial );
      // const line = new Line2( lineGeometry, lineMaterial );
      // line.computeLineDistances();
      // line.scale.set( 1, 1, 1 );
      scene.add(line);
    }
  }
}

// テスト用 座標軸を表示
// x 軸は赤
// y 軸は緑
// z 軸は青
var axes = new THREE.AxesHelper(1000);
scene.add(axes);

//マウス操作
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener("resize", onWindowResize);

// const clock = new THREE.Clock();
// let blSphere = false;
function animate() {
  controls.update();
  // const elapsedTime = clock.getElapsedTime();
  // TWEEN.update();
  // if(!blSphere && elapsedTime > 8){
  //   console.log(elapsedTime);
  //   blSphere = true;
  //   //球の表面に配置
  //   gather();
  // }
  //レンダリング
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

//ブラウザのリサイズに対応
function onWindowResize() {
  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
}

animate();

// function gather(){
//   TWEEN.removeAll();

//   const vector = new THREE.Vector3();
//   const len = circles.length;
  
//   for (let i = 0; i < len; i++) {
//     /***** 移動先となる座標を持つオブジェクトを作る ここから *****/
//     const phi = Math.acos(-1 + (2 * i) / len);  //緯度
//     const theta = Math.sqrt(len * Math.PI) * phi; //経度
//     // 半径 500
//     const sphericalPos = new THREE.Spherical(1000, phi, theta);

//     const target = new THREE.Object3D();
//     target.position.setFromSpherical(sphericalPos);

//     vector.copy(target.position).multiplyScalar(2);
//     target.lookAt(vector);
//     /***** 移動先となる座標を持つオブジェクトを作る ここまで *****/

//     // circles[i].position.set(target.position.x,target.position.y,target.position.z );
//     // circles[i].rotation.set(target.rotation.x,target.rotation.y, target.rotation.z );

//     console.log(target.position);
//     console.log(circles[i].position);
//     // パネルの位置
//     new TWEEN.Tween(circles[i].position)
//       .to({x: target.position.x, y: target.position.y, z: target.position.z}, 1000)
//       .easing(TWEEN.Easing.Exponential.InOut)
//       .start();

//     // パネルの向き
//     new TWEEN.Tween(circles[i].rotation)
//       .to({x: target.rotation.x, y: target.rotation.y, z: target.rotation.z}, 1000)
//       .easing(TWEEN.Easing.Exponential.InOut)
//       .start();
//   }
// }
