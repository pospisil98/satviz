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
            satellites: []
        }
        this.time = new Date();
        this.ST = new SpaceTrack();

        this.loading = false;

        // start update positions every second
        this.moveTimer = setInterval(this.updatePositions, 500);

        this.clock = new Clock();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.satelliteIDs !== prevProps.satelliteIDs && prevProps.satelliteIDs) {
            let difference = this.props.satelliteIDs.filter(x => !prevProps.satelliteIDs.includes(x));
            let sats = [];

            if (difference.length > 0) {
                // call ST funtion to get data according to newly added IDs
                this.loading = true;
                let data = await this.ST.testBothAsync(difference);

                this.tle = SpaceTrack.convertTLEStringToArray(data);
                sats = this.parseData();
            }

            keptFromCurrentObjects = this.state.satellites.filter(sat => this.props.satelliteIDs.includes(sat.id));

            this.setState({ satellites: [...sats, ...keptFromCurrentObjects] })
        }

        if (this.props.timeScale !== prevProps.timeScale) {
            this.clock.stop();
            this.clock.speed(this.props.timeScale).time(this.clock.time());
            this.clock.start();
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


            copy.forEach((sat) => {
                // sat.updatePosition(new Date(Date.now()));
                sat.updatePosition(new Date(this.clock.time()));
            });

            this.setState({ satellites: copy });
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
        /*
            used only for debug purposes
        showMessage({
            message: "Clicked on sat wit ID: " + id,
            type: "info",
          });
        */

        this.props.satelliteClickCallback(this.selectSatelliteObjectById(id));
    }

    getSatellitesToRender = () => {
        let modelList;

        if (!this.loading) {
            modelList = this.state.satellites.map((sat) => {
                return (
                    <Viro3DObject
                        key={sat.id}
                        source={sat.modelPath}
                        resources={[
                            sat.materialPath,
                            sat.texturePath
                        ]}
                        position={sat.position}
                        scale={sat.scale}
                        rotation={sat.rotation}
                        type="OBJ"

                        highAccuracyEvents={true}
                        onClick={() => {
                            this.onModelClick(sat.id);
                        }}
                    />
                )
            })
        }

        return modelList;
    }

    renderFlatTargetGlobe = () => {
        let modelList = this.getSatellitesToRender();

        return (
            <ViroNode position={[0, 0.2, 0]}>
                <ViroAmbientLight color="#FFFFFF" />

                <Viro3DObject source={require('../res/earth.obj')}
                    resources={[require('../res/earth.mtl'),
                        require('../res/earth_texture.png')]}
                    position={[0.0, 0.0, 0.0]}
                    scale={[0.025, 0.025, 0.025]}
                    rotation={[180, 0, -180]}
                    type="OBJ"
                />

                {modelList}
            </ViroNode>
        );
    }

    renderGlobeTargetGlobe = () => {
        let modelList = this.getSatellitesToRender();

        return (
            <ViroNode position={[0, 0, 0]}>
                <ViroAmbientLight color="#FFFFFF" />

                {/*<Viro3DObject source={require('../res/earth.obj')}
                    resources={[require('../res/earth.mtl'),
                        require('../res/earth_texture.png')]}
                    position={[0.0, 0.0, 0.0]}
                    scale={[0.08, 0.08, 0.08]}
                    rotation={[180, 0, -180]}
                    type="OBJ"
                />*/}

                <ViroSphere
                    heightSegmentCount={20}
                    widthSegmentCount={20}
                    radius={0.17}
                    position={[0, 0, 0]}
                    materials={["mat"]}
                />

                {modelList}
            </ViroNode>
        );
    }

    renderGlobe = () => {
        if (this.props.flatTarget) {
            return this.renderFlatTargetGlobe();
        } else {
            return  this.renderGlobeTargetGlobe();
        }
    }

    render() {
        return (
            <View>
                {this.renderGlobe()}
            </View>
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

ViroMaterials.createMaterials({
    green: {
        lightingModel: "Blinn",
        diffuseTexture: require('../res/green.jpg'),
    },
    red: {
        lightingModel: "Blinn",
        diffuseTexture: require('../res/red.jpg'),
    },
    earth: {
        lightingModel: "Blinn",
        diffuseTexture: require('../res/earth_texture.png'),
    },
    iss: {
        lightingModel: "Blinn",
        diffuseColor: '#6e6e6e'
    },
    mat: {

    }
});
