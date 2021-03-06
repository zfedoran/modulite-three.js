/*
 * auto-modulite.js v0.0.1
 * https://github.com/zfedoran/modulite-threejs
 *
 * Modulite.js is free software: you can redistribute it and/or modify
 * it under the terms of the MIT license.
 *
 * Copyright (C) 2012 - Zelimir Fedoran
 *
 */

var fs = require('fs');
var exec = require('child_process').exec;
var pathUtil = require('path');

var args = process.argv.splice(2);

if(args.length<1){
  console.log('\nUsage: node auto-modulite.js <path_to_source>\n');
  console.log('\t<path_to_source>: The path to the "three.js/src/" directory\n');
  return;
}

var pathToSrcDir = args[0];
var namespace = 'three/';

// regex to remove /**/ style single line comments
// without double escape: /\/\*/,/\*\//{s/\/\*.*\*\///g}
var removeSingleLineComments = '/\\/\\*/,/\\*\\//{s/\\/\\*.*\\*\\///g};';

// regex to remove /**/ style multi line comments
// without double escape: /\/\*/,/\*\//{d};
var removeMultiLineComments = '/\\/\\*/,/\\*\\//{d};';

// regex to remove // style single line comments
// without double escape: s/\/\/.*$//g
var removeDoubleSlashComments = 's/\\/\\/.*$//g'; 

var removeCommentsRegex = removeSingleLineComments 
                    +';'+ removeMultiLineComments
                    +';'+ removeDoubleSlashComments;

// regex to remove all lines which do NOT contain "THREE.<something>"
// without double escape: /THREE\.[^. ]+/!d
var onlyLinesWithReferences = '/THREE\\.[^. ]+/!d';

// regex to keep only the name of the referenced object
// without double escape: s/^.*THREE\.([a-Z0-9_$]+).*$/\1/
var onlyReferencedObjectName = 's/^.*THREE\\.([a-Z0-9_$]+).*$/\\1/';

// regex to remove all lines which do NOT contain "THREE.<something> = "
// without double escape: /THREE\.[^. ]+\s*=[^=]/!d
var onlyLinesWithDefines = '/THREE\\.[^. ]+\\s*=[^=]/!d';

// regex to keep only the name of the defined object
// without double escape: s/^.*THREE\.([^. ]+)\s*=[^=].*$/\1/
var onlyDefinedObjectName = 's/^.*THREE\\.([^. ]+)\\s*=[^=].*$/\\1/';

// map of object names which should be linked manually 
// (they don't fit the standard patterns)
var manualRoutes = {
  // REVISION is defined in a funny way inside Three.js (the file)
  // FrontSide is also defined in Three.js, so we will use it instead
  // (this choice was random, any other object in Three.js would work too)
  'REVISION':'FrontSide',
  // All of the Three.js files require the THREE object, to keep our regex 
  // simple, we can simply map THREE to any object inside the Three.js file
  'THREE':'FrontSide',
};

// map of objects which should not be included in the list of required objects
var manualObjectExcludes = {
  //Object3D requires Scene, Scene requires Object3D
  'Object3D': {'Scene':1}
};

// map of patches to apply after processing all the files
var manualFilePatches = {
  // The THREE object becomes locally scoped with modulite
  // We need to make it global again by removing 'var'
  'Three': [{
    pattern:'var THREE = THREE ||',
    patch:'THREE ='
  }]
};

function getAllFiles(path, callback) {
  exec('find ' + path + ' -type f', function(err, stdout, stderr) {
    var results = stdout.trim().split('\n'); 
    callback(err, results);
  });
}

function getAllDefinedModules(path, callback) {
  var regex = removeCommentsRegex 
        +';'+ onlyLinesWithDefines 
        +';'+ onlyDefinedObjectName;
  var command = 'sed -E -e "'+regex+'" ' + path;
  exec(command, function(err, stdout, stderr) {
    var results = stdout.trim().split('\n'); 
    results = removeDuplicatesAndEnforceRoutes(results);
    callback(err, results);
  });
}

function getAllReferences(path, callback) {
  var regex = removeCommentsRegex 
        +';'+ onlyLinesWithReferences 
        +';'+ onlyReferencedObjectName;
  var command = 'sed -E -e "'+regex+'" ' + path;
  exec(command, function(err, stdout, stderr) {
    var filename = pathUtil.basename(path,'.js');
    var results = stdout.trim().split('\n');
    //All Three.js objects require THREE
    results.push('THREE'); 
    results = removeDuplicatesAndEnforceRoutes(results);
    results = removeExcludedObjects(filename, results);
    callback(err, results);
  });
}

