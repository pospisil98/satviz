const CREDENTIALS = {
    username: 'pospivo1@fel.cvut.cz',
    password: '!6cpBH97VSniwT8'
}

const API = {
    dataFirst: 'https://www.space-track.org/basicspacedata/query/class/tle/format/tle/NORAD_CAT_ID/',
    dataSecond: '/orderby/TLE_LINE1 ASC/limit/',

    loginURL: 'https://www.space-track.org/ajaxauth/login',
}

export default class SpaceTrack {
    constructor() {
        this.loggedIn = false;
        this.loginInProgress = false;
    }

    async testBothAsync(idArray) {
        idString = SpaceTrack.convertIDs(idArray);

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

    static convertIDs(IDs) {
        //console.log("Converting array to comma separated values.")

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