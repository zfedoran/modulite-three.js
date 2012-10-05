## Modulite-threejs

This project generates a [three.js](https://github.com/mrdoob/three.js/) library for use with [modulite.js](https://github.com/zfedoran/modulite.js). Have a look at the generated [sample](https://github.com/zfedoran/modulite-threejs/tree/master/example/js/threejs).

## Usage

Simply clone [three.js](https://github.com/mrdoob/three.js/) and run auto-modulite.js.

```
> git clone https://github.com/mrdoob/three.js.git

> mkdir build
> cp three.js/src/* build/

> wget https://raw.github.com/zfedoran/modulite-threejs/master/auto-modulite.js
> node auto-modulite.js build/
```

## Example
The following minecraft <a href="http://zfedoran.github.com/modulite-threejs/example/index.html">demo</a> was generated using the auto-modulite.js build script. Have a look at the <a href="https://github.com/zfedoran/modulite-threejs/blob/master/example/js/webgl_geometry_minecraft_ao.js">js</a> and <a href="https://github.com/zfedoran/modulite-threejs/blob/master/example/index.html">html</a> files. The [original](http://mrdoob.github.com/three.js/) minecraft sample can be found on the three.js repository.

<a href="http://zfedoran.github.com/modulite-threejs/example/index.html"><img width="30%" src="https://github.com/zfedoran/modulite-threejs/raw/master/example/images/webgl_geometry_minecraft_ao.png"></a>