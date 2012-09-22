modulite.js
===========

Modulite.js is a simple and lightweight javascript module loader.


**Example**

    
    ml.module('game.camera')
    .requires(
      'game.level',
      'game.entity',
      'game.enemies.sponge',
      'game.enemies.spike',
      'assets.loader',
      'math')
    .defines(function(){
      // ... code for this module
    });