'use-strict';

var descriptions = {
 //   25544: "ISS",
    28129: "GPS"
}

var models = {
    "ISS": require('./res/models/iss/ISS.obj'),
    "GPS": require('./res/models/gps/gps.obj'),
    "DEFAULT": require('./res/models/Satellite.obj')
}

var materials = {
    "ISS": require('./res/models/Satellite.mtl'),
    "GPS": require('./res/models/gps/gps.mtl'),
    "DEFAULT": require('./res/models/Satellite.mtl'),
}

var textures = {
    "ISS": require('./res/models/Satellite.mtl'),
    "GPS": require('./res/models/Satellite.mtl'),
    "DEFAULT": require('./res/models/Satellite.mtl'),
}

var scales = {
    "ISS": [0.001, 0.001, 0.001],
    "GPS": [0.01, 0.01, 0.01],
    "DEFAULT": [0.01, 0.01, 0.01],
}

var rotations = {
    "ISS": [0, 90, 0],
    "GPS": [0.0, 0.0, 0.0],
    "DEFAULT": [0.0, 0.0, 0.0],
}

var satellite = require('satellite.js');

export default class SatelliteObject {
    constructor(id, satelliteRecord) {
        this.id = id;
        this.satelliteRecord = satelliteRecord;

        this.description = this.getDescription();
        this.modelPath = models[this.description];
        this.materialPath = materials[this.description];
        this.texturePath = textures[this.description];

        this.position = [0.0, 0.0, 0.0];
        this.scale = scales[this.description];
        this.rotation = rotations[this.description];
    }

    getDescription = () => {
        if (this.id in descriptions) {
            return descriptions[this.id];
        } else {
            return "DEFAULT";
        }
    }

    updatePosition  = (datetime) => {
        var newPosition = satellite.propagate(this.satelliteRecord, datetime).position;
        var recalc = this.mapPositionToRange(newPosition);

        this.position = recalc;
    }

    mapPositionToRange = (value) => {
        const denominator = 100000;

        x = this.clampCoord(value.x/denominator);
        y = this.clampCoord(value.y/denominator);
        z = this.clampCoord(value.z/denominator);       

        return [x, y, z];
    }

    getDataForInfoModal = () => {
        let now = new Date();

        let positionAndVelocity = satellite.propagate(this.satelliteRecord, now);

        let positionEci = positionAndVelocity.position;
        let velocityEci = positionAndVelocity.velocity;

        let speed = Math.sqrt(velocityEci.x^2 + velocityEci.y^2 +velocityEci.z^2);

        let gmst = satellite.gstime(now);
        let positionGd    = satellite.eciToGeodetic(positionEci, gmst);

        let longitude = positionGd.longitude;
        let latitude  = positionGd.latitude;
        let height    = positionGd.height;

        let data = {
            velocity: speed.toFixed(2).toString() + " km/s",
            longitude: this.deg_to_dms(longitude),
            latitude: this.deg_to_dms(latitude),
            height: height.toFixed(2).toString() + " km",
        }

        return data;
    }

    clampCoord = (value) => {
        const earthStart = 0.0;

        if (value > 0) {
            return (value + earthStart);
        } else {
            return (value - earthStart);
        }
    }

    /* https://stackoverflow.com/questions/5786025/decimal-degrees-to-degrees-minutes-and-seconds-in-javascript/5786627#5786627 */
    deg_to_dms = (deg) => {
        var d = Math.floor (deg);
        var minfloat = (deg-d)*60;
        var m = Math.floor(minfloat);
        var secfloat = (minfloat-m)*60;
        var s = Math.round(secfloat);
        // After rounding, the seconds might become 60. These two
        // if-tests are not necessary if no rounding is done.
        if (s==60) {
          m++;
          s=0;
        }
        if (m==60) {
          d++;
          m=0;
        }
        return ("" + d + "° " + m + "' " + s + "''");
     }
}