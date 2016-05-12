# tet-node-client

A Node.js client for The Eye Tribe eye-tracker.



# Install (Not yet)

    $ npm install eyetribe-client



# Usage

    var EyeTribeClient = require('eyetribe-client');
    var eye = new EyeTribeClient();

    eye.activate({
      host: 'localhost',
      port: 6555,
      mode: 'push',
      version: 1
    });

    eye.on('gazeUpdate', function (x, y) {
      // do cool stuff
    });

    eye.on('connected', function () {
      // connected to tracker server
    });

    eye.on('disconnected', function (err) {
      // err not null if disconnected because of an error.
    });

Get tracker state values asynchronously:

    eye.activate({...}, function (err) {
      if (err) { console.error('Connection failed.'); return; }

      eye.getScreen(function (err, screen) {
        if (err) { console.error(err); return; }

        console.log(screen.index); // 1
        console.log(screen.resolution.width); // 1920 (px)
        console.log(screen.resolution.height); // 1080
        console.log(screen.physical.width); // 0.29 (m)
        console.log(screen.physical.height); // 0.18
      });
    });



# Calibration (Not yet)

    eye.calibrate({
      numPoints: 20,
      beforePoint: function (err, index, start, abort) {
        // Here, decide the point location and draw a point to focus to.
        ...

        // Tell tracker the point location and start measuring.
        setTimeout(function () {
          start(x, y);
        }, 1000);
      },
      startPoint: function (err, index, end, abort) {
        // Determine how long the measuring lasts and do possible some
        // graphical effects to keep eyes fixed to the point.
        ...

        // Tell tracker to end measuring.
        setTimeout(function () {
          end();
        }, 1000);
      },
      afterPoint: function (err, index, then, abort) {
        // Here, remove the old point
        ...

        // Begin a new measure or jump to results if was last.
        setTimeout(then, 1000);
      },
      afterCalibration: function (err, calibrationResults) {

      }
    });



# API

## EyeTribeClient()

    var eye = new EyeTribeClient();


### .activate([options], [onConnectedCb(err)])

    eye.activate({ mode: 'pull'}, function (err) {
      if (err) {
        console.error('Tracker could not be activated.');
      }
      else {
        console.log('Tracker activated.');
      }
    });

Options are optional, defaults are:

    {
      host: 'localhost',
      port: 6555,
      mode: 'push',
      version: 1
    }

The optional callback `onConnectedCb(err)` will be called once. If activation has been successful `err` is `null`.


### .deactivate([onDisconnectedCb()])

    eye.deactivate(function () {
      // Tracker deactivated
    });

Succeeds always.


### .getFrameRate(callback(err, framerate))

    eye.getFrameRate(function (err, framerate)) {
      // framerate, number, e.g. 30
    });


### .getLastCalibrationResult(callback(err, calib))

    eye.getLastCalibrationResult(function (err, calib)) {
      // calib.result, bool, was calibration successful
      // calib.deg, number, average error in degrees
    });

For full list of available properties, see [Eye Tribe Documentation](http://dev.theeyetribe.com/api/#cat_calib).


### .getScreen(callback(err, screen))

    eye.getScreen(function (err, screen) {
      //
    });

An example screen object

    {
      index: 1,
      resolution: {
        width: 1440,
        height: 900
      },
      physical: {
        width: 290,
        height: 180
      }
    }


### .getTrackerState(callback(err, stateInteger))

    eye.getTrackerState(function (err, state) {
      // 0 = tracker device is connected
      // 1 = tracker device is not connected
      // 2 = tracker connected but has unsupported unsupported firmware
      // 3 = tracker connected via insufficient USB connection
      // 4 = tracker detected but data cannot be transmitted
    });


### .isActivated()

    if (eye.isActivated()) {
      // Tracker is active.
    }



# Run tests

    $ npm run test



# Versioning

[Semantic Versioning 2.0.0](http://semver.org/)



# License

[MIT License](../blob/master/LICENSE)
