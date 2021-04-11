import "./styles.css";
import * as dat from "dat.gui";
import { gsap } from "gsap";
import * as THREE from "three";
const OrbitControls = require("three-orbit-controls")(THREE);

const gui = new dat.GUI();

const world = {
  plane: {
    width: 20,
    height: 20,
    widthSegments: 50,
    heightSegments: 50
  }
};

gui.add(world.plane, "width", 1, 200).onChange(generatePlane);
gui.add(world.plane, "height", 1, 200).onChange(generatePlane);
gui.add(world.plane, "widthSegments", 1, 500).onChange(generatePlane);
gui.add(world.plane, "heightSegments", 1, 500).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );
  const { array } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i + 2] = z + Math.random();
  }
  const colors = [];

  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }
  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;

const geometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const material = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true
});
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 0, 1);
scene.add(light);
const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

const planeMesh = new THREE.Mesh(geometry, material);
scene.add(planeMesh);

const { array } = planeMesh.geometry.attributes.position;
const randomValues = [];
for (let i = 0; i < array.length; i++) {
  if (i % 3 === 0) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i] = x + (Math.random() - 0.5) * 3;
    array[i + 1] = y + (Math.random() - 0.5) * 3;
    array[i + 2] = z + (Math.random() - 0.5) * 3;
  }

  randomValues.push(Math.random() - 0.5);
}

planeMesh.geometry.attributes.position.originalPosition =
  planeMesh.geometry.attributes.position.array;
planeMesh.geometry.attributes.position.randomValues =
  planeMesh.geometry.attributes.position.array;

const colors = [];

for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  colors.push(0, 0.19, 0.4);
}

planeMesh.geometry.setAttribute(
  "color",
  new THREE.BufferAttribute(new Float32Array(colors), 3)
);

const mouse = {
  x: undefined,
  y: undefined
};

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouse);
});

// // window.addEventListener("mousedown", (e) => {
// // window.addEventListener("mouseup", (e) => {
// window.addEventListener("mousemove", (e) => {
//   if (e.clientX > window.innerWidth / 2) {
//     planeMesh.rotation.x += 0.01;
//   } else {
//     planeMesh.rotation.x -= 0.01;
//   }
//   if (e.clientY > window.innerHeight / 2) {
//     planeMesh.rotation.y += 0.01;
//   } else {
//     planeMesh.rotation.y -= 0.01;
//   }
// });
// // });
// // });
let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.0001;

  const {
    array,
    originalPosition,
    randomValues
  } = planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i] * 0.001);
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1] * 0.001);
    array[i + 2] =
      originalPosition[i + 2] + Math.tan(frame + randomValues[i + 2] * 0.001);
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);
    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
        color.needsUpdate = true;
      }
    });
  }
}
animate();
