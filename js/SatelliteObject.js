'use-strict';

var descriptions = {
    25544: "ISS",
    
    24876: "GPS",
    25933: "GPS",
    26360: "GPS",
    26407: "GPS",
    26605: "GPS",
    27663: "GPS",
    27704: "GPS",
    28129: "GPS",
    28190: "GPS",
    28361: "GPS",
    28474: "GPS",
    28874: "GPS",
    29486: "GPS",
    29601: "GPS",
    32260: "GPS",
    32384: "GPS",
    32711: "GPS",
    35752: "GPS",
    36585: "GPS",
    37753: "GPS",
    38833: "GPS",
    39166: "GPS",
    39533: "GPS",
    39741: "GPS",
    40105: "GPS",
    40294: "GPS",
    40534: "GPS",
    40730: "GPS",
    41019: "GPS",
    41328: "GPS",
    43873: "GPS",


}

var models = {
    "ISS": require('./res/models/iss/ISS.glb'),
    "GPS": require('./res/models/gps/gps.obj'),
}

var materials = {
    "GPS": require('./res/models/gps/gps.mtl'),
}

var textures = {
    "GPS": require('./res/models/Satellite.mtl'),
}

var scales = {
    "ISS": [0.1, 0.1, 0.1],
    "GPS": [0.03, 0.03, 0.03],
    "DEFAULT": [0.0005, 0.0005, 0.0005],
}

var rotations = {
    "ISS": [0, 90, 0],
    "GPS": [0.0, 0.0, 0.0],
    "DEFAULT": [0.0, 0.0, 0.0],
}

var modelTypes = {
    "ISS": "GLB",
    "GPS": "OBJ",
}

var satellite = require('satellite.js');

export default class SatelliteObject {
    constructor(id, satelliteRecord, tle) {
        this.id = id;
        this.tle = tle;
        this.satelliteRecord = satelliteRecord;
        this.time = null;

        this.description = this.getDescription();
        this.modelPath = models[this.description];
        this.modelType = modelTypes[this.description];
        this.resources = this.getResources();

        this.position = [0.0, 0.0, 0.0];
        this.positionEci = null;
        this.scale = scales[this.description];
        this.rotation = rotations[this.description];
        this.velocity = {};
    }

    getResources = () => {
        let material = this.getMaterialPath();
        let texture = this.getTexturePath();

        let resources = [];

        if (material !== null) {
            resources.push(material);
        }

        if (texture !== null) {
            resources.push(texture);
        }

        return resources;
    }

    getMaterialPath = () => {
        if (this.description in materials) {
            return materials[this.description];
        } else {
            return null;
        }
    }

    getTexturePath = () => {
        if (this.description in textures) {
            return textures[this.description];
        } else {
            return null;
        }
    }

    getDescription = () => {
        if (this.id in descriptions) {
            return descriptions[this.id];
        } else {
            return "DEFAULT";
        }
    }

    updatePosition = (datetime) => {
        let propagation = satellite.propagate(this.satelliteRecord, datetime);

        this.time = datetime;
        this.velocity = propagation.velocity;
        this.positionEci = propagation.position;
        this.position = this.mapPositionToRange(propagation.position);
    }

    mapPositionToRange = (value) => {
        const denominator = 25000;
        const base = 10000;

        x = value.x / denominator;
        y = value.y / denominator;
        z = value.z / denominator;

        /*
        x = Math.log(Math.abs(value.x)) / Math.log(base);
        y = Math.log(Math.abs(value.y)) / Math.log(base);
        z = Math.log(Math.abs(value.z)) / Math.log(base);

        value.x < 0 ? x = -x : x = x;
        value.y < 0 ? y = -y : y = y;
        value.z < 0 ? z = -z : z = z; */

        // conversion from eci to viro coords
        return [y, z, x];   
    }

