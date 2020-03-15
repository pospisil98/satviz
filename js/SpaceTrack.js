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

        // this.loginString = "identity=" + CREDENTIALS.username + "&password=" + CREDENTIALS.password;
        // console.log(this.loginString);
        // this.cookieJar = request.jar();
    }

    /*
    testLogin() {
        if (this.loggedIn) {
            console.log("Already logged in.");
            return true;
        }

        if (this.loginInProgress) {
            console.log("Currently logging in.");
            return false;
        }

        this.loginInProgress = true;

        console.log("Try to fetch login request");
        const request = new Request('https://www.space-track.org/ajaxauth/login', {
            method: 'POST',
            body: JSON.stringify({
                identity : CREDENTIALS.username,
                password : CREDENTIALS.password,
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
        });

        
        // console.log("Built request: ");
        // console.log(request);

        fetch(request)
            .then((response) => {
                console.log("Fetched");
                console.log("Fetch status = " + response.status);
                console.log(response);

                if (response.status && response.status === 200) {
                    this.loggedIn = true;
                    this.loginInProgress = false;
                    console.log("Nice, you're logged in!");
                    console.log(response.headers.map['set-cookie']);
                }
            })

            .catch((error) => {
                console.log("Something broke :(");
                console.error(error);
            }
        );

        this.loginInProgress = false;
    }

    testGetTLEs(options) {
        console.log("Want to get last TLEs.");
        var IDs = SpaceTrack.convertIDs(options);
        var IDcount = options.length;

        if (IDs === '') {
            console.log("Problem with TLEs array occured. (no TLE provided)")
            return false;
        }
        

        return this.testRequest(IDs, IDcount)
            .catch ((err) => {
                if (err.statusCode && err.statusCode === 401) {
                    console.log("Not logged in, logging in and repeating request.");
                
                    this.loggedIn = false;

                    return this.testLogin().then( this.testRequest(IDs, IDcount) );
                }
            });
    }

    testRequest(IDs, IDcount) {
        // if (this.loginInProgress) {
        //     console.log("Logging in, delay 250ms and try again.");
            
        //     setTimeout(() => { this.testRequest(IDs, IDcount) }, 250);
        //     return;
        // }

        // if ( !this.loggedIn ) {
        //     console.log("Not logged in, logging in and repeating request. (inside test request)");
        //     return this.testLogin().then( this.testRequest(IDs, IDcount) );
        // }

        const url = API.dataFirst + IDs + API.dataSecond + IDcount;
        const testURL = 'https://www.space-track.org/basicspacedata/query/class/tle/format/tle/NORAD_CAT_ID/25544/orderby/EPOCH%20desc/limit/1'
        const request = new Request(testURL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        console.log("Built request:");
        console.log(request);
        console.log("End of request.");

        fetch(request)
            .then((response) => {
                console.log("Fetched TLEs");
                console.log("Fetch status = " + response.status);
                console.log(response);
            })

            .catch((error) => {
                console.log("Something broke in getting TLEs");
                console.error(error);
            }
        );



    }

    
    getLastTLEs(options) {
        var IDs = SpaceTrack.convertIDs(options);
        if (IDs === '') {
            return false;
        }

        return this._getRequest.call(this, IDs)
        .catch(function (err) {
    
          // Not logged in / Session timed out
          if ( err.statusCode && err.statusCode === 401 ) {
            this.loggedIn = false;
            return this.login.call(this).then( this._getRequest.bind(this, IDs) );
          }
    
          throw err;
    
        }.bind(this))
    }

    _getRequest(options) {
        if ( this.loginInProgress ) {
            return delay(250).then( this._getRequest.bind(this, options) );
        }

        if ( !this.loggedIn ) {
            return this.login.call(this).then( this._getRequest.bind(this, options) );
        }

        return new Promise(function (resolve, reject) {

            var url = API.dataFirst + IDs + API.dataSecond;
        
            request(url, {
              jar: this.cookieJar,
              json: true
            }, function(err, res, body) {
        
              if ( !err && res.statusCode === 200 ) {
                return resolve(body);
              }
        
              if ( !err ) {
                err = new Error('HTTP Error ' + res.statusCode );
                err.statusCode = res.statusCode;
              }
        
              return reject(err);
            }.bind(this));
        }.bind(this));
    }

    login() {
        if (this.loggedIn) {
            return true;
        }

        if (this.loginInProgress) {
            return false;
        }

        this.loginInProgress = true;

        return new Promise(function (resolve, reject) {
            request.post(API.loginURL, {
                form: {
                    identity: CREDENTIALS.username,
                    password: CREDENTIALS.password
                },
                jar: this.cookieJar,
                json: true
            }, function (err, res, body) {
                if (!err && res.statusCode === 200 && body.Login !== 'Failed') {
                    this.logged = true;
                    this.logging = false;

                    console.log("SUCCESS");

                    return resolve(true);
                }
                
                console.log("FAIL");

                this.logged = false;
                this.logging = false;

                if ( body && body.Login === 'Failed' ) {
                err = new Error('Login Failed. Credentials not accepted.');
                } else if ( res ) {
                err = new Error('Login Failed. Got HTTP Error ' + res.statusCode + ' from SpaceTrack');
                err.statusCode = res.statusCode;
                }
                else {
                err = new Error(err.message);
                }

                reject(err);
            }.bind(this));
        }.bind(this));
    };
    */

    testBoth(idArray) {
        idString = SpaceTrack.convertIDs(idArray);

        console.log("Try to fetch request in testBoth");
        const request = new Request('https://www.space-track.org/ajaxauth/login', {
            method: 'POST',
            credentials : 'include',
            body: JSON.stringify({
                identity : CREDENTIALS.username,
                password : CREDENTIALS.password,
                query : "https://www.space-track.org/basicspacedata/query/class/tle_latest/ORDINAL/1/NORAD_CAT_ID/" + idString + "/orderby/TLE_LINE1 ASC/format/tle"
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
        });

        
        //console.log("Built request: ");
        //console.log(request);


        fetch(request)
            .then(response => response.text())
            // .then((text) => text.length ? JSON.parse(text) : {})
            .then((result) => {
                //console.log("Fetched");
                //console.log(result);

                return result;
            })
            .catch((error) => {
                console.log("Something broke :(");
                console.error(error);
            }
        );
    }

    async testBothAsync(idArray) {
        idString = SpaceTrack.convertIDs(idArray);

        const request = new Request('https://www.space-track.org/ajaxauth/login', {
            method: 'POST',
            credentials : 'include',
            body: JSON.stringify({
                identity : CREDENTIALS.username,
                password : CREDENTIALS.password,
                query : "https://www.space-track.org/basicspacedata/query/class/tle_latest/ORDINAL/1/NORAD_CAT_ID/" + idString + "/orderby/TLE_LINE1 ASC/format/tle"
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

        //console.log("IDs: " + ret);

        return ret;
    }

    static convertTLEStringToArray(string) {
        return string.split('\r\n');
    }

    static geodeticToEcef(lat, lon, elev) {
        const radius = 6378137;
        const flattening = 1/298.257223563;
        const ecc2 = (2 - flattening) * flattening;

        var h = elev === undefined ? 0 : elev;
        var rlat = lat / 180 * Math.PI;
        var rlon = lon / 180 * Math.PI;
        
        var slat = Math.sin(rlat);
        var clat = Math.cos(rlat);
        
        var N = radius / Math.sqrt(1 - ecc2 * slat*slat);
        
        var x = (N + h) * clat * Math.cos(rlon);
        var y = (N + h) * clat * Math.sin(rlon);
        var z = (N * (1 - ecc2) + h) * slat;
        return [ x, y, z ];
    }
}