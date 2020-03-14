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

    clampCoord = (value) => {
        const earthStart = 0.0;

        if (value > 0) {
            return (value + earthStart);
        } else {
            return (value - earthStart);
        }
    }
}