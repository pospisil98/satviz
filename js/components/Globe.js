'use-strict';

import React, { Component } from 'react';
import {
    View,
} from 'react-native';

import {
    ViroMaterials,
    ViroNode,
    Viro3DObject,
    ViroAmbientLight,
    ViroSphere,
    ViroBox,
    ViroPolyline,
} from 'react-viro';

import SpaceTrack from '../SpaceTrack';
import SatelliteObject from '../SatelliteObject';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";


var satellite = require('satellite.js');
var Clock = require('timetravel').Clock;

export default class Globe extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingDisplay: true,
            position: [-0.1, 0.1, 0.1],
            phi: 0,
            satellites: [],
            currentSatelliteIDs: [],
            excludedOrbits: [],
            orbitOpacity: 0.8,
            groundRotationCompensation: [0, 0, 0]
        }

        this.modelListRotation = [0, 0, 0];
        if (this.props.flatTarget) {
            this.modelListRotation = [0, -143, 0];
        } else {
            this.modelListRotation = [0, -173, 0];
        }

        this.time = new Date();
        this.ST = new SpaceTrack();

        this.loading = false;

        this.orbitSegmentCount = 100;
        this.orbitTimestamps = {};
        this.orbitPoints = {};

        this.clock = new Clock();

        // start update positions every second
        this.moveTimer = setInterval(this.updatePositions, 100);

        this.rotationTimer = setInterval(this.updateRotation, 30);
        this.lastRotationTime = this.clock.time();
    }

    async componentDidUpdate(prevProps, prevState) {
        let propIDs;
        if (this.props.satelliteIDs) {
            propIDs = this.props.satelliteIDs.map(id => {
                return ("00000" + id.toString()).slice(-5);
            });
        }

        let areIDsSame = (propIDs.length === this.state.currentSatelliteIDs.length) && propIDs.every(value => this.state.currentSatelliteIDs.includes(value));

        if (!areIDsSame && this.loading === false) {
            let addition = propIDs.filter(x => !this.state.currentSatelliteIDs.includes(x));

            let sats = [];

            if (addition.length > 0) {
                // call ST funtion to get data according to newly added IDs
                this.loading = true;
                let data = await this.ST.testBothAsync(addition);

                this.tle = SpaceTrack.convertTLEStringToArray(data);
                sats = this.parseData();
            }

            keptFromCurrentObjects = this.state.satellites.filter(sat => propIDs.includes((sat.id).toString()));
            
            let curr = [...sats, ...keptFromCurrentObjects].map(sat => (sat.id).toString());

            this.setState({ 
                satellites: [...sats, ...keptFromCurrentObjects],
                currentSatelliteIDs: curr,
            })
        }

        if (this.props.timeScale !== prevProps.timeScale) {
            this.clock.stop();
            this.clock.speed(this.props.timeScale).time(this.clock.time());
            this.clock.start();
        }

        if (this.props.orbitIDs !== prevProps.orbitIDs) {
            this.setState({
                excludedOrbits: [...this.props.orbitIDs],
            });
        }

        if (this.props.orbitOpacity !== prevProps.orbitOpacity) {
            this.setState({
                orbitOpacity: this.props.orbitOpacity,
            });
        }
    }

    parseData = () => {
        //gather new satellite objects
        satelliteObjects = this.convertTLEtoSatelliteObjectCollection();
        this.loading = false;

        return satelliteObjects;
    }

    updatePositions = () => {
        if (this.state.satellites.length > 0) {
            let copy = [...this.state.satellites]

            let removeIDs = [];

            copy.forEach((sat) => {
                try {
                    sat.updatePosition(new Date(this.clock.time()));
                } catch (error) {
                    removeIDs.push(sat.id);
                    this.props.removeSatelliteCallback(sat.id);
                }
            });

            let cleaned = [...copy];
            removeIDs.forEach(id => {
                cleaned = cleaned.filter(sat => sat.id !== id);
            });

            this.setState({ satellites: cleaned });
        }
    }

    updateRotation = () => {
        const rotationPerSecond = 0.00417807901;

        let now = this.clock.time();
        let difference = (now - this.lastRotationTime);

        let additionalRotation = difference * (rotationPerSecond / 1000);

        let rotation = (-this.state.groundRotationCompensation[1] + additionalRotation);
        rotation = rotation % 360;

        if (rotation > 1) {
            this.setState({
                groundRotationCompensation: [0, -rotation, 0],
            });

            this.lastRotationTime = now;
        }
    }

    convertTLEtoSatelliteObjectCollection = () => {
        var tleIndex = 0;
        var idIndex = 0;
        var satrec;
        var satelliteObjects = [];

        for (tleIndex = 0; tleIndex < this.tle.length - 1; tleIndex += 2) {
            satrec = satellite.twoline2satrec(this.tle[tleIndex], this.tle[tleIndex + 1]);
            satelliteObjects.push(new SatelliteObject(satrec.satnum, satrec, [this.tle[tleIndex], this.tle[tleIndex + 1]]))
            idIndex += 1;
        }

        return satelliteObjects;
    }

    selectSatelliteObjectById = (id) => {
        return this.state.satellites.filter((sat) => {
            return sat.id == id;
        })
    }

    onModelClick = (id) => {
        this.props.satelliteClickCallback(this.selectSatelliteObjectById(id));
    }

    getMaterialForGroundSegment = (segmentID) => {
        if (segmentID === 11) {
            return "red";
        } else if (segmentID === 12) {
            return "gold";
        } else if (segmentID >= 13 && segmentID <= 16) {
            return "green";
        } else if (segmentID >= 21 && segmentID <= 26) {
            return "blue";
        } else if (segmentID >= 31 && segmentID <= 37) {
            return "yellow";
        } else if (segmentID >= 41 && segmentID <= 50) {
            return "purple";
        }
    }

    getPositionForGroundSegment = (segmentID) => {
        let denominator;

        if (this.props.flatTarget) {
            denominator = 80000;
        } else {
            denominator = 38500;
        }

        let city = groundSegmentIDtoCity[segmentID];
        let coordsOriginal = groundSegmentEciCoords[city];

        x = coordsOriginal.x / denominator;
        y = coordsOriginal.y / denominator;
        z = coordsOriginal.z / denominator;

        // conversion from eci to viro coords
        return [y, z, x];
    }

    getGroundSegmentToRender = () => {
        let segmentList;

        if (!this.loading) {
            segmentList = this.props.groundSegmentIDs.map((segmentID) => {
                let materialName = this.getMaterialForGroundSegment(segmentID);
                let position = this.getPositionForGroundSegment(segmentID);

                return (
                    <ViroSphere
                        key={segmentID}
                        heightSegmentCount={10}
                        widthSegmentCount={10}
                        radius={0.008}
                        position={position}
                        materials={[materialName]}
                    />
                );
            });
        }

        return segmentList;
    }

    getSatellitesToRender = () => {
        let modelList;

        if (!this.loading) {
            modelList = this.state.satellites.map((sat) => {
                if (sat.description === "DEFAULT") {
                    return (
                        <ViroSphere
                            key={sat.id}
                            heightSegmentCount={10}
                            widthSegmentCount={10}
                            radius={0.01}
                            position={sat.position}
                            materials={["gray"]}

                            highAccuracyEvents={false}
                            onClick={() => {
                                this.onModelClick(sat.id);
                            }}

                            renderingOrder={10}
                        />
                    );
                }

                return (
                    <Viro3DObject
                        key={sat.id}
                        source={sat.modelPath}
                        resources={sat.resources}
                        position={sat.position}
                        scale={sat.scale}
                        rotation={sat.rotation}
                        type={sat.modelType}

                        highAccuracyEvents={false}
                        onClick={() => {
                            this.onModelClick(sat.id);
                        }}
                        
                        renderingOrder={10}
                    />
                )
            });
        }

        return modelList;
    }

    shouldUpdateOrbit = (satID, orbitTime) => {
        if (!(satID in this.orbitTimestamps)) {
            return true;
        }

        let maxtime = new Date(this.orbitTimestamps[satID]);
        maxtime.setMinutes(maxtime.getMinutes() + orbitTime);

        if (this.clock.time() > maxtime) {
            return true;
        }

        return false;
    }

    getOrbitsToRender = () => {
        let orbitList;

        if (!this.loading) {
            orbitList = this.state.satellites.map((sat) => {
                let orbitTime = sat.getOrbitTime();
                if (!this.state.excludedOrbits.includes(sat.id)) {
                    let positions;
                    
                    if (this.shouldUpdateOrbit(sat.id, orbitTime)) {
                        positions = sat.getPointsForOrbit(this.orbitSegmentCount, new Date(this.clock.time()));
                                            
                        this.orbitPoints[sat.id] = positions;
                        this.orbitTimestamps[sat.id] = this.clock.time();
                    } else {
                        positions = this.orbitPoints[sat.id];
                    }

                    return (
                        <ViroPolyline
                            key={sat.id}
                            position={[0, 0, 0]}
                            points={positions}
                            thickness={0.001}
                            materials={"red"}
                            opacity={this.state.orbitOpacity}
                        />
                    );
                }
            });
        }

        return orbitList;
    }

    renderFlatTargetGlobe = () => {
        let modelList = this.getSatellitesToRender();
        let groundSegmentList = this.getGroundSegmentToRender();
        let orbitsList = this.getOrbitsToRender();

        return (
            <ViroNode position={[0, 0.2, 0]}>
                <ViroAmbientLight color="#FFFFFF" intensity={2000} temperature={4000} />

                <Viro3DObject source={require('../res/earth.obj')}
                    resources={[require('../res/earth.mtl'),
                    require('../res/earth_texture.png')]}
                    position={[0.0, 0.0, 0.0]}
                    scale={[0.04, 0.04, 0.04]}
                    rotation={[180, 180, -180]}
                    type="OBJ"
                />

                <ViroNode rotation={this.modelListRotation}>
                    {groundSegmentList}

                    <ViroNode rotation={this.state.groundRotationCompensation}>
                        {modelList}
                        {orbitsList}
                    </ViroNode>
                </ViroNode>
            </ViroNode>
        );
    }

    renderVirtualGlobe = () => {
        if (this.props.renderVirtualGlobe) {
            return (
                <Viro3DObject source={require('../res/earth.obj')}
                    resources={[require('../res/earth.mtl'),
                    require('../res/earth_texture.png')]}
                    position={[0.0, 0.0, 0.0]}
                    scale={[0.08, 0.08, 0.08]}
                    rotation={[180, -150, -180]}  // rotated that africa is towards camera
                    type="OBJ"
                />
            );
        } else {
            /* 
            <ViroSphere
                        heightSegmentCount={20}
                        widthSegmentCount={20}
                        radius={0.17}
                        position={[0, 0, 0]}
                        materials={["gray"]}
                        renderingOrder={-1}
                        opacity={0.3}
                    />
            */
            return (
                <ViroNode>
                    <ViroSphere
                        heightSegmentCount={20}
                        widthSegmentCount={20}
                        radius={0.17}
                        position={[0, 0, 0]}
                        materials={["occlusive"]}
                        renderingOrder={-1}
                    />

                    <Viro3DObject source={require('../res/ghostEarth/untitled.obj')}
                        resources={[require('../res/ghostEarth/untitled.mtl'),
                        require('../res/ghostEarth/untitled.png')]}
                        position={[0.0, 0.0, 0.0]}
                        scale={[0.18, 0.18, 0.18]}
                        rotation={[0, -175, 0]}  // rotated that africa is towards camera
                        type="OBJ"
                        opacity={0.3}
                    />
                </ViroNode>
            );
        }
    }

    renderGlobeTargetGlobe = () => {
        let modelList = this.getSatellitesToRender();
        let groundSegmentList = this.getGroundSegmentToRender();
        let orbitsList = this.getOrbitsToRender();

        return (
            <ViroNode>
                <ViroAmbientLight color="#FFFFFF" />

                {this.renderVirtualGlobe()}

                <ViroNode rotation={this.modelListRotation}>
                    {groundSegmentList}

                    <ViroNode rotation={this.state.groundRotationCompensation}>
                        {modelList}
                        {orbitsList}
                    </ViroNode>
                </ViroNode>
            </ViroNode>
        );
    }

    renderGlobe = () => {
        if (this.props.flatTarget) {
            return this.renderFlatTargetGlobe();
        } else {
            return this.renderGlobeTargetGlobe();
        }
    }

    render() {
        return (
            <ViroNode>
                {this.renderGlobe()}
            </ViroNode>
        );
    }

    // test function used for circular movement
    moveFunc = () => {
        var R = 0.5;

        var X = R * Math.cos(this.state.phi)
        var Y = R * Math.sin(this.state.phi)

        var temp = this.state.phi + 0.01;

        this.setState(prevState => ({
            phi: temp,
            position: [X, 0, Y]
        }));
    }
}

