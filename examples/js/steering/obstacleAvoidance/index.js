// Copyright 2022 ETCloud Inc. All Rights Reserved.

/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Demo of BabylonJS and Yuka.
 * @author 26896225@qq.com (Awen)
 */

/**
 * Third party library.
 */
import * as YUKA from '../../../../lib/yuka.module.js'
import '../../../../babylon.js'
import '../../../../babylonjs.materials.min.js'
import { createVehicle } from '../../creator.js'
/**
 * Globle variables.
 */
let engine_, sceneToRender_
let entityManager_, time_, vehicle_
let bPause_ = false
let canvas_ = document.getElementById("renderCanvas")
let btnSnap_ = document.getElementById('snapCanvas')
let btnPause_ = document.getElementById('pauseScene')
const obstacles_ = new Array()
const entityMatrix_ = new BABYLON.Matrix()

let createScene = function () {
  var scene = new BABYLON.Scene(engine_);
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    BABYLON.Tools.ToRadians(120),
    BABYLON.Tools.ToRadians(60),
    60,
    BABYLON.Vector3.Zero(),
    scene
  )

  camera.target = new BABYLON.Vector3(-10, 0, 0)
  camera.attachControl(canvas_, true)
  // camera.upperBetaLimit = 1.1

  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1)
  scene.useRightHandedSystem = true

  /*
  // Material
  var matPlan = new BABYLON.StandardMaterial("matPlan1", scene);
  matPlan.backFaceCulling = false;
  matPlan.emissiveColor = new BABYLON.Color3(0.2, 1, 0.2);

  var matBB = new BABYLON.StandardMaterial("matBB", scene);
  matBB.emissiveColor = new BABYLON.Color3(1, 1, 1);
  matBB.wireframe = true;

  // Intersection point
  var pointToIntersect = new BABYLON.Vector3(-30, 0, 0);
  var origin = BABYLON.Mesh.CreateSphere("origin", 4, 0.3, scene);
  origin.position = pointToIntersect;
  origin.material = matPlan;

  // Create two planes
  var plan1 = BABYLON.Mesh.CreatePlane("plane1", 20, scene);
  plan1.position = new BABYLON.Vector3(13, 0, 0);
  plan1.rotation.x = -Math.PI / 4;
  plan1.material = matPlan;

  var plan2 = BABYLON.Mesh.CreatePlane("plane2", 20, scene);
  plan2.position = new BABYLON.Vector3(-13, 0, 0);
  plan2.rotation.x = -Math.PI / 4;
  plan2.material = matPlan;

  // AABB - Axis aligned bounding box
  var planAABB = BABYLON.Mesh.CreateBox("AABB", 20, scene);
  planAABB.material = matBB;
  planAABB.position = new BABYLON.Vector3(13, 0, 0);
  planAABB.scaling = new BABYLON.Vector3(1, Math.cos(Math.PI / 4), Math.cos(Math.PI / 4));

  // OBB - Object boundind box
  var planOBB = BABYLON.Mesh.CreateBox("OBB", 20, scene);
  planOBB.scaling = new BABYLON.Vector3(1, 1, 0.05);
  planOBB.parent = plan2;
  planOBB.material = matBB;

  // Balloons
  var balloon1 = BABYLON.Mesh.CreateSphere("balloon1", 10, 2.0, scene);
  var balloon2 = BABYLON.Mesh.CreateSphere("balloon2", 10, 2.0, scene);
  var balloon3 = BABYLON.Mesh.CreateSphere("balloon3", 10, 2.0, scene);
  balloon1.material = new BABYLON.StandardMaterial("matBallon", scene);
  balloon2.material = new BABYLON.StandardMaterial("matBallon", scene);
  balloon3.material = new BABYLON.StandardMaterial("matBallon", scene);

  balloon1.position = new BABYLON.Vector3(6, 5, 0);
  balloon2.position = new BABYLON.Vector3(-6, 5, 0);
  balloon3.position = new BABYLON.Vector3(-30, 5, 0);
  */

  new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0))

  const ground = BABYLON.MeshBuilder.CreatePlane('plane', { width: 50, height: 25 }, scene)
  ground.position.x = -10
  ground.rotation.x = Math.PI / 2
  
  ground.material = new BABYLON.GridMaterial('grid', scene)
  ground.material.backFaceCulling = true
  ground.visibility = 0.4

  const wayPointsMat = new BABYLON.StandardMaterial('wayPointsMat', scene)
  wayPointsMat.disableLighting = true
  wayPointsMat.emissiveColor = BABYLON.Color3.Magenta()

  const vehicleMesh = createVehicle(scene, { size: 2 })
  // game setup

  entityManager_ = new YUKA.EntityManager()
  time_ = new YUKA.Time()

  const path = new YUKA.Path()
  path.loop = true
  path.add(new YUKA.Vector3(0, 5, 0))
  path.add(new YUKA.Vector3(-5, 15, -5))
  path.add(new YUKA.Vector3(-20, 10, -3))
  path.add(new YUKA.Vector3(-35, 10, 0))

  vehicle_ = new YUKA.Vehicle()
  vehicle_.maxSpeed = 5
  vehicle_.setRenderComponent(vehicleMesh, sync)

  vehicle_.boundingRadius = vehicleMesh.getBoundingInfo().boundingSphere.radius
  vehicle_.smoother = new YUKA.Smoother(20)

  entityManager_.add(vehicle_)

  const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(obstacles_)
  vehicle_.steering.add(obstacleAvoidanceBehavior)

  const followPathBehavior = new YUKA.FollowPathBehavior(path)
  vehicle_.steering.add(followPathBehavior)

  setupObstacle(scene)
  setupWaypoints(scene, path)

  /**
   * Helper functions section.
   */

  function sync(entity, renderComponent) {
    entity.worldMatrix.toArray(entityMatrix_.m)
    entityMatrix_.markAsUpdated()
  
    const matrix = renderComponent.getWorldMatrix()
    matrix.copyFrom(entityMatrix_)
  }

  function setupObstacle(scene) {
    const mesh1 = BABYLON.MeshBuilder.CreateSphere('mesh1', {diameter: 4, segments: 10 }, scene)
    const mesh2 = BABYLON.MeshBuilder.CreateCylinder('mesh2', {diameter: 6, height: 3, subdivisions:5 }, scene)
    const mesh3 = BABYLON.MeshBuilder.CreateSphere('mesh3', {diameter: 2, segments: 16 }, scene)
  
    const meshMat = new BABYLON.StandardMaterial('meshMat', scene)
    meshMat.disableLighting = true
    meshMat.emissiveColor = BABYLON.Color3.Red()
    meshMat.alpha = 0.2
    meshMat.wireframe = true
    
    mesh2.material = meshMat
    mesh1.material = meshMat
    mesh3.material = meshMat

  
    mesh1.position.set(-10, 0, 0)
    mesh2.position.set(-25, 0, -10)
    mesh3.position.set(-15, 0, 0)
  
    const obstacle1 = new YUKA.GameEntity()
    obstacle1.position.copy(mesh1.position)
    obstacle1.boundingRadius = mesh1.getBoundingInfo().boundingSphere.radius * 1.4
    entityManager_.add(obstacle1)
    obstacles_.push(obstacle1)
  
    const obstacle2 = new YUKA.GameEntity()
    obstacle2.position.copy(mesh2.position)
    obstacle2.boundingRadius = mesh2.getBoundingInfo().boundingSphere.radius
    entityManager_.add(obstacle2)
    obstacles_.push(obstacle2)
  
    const obstacle3 = new YUKA.GameEntity()
    obstacle3.position.copy(mesh3.position)
    obstacle3.boundingRadius = mesh3.getBoundingInfo().boundingSphere.radius
    entityManager_.add(obstacle3)
    obstacles_.push(obstacle3)
  }
  
  function setupWaypoints(scene, path) {
    path._waypoints.forEach((p) => {
      const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 0.4 }, scene)
      sphere.material = scene.getMaterialByName('wayPointsMat')
      sphere.position.x = p.x
      sphere.position.y = p.y
      sphere.position.z = p.z
    })
  }
  
  //注册动画回调，主循环绘制前被调用
  function prepareScene() {
    if (bPause_) return 0
    const delta = time_.update().getDelta()
    entityManager_.update(delta)

    /*
    //Balloon 1 intersection -- Precise = false
    if (balloon1.intersectsMesh(plan1, false)) {
      balloon1.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
    } else {
      balloon1.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    }

    //Balloon 2 intersection -- Precise = true
    if (balloon2.intersectsMesh(plan2, true)) {
      balloon2.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
    } else {
      balloon2.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    }

    //balloon 3 intersection on single point
    if (balloon3.intersectsPoint(pointToIntersect)) {
      balloon3.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
    } else {
      balloon3.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    }

    alpha += 0.01;
    balloon1.position.y += Math.cos(alpha) / 10;
    balloon2.position.y = balloon1.position.y;
    balloon3.position.y = balloon1.position.y;
    */
  }
  scene.registerBeforeRender(prepareScene);

  return scene;
}

