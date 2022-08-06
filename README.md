# AI行为建模

行为建模是利用电脑模拟现实对象，让孪生体具有一定的行为，在孪生世界中做出各种行为，c从而与人进行交互。电子游戏中的电脑AI是最早的应用，随着技术发展，也可以用到很多仿真场景，如下的一些场景是AI行为建模的应用领域。

1）保障场景要仿真路径规划是否合理，可以用若干Agent的AI行为模拟现场其它人员车辆，以验证AGV的智能行为是否合理；

2）试验场景通过模拟若干拦截行为，以验证飞行器突防能力；

3）测控场景模拟飞行器的飞行轨迹，检查测控台站的协同与通信行为，以验证试验方案的合理性；

4）训练场景模拟对抗方的行为，以检验指挥官或操作手的能力。

行为建模和3D可视化相结合，采用[AI 行为库](https://github.com/Mugen87/yuka)
和[3D 渲染库](https://github.com/BabylonJS/Babylon.js)。

[参考例程](https://yuka.babylonpress.org/examples/)。


# 运行环境
需要有一个python的虚拟环境以运行后台web服务，因要根据不同文件类型提供MIME的type信息给浏览器，因此不能是python简单的http.server。
在vs code环境下，ctrl+shift+p，选择python的interpret虚拟环境，之后ctrl+`可以打开一个新的终端，进入python虚拟环境。

## 如何运行例程

在项目根路径的命令行下，运行如下命令。
```
（venv）PS E:\_proj\yuka-babylonjs-examples> python server.py
```

## 最佳实践

1. try to avoid parented `TransformNodes` with YUKA. YUKA will place your object in world space.Use YUKA's parenting instead.
2. you **must** scale, rotate and position your mesh before registering it as a YUKA `renderComponent` and bake the transformations into the vertices and freeze the world matrix of your mesh before doing so.
3. you **must** register your Mesh/TransformNode/Camera on the YUKA entity by setting it as a `renderComponent` and pass the `syncFunction` which will take care of syncing your BabylonJS object's position/rotation/scaling into with the YUKA world's position.

```
const entity = new YUKA.GameEntity()
entity.setRenderComponent(mesh, syncFunction)
```

4. `syncFunctions`:
   For syncing a `TransformNode` with the YUKA entity use this method:

```
private _sync(entity, renderComponent) {
   Matrix.FromValues(...entity.worldMatrix.elements).decomposeToTransformNode(renderComponent)
}
```

If it doesn't work for you try this one:

```
renderComponent.getWorldMatrix().copyFrom(BABYLON.Matrix.FromValues(...entity.worldMatrix.elements))
```

For the `camera` use this:

```
private _syncCamera(entity, camera) {
    camera.getViewMatrix().copyFrom(Matrix.FromValues(...entity.worldMatrix.elements).invert())
}
```

5. you **must** register your YUKA entity in the `YUKA.EntityManager` with it's `add` function
6. you **must** update the YUKA EntityManager's time (make steps in YUKA world) to make things moving like this:

```
private _time = new YUKA.Time()
this._scene.onBeforeRenderObservable.add(() => {
    const delta = this._time.update().getDelta()
    this._entityManager.update(delta) // YUKA world step
})
```

## License

All these examples are open source, MIT License.

Babylon.js: Apache-2.0 License

Yuka.js: MIT License

3D Models: CC Attribution License (see readme.md in relevant folders)
