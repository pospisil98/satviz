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
        this._id = id;
        this._satelliteRecord = satelliteRecord;

        this._description = this.getDescription();
        this._modelPath = models[this._description];
        this._materialPath = materials[this._description];
        this._texturePath = textures[this._description];

        this._position = [0.0, 0.0, 0.0];
        this._scale = scales[this._description];
        this._rotation = rotations[this._description];
        

        // bind this to functions
        this.getDescription = this.getDescription.bind(this);
        this.updatePosition = this.updatePosition.bind(this);
        this.mapPositionToRange = this.mapPositionToRange.bind(this);
        this.clampCoord = this.clampCoord.bind(this);
    }

    get id() { return this._id; }
    set id(value) { this._id = value; }

    get satelliteRecord() { return this._satelliteRecord; }
    set satelliteRecord(value) { this._satelliteRecord = value; }

    get description() { return this._description; }
    set description(value) { this._description = value; }

    get modelPath() { return this._modelPath; }
    set modelPath(value) { this._modelPath = value; }

    get materialPath() { return this._materialPath; }
    set materialPath(value) { this._materialPath = value; }
    
    get texturePath() { return this._texturePath; }
    set texturePath(value) { this._texturePath = value; }

    get position() { return this._position; }
    set position(value) { this._position = value; }

    get scale() { return this._scale; }
    set scale(value) { this._scale = value; }
    
    get rotation() { return this._rotation; }
    set rotation(value) { this._rotation = value; }


    getDescription() {
        if (this.id in descriptions) {
            return descriptions[this.id];
        } else {
            return "DEFAULT";
        }
    }

    updatePosition(datetime) {
        var newPosition = satellite.propagate(this._satelliteRecord, datetime).position;
        var recalc = this.mapPositionToRange(newPosition);

        //console.log("NEW POS");
        //console.log(recalc);

        this._position = recalc;
    }

    mapPositionToRange(value) {
        const denominator = 100000;

        x = this.clampCoord(value.x/denominator);
        y = this.clampCoord(value.y/denominator);
        z = this.clampCoord(value.z/denominator);       

        return [x, y, z];
    }

    clampCoord(value) {
        const earthStart = 0.0;

        if (value > 0) {
            return (value + earthStart);
        } else {
            return (value - earthStart);
        }
    }
}