function parallelAsyncForEach(array, fn, callback) {
  var completed = 0;
  if(array.length === 0) {
    callback();
  }
  var len = array.length;
  for(var i = 0; i < len; i++) {
    fn(array[i], function() {
      completed++;
      if(completed === array.length) {
        callback();
      }
    });
  }
}

function findExternalDependencies(references, defines) {
  var out = [], external = {}, i;
  for (i = 0; i < references.length; i++) external[references[i]] = true;
  for (i = 0; i < defines.length; i++) {
    if(external[defines[i]])
      delete external[defines[i]];
  }
  for (i in external) out.push(i);
  return out;
}

function removeDuplicatesAndEnforceRoutes(arr) {
  var i, len = arr.length, out = [], obj = {};
  for (i = 0; i < len; i++) { obj[arr[i]] = 0; }
  for (i in obj) {
    if(!manualRoutes[i]) { out.push(i) }
    else { out.push(manualRoutes[i]); }
  }
  return out;
}

function removeExcludedObjects(filename, arr) {
  var excluded = manualObjectExcludes[filename];
  var i, len = arr.length, out = [];
  for (i = 0; i < len; i++) {
    var obj = arr[i];
    if(!excluded || !excluded[obj])
      out.push(obj);
  }
  return out;
}

function convertPathToModule(path){
  return path.replace(pathToSrcDir, namespace)
             .replace('.js','')
             .replace(/\//g,'.');
}

function getFileData(path, callback) {
  var data = {};
  getAllReferences(path, function(err, references) {
    if(err) { throw err; }
    data.references = references;
    getAllDefinedModules(path, function(err, defines) {
      if(err) { throw err; }
      data.defines = defines;
      data.external = findExternalDependencies(references, defines);
      callback(null, data);
    });
  });
}

function getAllData(path, callback) {
  getAllFiles(path, function(err, files) {
    if(err) { throw err; }
    var library = {};
    parallelAsyncForEach(
      files, 
      function(file, callback) {
        getFileData(file, function(err, data) {
          if(err) { throw err; }
          library[file] = data;
          callback();
        });
      },
      function() {
        callback(null, library);
      });
  });
}

function findModulePathInLibrary(name, library) {
  for(var path in library){
    var module = library[path];
    for (var i = module.defines.length - 1; i >= 0; i--) {
      if(module.defines[i] == name)
        return path;
    }
  }
}

function applyFilePatches(path, data){
  var filename = pathUtil.basename(path,'.js');
  var patches = manualFilePatches[filename];
  if(patches){
    for(var i = 0; i<patches.length; i++){
      var patch = patches[i];
      data = data.replace(patch.pattern, patch.patch);
    }
  }
  return data;
}

// All the work is done here
getAllData(pathToSrcDir, function(err, library) {
  // build list of required paths for each file
  for(var path in library) {
    var module = library[path];
    module.requiredPaths = {};
    for (var i = module.external.length - 1; i >= 0; i--) {
      var dependency = module.external[i];
      module.requiredPaths[findModulePathInLibrary(dependency, library)] = dependency;
    }
  }
  // build the modulite define structure for each file
  for(var path in library) {
    var module = library[path];

    var closure = function(path, module){
      fs.readFile(path, 'UTF-8', function (err, data) {
        if (err) throw err;

        var delimiter = "',\n          '";
        var dependencies = [];
        for (var i in module.requiredPaths) 
          dependencies.push(convertPathToModule(i));
        dependencies.sort();
        dependencies = "'" + dependencies.join(delimiter) + "'";

        var template = "ml"
        + ".module('{MODULE}')\n"
        + (dependencies.length>2?".requires({DEPENDENCIES})\n":'')
        + ".defines(function(){\n\n{DATA}\n\n});";

        data = applyFilePatches(path, data);

        template = template.replace('{MODULE}', convertPathToModule(path));
        template = template.replace('{DEPENDENCIES}', dependencies);
        template = template.replace('{DATA}', data);

        fs.writeFile(path, template, function (err) {
          if (err) throw err;
          console.log('saved: '+path);
        });
      });
    };
    closure(path, module);
  }
});