/**
 * Main loop entry point .
 */
window.initFunction = async function () {
  let startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
      if (sceneToRender_ && sceneToRender_.activeCamera) {
        sceneToRender_.render();
      }
    });
  }
  let createDefaultEngine = function () { 
    return new BABYLON.Engine(canvas_, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); 
  }
  let asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log("the available createEngine function failed. Creating the default engine instead");
      return createDefaultEngine();
    }
  }
  engine_ = await asyncEngineCreation();
  if (!engine_) throw 'engine should not be null.';
  window.engine = engine_
  window.scene = createScene();
  startRenderLoop(engine_, canvas_);
};

initFunction().then(() => {
  sceneToRender_ = window.scene
});

/**
 *   UI事件处理 
 */
window.addEventListener("resize", onWindowResize);
btnSnap_.addEventListener("click", onSnapCanvas)
btnPause_.addEventListener("click", onPauseScene)

function onWindowResize() {
  engine_.resize()
}

function onPauseScene() {
  bPause_ = !bPause_
}

function onSnapCanvas() {
  // BABYLON.ScreenshotTools.CreateScreenshotWithResizeAsync(window.engine, window.scene.activeCamera, canvas_.width, canvas_.height).then((data) => {
  //   console.log('ok', data)
  //   return 0
  // });
  BABYLON.Tools.CreateScreenshot(window.engine, window.scene.activeCamera, { width: canvas_.width, height: canvas_.height }, function (data) {
    var img = document.getElementById("previewImg");
    img.src = data;
    console.log('data:', data)
  });
}
