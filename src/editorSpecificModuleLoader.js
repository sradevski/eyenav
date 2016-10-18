define(function (require, exports, module) {
  'use strict';

//TODO: Check if it can be loaded like this.
  //This function loads the appropriate module based on the editor where EyeNav is running.
  function loadModule(moduleName){
    var env = 'brackets.io'
    var folderLocation;

    switch(env){
      case 'atom.io':
        folderLocation = './atomio/';
        break;
      case 'brackets.io':
        folderLocation = './bracketsio/';
        break;
    }
      return require(folderLocation + moduleName);
  }

  exports.loadModule = loadModule;
});