var groundSegmentEciCoords = {
    "schriever": { "x": 3910.3096787548093, "y": 3080.3510329695946, "z": 3975.5813422691904 },
    "vandenberg": { "x": 4856.790504752817, "y": 1985.1370670602403, "z": 3615.737268949631 },
    "cape": { "x": 2619.008345543573, "y": 4961.851777391096, "z": 3024.8968340995298 },
    "ascension": { "x": -3922.7604262692257, "y": 4952.862829619637, "z": -875.6544312352279 },
    "diego": { "x": -5170.553732498662, "y": -3647.0385227647125, "z": -806.8053933403049 },
    "kwajalein": { "x": 4093.666061017764, "y": -4796.201022830874, "z": 960.7141097469664 },
    "hawaii": { "x": 5786.235355097538, "y": -1500.9790587172447, "z": 2219.0532011295636 },
    "greenland": { "x": 410.97339412324754, "y": 1434.4349979707606, "z": 6181.170740804261 },
    "hampshire": { "x": 1493.91674263956, "y": 4359.107545377384, "z": 4396.24767788034 },
    "britain": { "x": -3078.574521370201, "y": 2465.378033770742, "z": 4996.687333000982 },
    "guam": { "x": 1865.487956036825, "y": -5918.882386479585, "z": 1470.730166121755 },
    "alaska": { "x": 3016.4701519528826, "y": -219.03495480709444, "z": 5597.555648180364 },
    "washington": { "x": 2046.1450152058833, "y": 4528.634340221239, "z": 3986.0421024686416 },
    "ecuador": { "x": 2779.402343452063, "y": 5740.560921023602, "z": -107.89682911058405 },
    "uruguay": { "x": 304.42572961808673, "y": 5325.040877018454, "z": -3487.141934869165 },
    "africa": { "x": -5848.400376263067, "y": 1424.0113052546715, "z": -2104.612547103142 },
    "bahrain": { "x": -5582.67664844856, "y": -1318.6034421675904, "z": 2780.958250256032 },
    "korea": { "x": 46.677236661753795, "y": -5091.781885528575, "z": 3829.3084077342232 },
    "australia": { "x": 1033.5451370010423, "y": -5204.347927342779, "z": -3528.946706348021 },
    "zealand": { "x": 3451.4932197311496, "y": -3264.5169253457175, "z": -4242.601519256618 }
}

