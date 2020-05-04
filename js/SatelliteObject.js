/** 
 *  @fileOverview Representation of object behind satellite. 
 *
 *  @author       Vojtěch Pospíšil
 */

"use strict";

/**
* Dictionary of satellite desciption used in other functions.
* @constant
*
* @type {Object<string, string>}
*/
const descriptions = {
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

/**
* Dictionary of special satellite model requirements.
* @constant
*
* @type {Object<string, NodeRequire>}
*/
const models = {
    "ISS": require('./res/models/iss/ISS.glb'),
    "GPS": require('./res/models/gps/gps.obj'),
}

/**
* Dictionary of special satellite model material requirements.
* @constant
*
* @type {Object<string, NodeRequire>}
*/
const materials = {
    "GPS": require('./res/models/gps/gps_mat.mtl'),
}

/**
 * Dictionary of special satellite model material requirements.
 * @constant
 *
 * @type {Object<string, NodeRequire>}
 */
const textures = {
    "GPS": require('./res/models/Satellite_mat.mtl'),
}

/**
 * Dictionary of satellite model scales.
 * @constant
 *
 * @type {Object<string, Array.<number>>}
 */
const scales = {
    "ISS": [0.1, 0.1, 0.1],
    "GPS": [0.03, 0.03, 0.03],
    "DEFAULT": [0.0005, 0.0005, 0.0005],
}

/**
 * Dictionary of satellite model rotation.
 * @constant
 *
 * @type {Object<string, Array.<number>>}
 */
const rotations = {
    "ISS": [0, 90, 0],
    "GPS": [0.0, 0.0, 0.0],
    "DEFAULT": [0.0, 0.0, 0.0],
}

/**
 * Dictionary of satellite model types (extensions).
 * @constant
 *
 * @type {Object<string, string>}
 */
const modelTypes = {
    "ISS": "GLB",
    "GPS": "OBJ",
}

var satellite = require('satellite.js');

/**
 * Object representing space satellite.
 */
export default class SatelliteObject {

    /**
     * Constructs a satelite object with given properties.
     * 
     * @param {string} id ID of satellite from Satellite Catalog
     * @param {Object} satelliteRecord Satellite record of satellite from satellite.js
     * @param {string} tle String version of TLE record
     */
    constructor(id, satelliteRecord, tle) {
        /** ID of satellite in satellite catalog
         *  @type {string} */
        this.id = id;
        /** TLE record of satellite 
         * @type {string} */
        this.tle = tle;
        /** Satellite record from satellite.js 
         * @type {Object} */
        this.satelliteRecord = satelliteRecord;
        /** Time of last satellite position 
         * @type {Object} */
        this.time = null;

        /** Description of satellite type 
         * @type {string} */
        this.description = this.getDescription();
        /** Require of satellite 3D model
         *  @type {NodeRequire}*/
        this.modelPath = models[this.description];
        /** Model type (extension) 
         * @type {string} */
        this.modelType = modelTypes[this.description];
        /** All requirements of satellite 3D model 
         * @type {Array<NodeRequire>} */
        this.resources = this.getResources();

        /** Remmaped position of satellite in Viro Coords 
         * @type {Array<number>} */
        this.position = [0.0, 0.0, 0.0];
        /** Position of satellite in ECI coords 
         * @type {Array<number>} */
        this.positionEci = null;
        /** Scale of satellite model 
         * @type {Array<number>} */
        this.scale = scales[this.description];
        /** Rotation of satellite model
         *  @type {Array<number>} */
        this.rotation = rotations[this.description];
        /** Velocity of satellite model in XYZ direction 
         * @type {Object<string, number>} */
        this.velocity = {};
    }

    /**
     * Gathers all needed resources for satellite model.
     * 
     * @returns {Array<NodeRequire>} Array of all satellite model additional requirements.
     */
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

    /**
     * Returns material needed by model specified in material dict.
     * 
     * @returns {NodeRequire} Requirement or null when nothing special is needed.
     */
    getMaterialPath = () => {
        if (this.description in materials) {
            return materials[this.description];
        } else {
            return null;
        }
    }

    /**
     * Returns texture needed by model specified in texture dict.
     * 
     * @returns {NodeRequire} Requirement or null when nothing special is needed.
     */
    getTexturePath = () => {
        if (this.description in textures) {
            return textures[this.description];
        } else {
            return null;
        }
    }

    /**
     * Returns desciption string of model specified in description dict.
     * 
     * @returns {string} Description or DEFAULT if not defined.
     */
    getDescription = () => {
        if (this.id in descriptions) {
            return descriptions[this.id];
        } else {
            return "DEFAULT";
        }
    }

    /**
     * Updates satellite position to position in given time.
     * 
     * @param {Object} datetime Javascript date object.
     */
    updatePosition = (datetime) => {
        let propagation = satellite.propagate(this.satelliteRecord, datetime);

        this.time = datetime;
        this.velocity = propagation.velocity;
        this.positionEci = propagation.position;
        this.position = this.mapPositionToRange(propagation.position);
    }

    /**
     * Remaps position value into displayable values in coords used by viro react.
     * 
     * @param {Array<number>} value Position in [X, Y, Z] format.
     * 
     * @returns {Array<number>} Remapped position in [Y, Z, X] format (Viro coords).
     */
    mapPositionToRange = (value) => {
        const denominator = 25000;
        const base = 10000;

        let x = value.x / denominator;
        let y = value.y / denominator;
        let z = value.z / denominator;

        /*
        x = Math.log(Math.abs(value.x)) / Math.log(base);
        y = Math.log(Math.abs(value.y)) / Math.log(base);
        z = Math.log(Math.abs(value.z)) / Math.log(base);

        value.x < 0 ? x = -x : x = x;
        value.y < 0 ? y = -y : y = y;
        value.z < 0 ? z = -z : z = z; */

        // conversion from eci to viro coords
        return [x, z, -y];
    }

    /**
     * Formats given data to strings with correct units.
     * 
     * @param {Object<string, any>} data Dictionary with data to be formated.
     * 
     * @returns {Object<string, string>} Dictionary with data correctly formated for display. 
     */
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

    /**
     * Calculates data needed in information modal window.
     * 
     * @returns {Object<string, any>} Dictionary of formated data for usage directly in info modal
     */
    getDataForInfoModal = () => {
        let data = {};
        data.id = this.id;
        data.intlDes = this.getIntlDes();
        data.inclination = this.satelliteRecord.inclo;  // Rads
        data.eccentricity = this.satelliteRecord.ecco;
        data.raan = this.satelliteRecord.nodeo;   // Rads
        data.argPe = this.satelliteRecord.argpo;  // Rads
        data.meanMotion = this.satelliteRecord.no * 60 * 24 / (2 * Math.PI);     // Convert rads/minute to rev/day

        data.semiMajorAxis = Math.pow(8681663.653 / data.meanMotion, (2 / 3));
        data.semiMinorAxis = data.semiMajorAxis * Math.sqrt(1 - Math.pow(data.eccentricity, 2));
        data.apogee = data.semiMajorAxis * (1 + data.eccentricity) - 6371;
        data.perigee = data.semiMajorAxis * (1 - data.eccentricity) - 6371;
        data.period = 1440.0 / data.meanMotion;

        // Geodetic position requires GMST time (http://en.wikipedia.org/wiki/Sidereal_time#Definition)
        let gmst = satellite.gstime(new Date(this.time));
        data.positionGeodetic = satellite.eciToGeodetic(this.positionEci, gmst);

        data.velocity = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2) + Math.pow(this.velocity.z, 2));

        return this.formatSelectedDataForModal(data);
    }

    /**
     * Calculates orbit time of satellite in minutes
     * 
     * @returns {number} Orbit time in minutes
     */
    getOrbitTime = () => {
        return (1440.0 / this.satelliteRecord.no * 60 * 24 / (2 * Math.PI));
    }

    /**
     * Calculates points through one satellite orbit in future (first point is duplicatedat the edn of array).
     * 
     * @param {number} numSegments Number of points (segments) in one orbit.
     * @param {any} currentDate Current date / starting date of orbit. 
     * 
     * @returns {Array<Array<number>>} Array of [x, y, z] positions of points.
     */
    getPointsForOrbit = (numSegments, currentDate) => {
        // in minutes
        let orbitPeriod = 1440.0 / (this.satelliteRecord.no * 60 * 24 / (2 * Math.PI));
        let timeStep = orbitPeriod / numSegments;

        let startDate = new Date(currentDate);

        let positions = [];
        for (let i = 0; i <= numSegments; i++) {
            let date = new Date(startDate);
            // Move date by one "segment duration"
            date.setMinutes(startDate.getMinutes() + (i * timeStep));

            let position = satellite.propagate(this.satelliteRecord, date).position;
            positions.push(this.mapPositionToRange(position))
        }

        // Repeat first point at the end because of ViroPolyline
        positions.push(positions[0]);

        return positions;
    }

    /**
     * Composes International Designator of satellite.
     * 
     * @returns {string} ITLDES of satellite
     */
    getIntlDes = () => {
        let des = '';

        let year = this.tle[0].substring(9, 11);
        let prefix = (year > 50) ? '19' : '20';
        year = prefix + year;

        let rest = this.tle[0].substring(11, 16);
        des = year + '-' + rest;

        return des;
    }

    /**
     * Converts degrees to d° m' s" format.
     * https://stackoverflow.com/questions/5786025/decimal-degrees-to-degrees-minutes-and-seconds-in-javascript/5786627#5786627
     * 
     * @param {number} deg Value in degrees
     * 
     * @returns {string} Formated degree value (d° m' s")
     */
    deg_to_dms = (deg) => {
        var d = Math.floor(deg);
        var minfloat = (deg - d) * 60;
        var m = Math.floor(minfloat);
        var secfloat = (minfloat - m) * 60;
        var s = Math.round(secfloat);
        // After rounding, the seconds might become 60. These two if-tests are not necessary if no rounding is done.
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

    /**
     * Converts radian value to degree value.
     * 
     * @param {number} radians Value in radians
     * 
     * @returns {number} Value in degrees
     */
    radians_to_degrees = (radians) => {
        return radians * (180 / Math.PI);
    }
}