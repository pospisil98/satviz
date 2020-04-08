var satellite = require('satellite.js');

export default class CoordConverter {
    constructor() {
        this.cities = [
            "schriever",
            "vandenberg",
            "cape",
            "ascension",
            "diego",
            "kwajalein",
            "hawaii",
            "greenland",
            "hampshire",
            "britain",
            "guam",
            "alaska",
            "washington",
            "ecuador",
            "uruguay",
            "africa",
            "bahrain",
            "korea",
            "australia",
            "zealand"
        ];

        this.latitudes = {
            "schriever": 38.800487,
            "vandenberg": 34.751841,
            "cape": 28.491770,
            "ascension": -7.943064,
            "diego": -7.315041,
            "kwajalein": 8.720267,
            "hawaii": 20.491747,
            "greenland": 76.515851,
            "hampshire": 43.845083,
            "britain": 51.901636,
            "guam": 13.419102,
            "alaska": 61.777863,
            "washington": 38.921486,
            "ecuador": -0.975709,
            "uruguay": -33.352731,
            "africa": -19.392172,
            "bahrain": 26.015521,
            "korea": 37.129097,
            "australia": -33.805079,
            "zealand": -41.957162
        };
        this.longitudes = {
            "schriever": -104.522903,
            "vandenberg": -120.520696,
            "cape": -80.578600,
            "ascension": -14.372331,
            "diego": 72.444928,
            "kwajalein": 167.729290,
            "hawaii": -157.294502,
            "greenland": -68.739511,
            "hampshire": -71.669399,
            "britain": -1.440593,
            "guam": 144.741369,
            "alaska": -146.905346,
            "washington": -77.066804,
            "ecuador": -78.587049,
            "uruguay": -56.024181,
            "africa": 23.563274,
            "bahrain": 50.537233,
            "korea": 127.773009,
            "australia": 138.480160,
            "zealand": 173.842508
        };
    }

    convert = () => {
        let geodetic = {
            longitude: satellite.degreesToRadians(),
            latitude: satellite.degreesToRadians(),
            height: 0.8
        };

        let ecf = satellite.geodeticToEcf(geodetic);
        
        let gmst = satellite.gstime(new Date());
        let eci = satellite.ecfToEci(ecf, gmst);

        let result = {}
        let date = new Date()
        this.cities.forEach(element => {
            let geodetic = {
                longitude: satellite.degreesToRadians(this.longitudes[element]),
                latitude: satellite.degreesToRadians(this.latitudes[element]),
                height: 0.8
            };

            let ecf = satellite.geodeticToEcf(geodetic);
            let gmst = satellite.gstime(date);
            let eci = satellite.ecfToEci(ecf, gmst);

            result[element] = eci;
        });

        console.log(JSON.stringify(result));
    }
}