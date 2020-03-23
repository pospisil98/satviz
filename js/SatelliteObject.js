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
    constructor(id, satelliteRecord, tle) {
        this.id = id;
        this.tle = tle;
        this.satelliteRecord = satelliteRecord;
        this.time = null;

        this.description = this.getDescription();
        this.modelPath = models[this.description];
        this.materialPath = materials[this.description];
        this.texturePath = textures[this.description];

        this.position = [0.0, 0.0, 0.0];
        this.positionEci = null;
        this.scale = scales[this.description];
        this.rotation = rotations[this.description];
        this.velocity = {}; 
    }

    getDescription = () => {
        if (this.id in descriptions) {
            return descriptions[this.id];
        } else {
            return "DEFAULT";
        }
    }

    updatePosition  = (datetime) => {
        let propagation = satellite.propagate(this.satelliteRecord, datetime);

        this.time = datetime;
        this.velocity = propagation.velocity;
        this.positionEci = propagation.position;
        this.position = this.mapPositionToRange(propagation.position);
    }

    mapPositionToRange = (value) => {
        const denominator = 100000;

        x = this.clampCoord(value.x/denominator);
        y = this.clampCoord(value.y/denominator);
        z = this.clampCoord(value.z/denominator);       

        return [x, y, z];
    }

    formatSelectedDataForModal = (data) => {
        let formated = {};
        formated.id = data.id.toString(); // NORAD ID
        formated.intlDes = data.intlDes.toString(); // INTL DESIGNATOR (year, number of launch, piece of launch)
        formated.apogee = data.apogee.toFixed(2).toString() + ' km';
        formated.perigee = data.perigee.toFixed(2).toString() + ' km';
        formated.inclination = this.deg_to_dms(this.radians_to_degrees(data.inclination));
        formated.latitude = this.deg_to_dms(data.positionGeodetic.latitude);
        formated.longitude = this.deg_to_dms(data.positionGeodetic.longitude);
        formated.height = data.positionGeodetic.height.toFixed(2).toString() + ' km';
        formated.velocity = data.velocity.toFixed(2).toString() + ' km/s';
        formated.period = data.period.toFixed(0).toString() + ' min';

        return formated;
    }

    getDataForInfoModal = () => {
        let data = {};
        data.id = this.id;
        data.intlDes = this.getIntlDes();
        data.inclination  = this.satelliteRecord.inclo;  //rads
        data.eccentricity = this.satelliteRecord.ecco;
        data.raan         = this.satelliteRecord.nodeo;   //rads
        data.argPe        = this.satelliteRecord.argpo;  //rads
        data.meanMotion   = this.satelliteRecord.no * 60 * 24 / (2 * Math.PI);     // convert rads/minute to rev/day
        
        data.semiMajorAxis = Math.pow(8681663.653 / data.meanMotion, (2/3));
        data.semiMinorAxis = data.semiMajorAxis * Math.sqrt(1 - Math.pow(data.eccentricity, 2));   
        data.apogee = data.semiMajorAxis * (1 + data.eccentricity) - 6371;
        data.perigee = data.semiMajorAxis * (1 - data.eccentricity) - 6371;
        data.period = 1440.0 / data.meanMotion;


        let gmst = satellite.gstime(new Date(this.time));
        data.positionGeodetic = satellite.eciToGeodetic(this.positionEci, gmst);

        data.velocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2) + Math.pow(this.velocity.z, 2));

        return this.formatSelectedDataForModal(data);
    }

    clampCoord = (value) => {
        const earthStart = 0.003;

        if (value > 0) {
            return (value + earthStart);
        } else {
            return (value - earthStart);
        }
    }
    
    getIntlDes = () => {
        let des = '';

        let year = this.tle[0].substring(9,11);
        let prefix = (year > 50) ? '19' : '20';
        year = prefix + year;

        let rest = this.tle[0].substring(11,16);
        des = year + '-' + rest;   

        return des;
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
        return ("" + d + "° " + m + "' " + s + "\"");
     }

     radians_to_degrees = (radians) => {
        return radians * (180/Math.PI);
    }
}