var groundSegmentIDtoCity = {
    11: "schriever",
    12: "vandenberg",
    13: "cape",
    14: "ascension",
    15: "diego",
    16: "kwajalein",

    21: "hawaii",
    22: "schriever",
    23: "cape",
    24: "ascension",
    25: "diego",
    26: "kwajalein",

    31: "greenland",
    32: "hampshire",
    33: "vandenberg",
    34: "hawaii",
    35: "britain",
    36: "diego",
    37: "guam",

    41: "alaska",
    42: "washington",
    43: "ecuador",
    44: "uruguay",
    45: "britain",
    46: "africa",
    47: "bahrain",
    48: "korea",
    49: "australia",
    50: "zealand"
}

ViroMaterials.createMaterials({
    gray: {
        shininess: 2.0,
        lightingModel: "Lambert",
        diffuseColor: "#A9A9A9",
    },
    earth: {
        lightingModel: "Blinn",
        diffuseTexture: require('../res/earth_texture.png'),
    },
    iss: {
        lightingModel: "Blinn",
        diffuseColor: '#6e6e6e'
    },
    occlusive: {
        diffuseColor: "#FFFFFFFF",
        colorWriteMask: ["None"],
    },
    red: {
        lightingModel: "Blinn",
        diffuseColor: '#AF0606'
    },
    gold: {
        lightingModel: "Blinn",
        diffuseColor: '#FFC300'
    },
    green: {
        lightingModel: "Blinn",
        diffuseColor: '#06AF48'
    },
    blue: {
        lightingModel: "Blinn",
        diffuseColor: '#067EAF'
    },
    yellow: {
        lightingModel: "Blinn",
        diffuseColor: '#F4F71A'
    },
    purple: {
        lightingModel: "Blinn",
        diffuseColor: '#7504AC'
    }
});
