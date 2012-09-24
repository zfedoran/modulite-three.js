modulite.js
===========

Modulite.js is a lightweight javascript module loader.


**Usage**

```javascript
ml.module(
  'game.some-file'
)
.requires(
  'core.vector3',
  'core.matrix',
  'core.camera3d',
  'game.enemies.tank',
  'assets.loader',
  'math.helper'
)
.defines(function(){
  // ... code for this module
});
```

**Baking**

Once you have finished your project, you can bake all of your files into a single file using the modulite `bakeCurrentStack()` function.

```javascript
ml.bakeCurrentStack();
```

**Example**

For a complete sample project, check out <a href="https://github.com/zfedoran/modulite-threejs">modulite-threejs</a>.