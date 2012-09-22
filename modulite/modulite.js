/*
 * Modulite.js v0.0.2
 * http://github.com/zfedoran/modulite.js
 *
 * Modulite.js is free software: you can redistribute it and/or modify
 * it under the terms of the MIT license.
 *
 * Copyright (C) 2012 - Zelimir Fedoran
 *
 */

(function(root){

  // Base modulite object
  var modulite = root.modulite = root.ml = {
    version : '0.0.2',
  };

  // Base library path for modules, set this using the public function
  var _basePath = ''
    
    // Modules which have been required but not yet added to the DOM
    , _currentlyLoading = {}

    // Module definitions which have been loaded but not necessarily executed
    , _loadedModuleDefinitions = {}

    // Modules which have had their callback function executed
    , _executedModules = {}

    // The number of modules which are waiting to be added to the DOM
    , _numWaitingOnDefLoad = 0

    // The number of modules which are waiting to have their callback fired
    , _numWaitingToExecute = 0

    // The current module definition in a ml.module().requires().define() block
    , _currentModuleDef = null

    // A list of all executed module callbacks sorted by order of dependencies
    , _callbackStack = [];

  // This function sets the base library path for all of your modules
  modulite.libraryPath = function(path){
    _basePath = path;
    return this;
  }

  // This function begins a new module
  modulite.module = function(name){
    if(_currentModuleDef)
      throw('Error: Module "' + _currentModuleDef.name 
        + '" does not call defines()');

    _currentModuleDef = { name : name, dependencies : {}, callback : null };
    return this;
  }

  // This function sets the dependencies for the current module definition
  modulite.requires = function(){
    if(!_currentModuleDef)
      throw('Error: Must call module() before calling requires()');

    _currentModuleDef.dependencies = Array.prototype.slice.call(arguments);
    return this;
  }

  // This function sets the callback to execute once all of the dependencies
  // for this module have been loaded
  modulite.defines = function(callback){
    if(!_currentModuleDef)
      throw('Error: Must call module() before calling defines()');

    _currentModuleDef.callback = callback;
    _loadedModuleDefinitions[_currentModuleDef.name] = _currentModuleDef;
    
    // This function would only be called once the module has been added to
    // the DOM. Once the script tag has been added, we are no longer loading
    // this module. It has finished loading. However, it still needs to be
    // executed once all of its dependencies are accounted for.
    if(_currentlyLoading[_currentModuleDef.name])
      delete _currentlyLoading[_currentModuleDef.name];
    
    _numWaitingToExecute++;
    
    _currentModuleDef = null;
    
    // Check if we can load or execute any modules at this time
    _resolveDependencies();
    return this;
  }

  // Get a list of all executed module callbacks sorted by dependencies.
  // This is supplied for debugging purposes, but it can be used to minify
  // the applicaiton into a single Javascript file.
  modulite.getCallbackStack = function(){
    return _callbackStack;
  }

  // This function does most of the hard work in determining which modules to 
  // load and execute. It will throw an error if no modules are being waited
  // on but not all modules have been executed.
  function _resolveDependencies(){
    var wereAnyModulesLoaded = false;

    // Iterate over all currently loaded module definitions
    for (var moduleName in _loadedModuleDefinitions){
      var module = _loadedModuleDefinitions[moduleName];
      var allModuleDependenciesLoaded = true;

      // Iterate over all of the dependencies for the current module
      for (var i = 0; i < module.dependencies.length; i++) {
        var dependencyName = module.dependencies[i];

        // Has this dependency been fully loaded yet?
        if(!_executedModules[dependencyName])
          allModuleDependenciesLoaded = false;

        // Has this dependency been loaded into the DOM yet?
        if(!_loadedModuleDefinitions[dependencyName]){
          _loadModuleDefinitionFor(dependencyName, moduleName);
        }
      }

      // If all of the dependencies for this module have been executed
      // we can safely execute this module
      if(allModuleDependenciesLoaded && !_executedModules[moduleName]){
        _executeModule(module);
        wereAnyModulesLoaded = true; 
        _numWaitingToExecute--;       
      }
    }

    // If we are still waiting on modules to execute but are not doing anything
    // we must have an unresolved module reference
    if(wereAnyModulesLoaded){
      _resolveDependencies();      
    } else if(_numWaitingOnDefLoad == 0 && _numWaitingToExecute > 0) {
        throw('Error: Unresolved module reference (circular dependencies?)');
    }
  }

  // This function does the work necessary to load a module script into the DOM
  // However, it does not actually execute the module callback.
  function _loadModuleDefinitionFor(name, requiredBy){
    if(_currentlyLoading[name])
      return;

    var path = _basePath + name.replace(/\./g, '/') + '.js';
    _numWaitingOnDefLoad++;
    _currentlyLoading[name] = path;
    _loadScript({ 
      url : path, 
      onSuccess: function(){
        _numWaitingOnDefLoad--; 
        _resolveDependencies();
      }, 
      onError: function(){
        throw ('Error: Failed to load module [' + name + '] at ['  
          + path + '] ' + 'required by [' + requiredBy + ']');
      }
    });
  }

  // This funciton will create a new script tag for the module and download the
  // module definition
  function _loadScript(options){
    // Adding the script tag to the head
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = options.url;

    // Then bind the event to the callback function 
    // there are several events for cross browser compatibility
    script.onreadystatechange = options.onSuccess;
    script.onload = options.onSuccess;
    script.onerror = options.onError;

    // Tell the browser to load the script
    head.appendChild(script);
  }

  // This function adds the module to the executed modules object and executes 
  // the modules callback function
  function _executeModule(module){
    _executedModules[module.name] = module;
    
    console.log('Loading Module [' + module.name + ']');
    if(module.callback){
      module.callback();

      // Push the module callback onto the callback stack
      // This is useful for debugging purposes
      _callbackStack.push(module.callback);
    }
  }

  return modulite;
})(this);




