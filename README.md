## Synopsis

**EyeNav** is a Brackets.io plugin that allows you to do simple navigation in the editor using an eye-tracking device. It allows you to scroll, click, select text, and more using your eyes and keyboard shortcuts.

## Demo

A video demo of EyeNav is available on [YouTube](www.youtube.com).

## Installation

As EyeNav itself is a Brackets.io extension, the plugin is delivered through the [Brackets.io Extension Registry](https://brackets-registry.aboutweb.com/). 

After installing EyeNav from the extension manager, there are 2 more steps left to navigating code with your eyes!

* Install the SDK for the eye tracker you own.
* Install/Run the websocket server that wraps the SDK for the eye tracker you own.

There are currently 2 popular eye trackers aimed at the mass market, and we provide a websocket server for both of them.

#### EyeTribe 
Install information can be found at: [EyeTribe Getting Started](http://dev.theeyetribe.com/start/). 
WebSocket Server can be found at: 

#### Tobii EyeX
Install information can be found at: [Tobii EyeX Getting Started](http://developer.tobii.com/eyex-setup/). 
WebSocket Server can be found at: 

#### Simulator
If, for any reason, you want to use a simulator for the servers above, you can find it at:

You can also easily create a websocket server by yourself for the device of your choice and start using EyeNav. You can refer to the code for either Tobii EyeX and EyeTribe to get an idea how they are implemented and the data format EyeNav expects from the servers.

## Usage

After installing EyeNav and the dependencies as described above, it is time to start using it! EyeNav will be located in the right-side bar menu (look for an eye!). Before running EyeNav, you should run the eye tracker server and the websocket servers. The menu icon is color coded, so it gives you immediate feedback on the state of EyeNav. EyeNav can be in one of the following states:

* **Gray**: EyeNav is not activated
* **Red**: EyeNav is activated, but it isn't/cannot connect to the websocket server.
* **Green**: EyeNav is connected to the server, but it isn't getting valid gaze data(or no data at all)
* **Blue**: EyeNav is getting gaze data and it is ready to use.

If everything works well, you can start the magic just by pressing some keyboard shortcuts:

LIST ALL SHORTCUTS HERE. A KEYBOARD PICTURE WILL DO

## Architecture

In order to make EyeNav as flexible and extensible as possible, we decided to make the eye tracker and EyeNav talk through Web Sockets (see figure below). This means EyeNav can work for any eye tracker as long as you create a wrapper over its SDK.

FIGURE!!

## Preferences

You can change the key shortcuts and the port and address of the websocket server by modifying the Brackets.io preferences file. 

If you wish to change the port and ip address of the websocket server, you can use the following options (the one below are the default options):

"eyeNav.ipAddress": "127.0.0.1",
"eyeNav.port": 8887

You can also change the keyboard shortcuts for each command. In order to see which keys are possible, please refer to the [KeyManager](src/keyManager.js) file. Even though the keys are separated in 3 objects depending on their function, you can treat them as one when writing your desired options. In order to get the keyCode and location you can use the following [JsBin](http://jsbin.com/gidigi/1). btnName is used just for reference so there isn't a right format in specifying it as of now. Note that Brackets.io has some limitations on [which keys can be used](https://github.com/adobe/brackets/wiki/User-Key-Bindings). An example keys option would be (you must use double quotes):

"eyeNav.keys": {
  "commandToggle":{
    "keyCode": 18,
    "location": [2],
    "btnName": "rightAlt"
  },
  "click": {
    "keyCode": 81,
    "location": [0],
    "btnName": "Q"
  }
}

## Contributors

If anyone is interested in improving EyeNav and contributing, please contact me directly. If there is some interest I will create a guide on how to contribute, but it is not necessary at this stage. You can report any bugs or feature requests at: 

## License

This project is under the [MIT Licence](LICENSE)