    formatSelectedDataForModal = (data) => {
        let formated = {};
        formated.id = data.id.toString(); // NORAD ID
        formated.intlDes = data.intlDes.toString(); // INTL DESIGNATOR (year, number of launch, piece of launch)
        formated.apogee = data.apogee.toFixed(2).toString() + ' km';
        formated.perigee = data.perigee.toFixed(2).toString() + ' km';
        formated.inclination = this.deg_to_dms(this.radians_to_degrees(data.inclination));
        formated.latitude = satellite.degreesLat(data.positionGeodetic.latitude).toFixed(3);
        formated.longitude = satellite.degreesLong(data.positionGeodetic.longitude).toFixed(3);
        formated.height = data.positionGeodetic.height.toFixed(2).toString() + ' km';
        formated.velocity = data.velocity.toFixed(2).toString() + ' km/s';
        formated.period = data.period.toFixed(0).toString() + ' min';

        return formated;
    }

    getDataForInfoModal = () => {
        let data = {};
        data.id = this.id;
        data.intlDes = this.getIntlDes();
        data.inclination = this.satelliteRecord.inclo;  //rads
        data.eccentricity = this.satelliteRecord.ecco;
        data.raan = this.satelliteRecord.nodeo;   //rads
        data.argPe = this.satelliteRecord.argpo;  //rads
        data.meanMotion = this.satelliteRecord.no * 60 * 24 / (2 * Math.PI);     // convert rads/minute to rev/day

        data.semiMajorAxis = Math.pow(8681663.653 / data.meanMotion, (2 / 3));
        data.semiMinorAxis = data.semiMajorAxis * Math.sqrt(1 - Math.pow(data.eccentricity, 2));
        data.apogee = data.semiMajorAxis * (1 + data.eccentricity) - 6371;
        data.perigee = data.semiMajorAxis * (1 - data.eccentricity) - 6371;
        data.period = 1440.0 / data.meanMotion;


        let gmst = satellite.gstime(new Date(this.time));
        data.positionGeodetic = satellite.eciToGeodetic(this.positionEci, gmst);

        data.velocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2) + Math.pow(this.velocity.z, 2));

        return this.formatSelectedDataForModal(data);
    }

    getOrbitTime = () => {
        return (1440.0 / this.satelliteRecord.no * 60 * 24 / (2 * Math.PI));
    }

    getPointsForOrbit = (numSegments, currentDate) => {
        // in minutes
        let orbitPeriod = 1440.0 / (this.satelliteRecord.no * 60 * 24 / (2 * Math.PI)); 
        let timeStep = orbitPeriod / numSegments;

        let startDate = new Date(currentDate);
        startDate.setMinutes(currentDate.getMinutes() - (orbitPeriod / 2));
    

        let positions = [];
        for (let i = 0; i <= numSegments; i++) {
            let date = new Date(startDate);
            date.setMinutes(startDate.getMinutes() + (i * timeStep));
            let position = satellite.propagate(this.satelliteRecord, date).position;

            positions.push(this.mapPositionToRange(position))
        }

        positions.push(positions[0]);

        return positions;
    }

    getIntlDes = () => {
        let des = '';

        let year = this.tle[0].substring(9, 11);
        let prefix = (year > 50) ? '19' : '20';
        year = prefix + year;

        let rest = this.tle[0].substring(11, 16);
        des = year + '-' + rest;

        return des;
    }

    /* https://stackoverflow.com/questions/5786025/decimal-degrees-to-degrees-minutes-and-seconds-in-javascript/5786627#5786627 */
    deg_to_dms = (deg) => {
        var d = Math.floor(deg);
        var minfloat = (deg - d) * 60;
        var m = Math.floor(minfloat);
        var secfloat = (minfloat - m) * 60;
        var s = Math.round(secfloat);
        // After rounding, the seconds might become 60. These two
        // if-tests are not necessary if no rounding is done.
        if (s == 60) {
            m++;
            s = 0;
        }
        if (m == 60) {
            d++;
            m = 0;
        }
        return ("" + d + "° " + m + "' " + s + "\"");
    }

    radians_to_degrees = (radians) => {
        return radians * (180 / Math.PI);
    }
}