/** 
 *  @fileOverview Simple class for retrieving data from space-track.org website.
 *
 *  @author       Vojtěch Pospíšil
 */


 /**
 * Credentials used for logging in.
 * @constant
 *
 * @type {Object}
 */
const CREDENTIALS = {
    username: 'pospivo1@fel.cvut.cz',
    password: '!6cpBH97VSniwT8'
}

 /**
 * URL addreses used by space-track.org API.
 * @constant
 *
 * @type {Object}
 */
const API = {
    dataFirst: 'https://www.space-track.org/basicspacedata/query/class/tle/format/tle/NORAD_CAT_ID/',
    dataSecond: '/orderby/TLE_LINE1 ASC/limit/',

    loginURL: 'https://www.space-track.org/ajaxauth/login',
}

/**
 * A class representing space-track.org data getter.
 */
export default class SpaceTrack {
    /**
     * Takes array of satellite IDs and returns TLE records for them.
     * 
     * @async
     * @param {Array.<string>} idArray Array of satellite IDs
     * 
     * @returns {string} String of TLE records
     */
    getTLEs = async (idArray) => {
        idString = this.convertIDs(idArray);

        const request = new Request('https://www.space-track.org/ajaxauth/login', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                identity: CREDENTIALS.username,
                password: CREDENTIALS.password,
                query: "https://www.space-track.org/basicspacedata/query/class/tle_latest/ORDINAL/1/NORAD_CAT_ID/" + idString + "/orderby/TLE_LINE1 ASC/format/tle"
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        try {
            var response = await fetch(request);
            var data = await response.text();

            return data;
        } catch (error) {
            console.log("Something bad happened in await request process.");
            return null;
        }
    }

    /**
     * Takes array of IDs and converts them to comma separated values string
     * 
     * @param {Array.<string>} IDs - Satellite IDs 
     * 
     * @returns {string} Converted values
     */
    convertIDs = (IDs) => {
        ret = '';

        if (Array.isArray(IDs) && IDs.length > 0) {
            for (var i = 0; i < IDs.length; i++) {
                const element = IDs[i];

                ret += element;

                if (i != (IDs.length - 1)) {
                    ret += ',';
                }
            }
        }

        return ret;
    }
}