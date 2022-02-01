import * as YUKA from '../../../../lib/yuka.module.js'
// import * as DAT from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.7/build/dat.gui.module.js';

import 'https://preview.babylonjs.com/babylon.js'
import 'https://preview.babylonjs.com/materialsLibrary/babylonjs.materials.min.js'
// import 'https://preview.babylonjs.com/inspector/babylon.inspector.bundle.js'
// import 'https://preview.babylonjs.com/loaders/babylonjs.loaders.min.js'

let renderer, scene, camera

let entityManager, time, vehicle, target

init()
animate()

function init() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 0, 10)
  camera.lookAt(scene.position)

  //

  const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8)
  vehicleGeometry.rotateX(Math.PI * 0.5)
  const vehicleMaterial = new THREE.MeshNormalMaterial()

  const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial)
  vehicleMesh.matrixAutoUpdate = false
  scene.add(vehicleMesh)

  const targetGeometry = new THREE.SphereBufferGeometry(0.05)
  const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })

  const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial)
  targetMesh.matrixAutoUpdate = false
  scene.add(targetMesh)

  //

  const sphereGeometry = new THREE.SphereBufferGeometry(2, 32, 32)
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(sphere)

  //

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  //

  window.addEventListener('resize', onWindowResize, false)

  // game setup

  entityManager = new YUKA.EntityManager()
  time = new YUKA.Time()

  target = new YUKA.GameEntity()
  target.setRenderComponent(targetMesh, sync)

  vehicle = new YUKA.Vehicle()
  vehicle.setRenderComponent(vehicleMesh, sync)

  const seekBehavior = new YUKA.SeekBehavior(target.position)
  vehicle.steering.add(seekBehavior)

  entityManager.add(target)
  entityManager.add(vehicle)

  generateTarget()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)

  const delta = time.update().getDelta()

  entityManager.update(delta)

  renderer.render(scene, camera)
}

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}

function generateTarget() {
  // generate a random point on a sphere

  const radius = 2
  const phi = Math.acos(2 * Math.random() - 1)
  const theta = Math.random() * Math.PI * 2

  target.position.fromSpherical(radius, phi, theta)

  setTimeout(generateTarget, 3000)
}
