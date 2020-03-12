'use-strict';

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity
} from 'react-native';

import {
    ViroMaterials,
    ViroNode,
    Viro3DObject,
    ViroAmbientLight,
  } from 'react-viro';

import SpaceTrack from '../SpaceTrack';
import SatelliteObject from '../SatelliteObject';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";


var satellite = require('satellite.js');

export default class Globe extends React.Component {
    constructor(props) {
        super(props);

        this.state =  { 
            loadingDisplay: true,
            loading: true,
            position: [-0.1, 0.1, 0.1],
            phi: 0,
            satelites: []
        }

        this.satelliteIDS = [
            25544, // ISS
            28129, // NAVSAT 54 GPS
            26483 
        ];

        this.time = new Date();
        this.ST = new SpaceTrack();

        // call ST funtion to get data according to IDs
        this.ST.testBothAsync(this.satelliteIDS)
            .then(data => {
                // after getting data from function save them into tle variable and unset loading flag
                this.tle = SpaceTrack.convertTLEStringToArray(data);
                this.setState(prevState => ({ loading: false }));
            });

        // function binding
        this.moveFunc = this.moveFunc.bind(this);
        this.parseData = this.parseData.bind(this);
        this.convertTLEtoSatrecCollection = this.convertTLEtoSatrecCollection.bind(this);
        this.updatePositions = this.updatePositions.bind(this);
    }

    // test function used for circular movement
    moveFunc() {
        var R = 0.5;

        var X = R * Math.cos(this.state.phi)
        var Y = R * Math.sin(this.state.phi)

        var temp = this.state.phi + 0.01;
         
        this.setState(prevState => ({ 
            phi: temp,
            position: [X, 0, Y]
        }));
    }

    componentDidMount() {
        // start timer which tries to parse data every 500 ms
        this.parseTimer = setInterval(this.parseData, 500);
    }

    parseData() {
        // check if we have data loaded
        if (!this.state.loading) {
            // stop running parse function
            clearInterval(this.parseTimer);

            this.convertTLEtoSatrecCollection();

            // start update positions every second
            this.moveTimer = setInterval(this.updatePositions, 30);   
            this.updatePositions(); 
        }
    }

    updatePositions() {
        this.setState(prevState => {
            const list = prevState.satelites.map(
                item => item.updatePosition(this.time)
                );
            return {
              list,
            };
          });

        // increase time for faster simulation
        this.time = new Date(this.time.getTime() + 10 * 6);
    }

    convertTLEtoSatrecCollection() {
        var tleIndex = 0;
        var idIndex = 0;
        var satrec;
        var satelliteObjects = [];

        for (tleIndex = 0; tleIndex < this.tle.length - 1; tleIndex += 2) {
            satrec = satellite.twoline2satrec(this.tle[tleIndex], this.tle[tleIndex + 1]);

            satelliteObjects.push(new SatelliteObject(this.satelliteIDS[idIndex], satrec))
            idIndex += 1;
        }

        this.setState(prevState => ({ satelites: [...satelliteObjects] }));
    }

    _onClick = (id) => {
        showMessage({
            message: "Clicked on sat wit ID: " + id,
            type: "info",
          });
    }

    render() {
        const modelList = this.state.satelites.map((sat) => {
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

                    onClick={() => {
                        this._onClick(sat.id);
                    }}
                />
            )
          })

        if (this.state.loading) {
            return (
                <ViroNode position={[0,0.2,0]}>
                    <ViroAmbientLight color="#FFFFFF" />

                    <Viro3DObject source={require('../res/earth.obj')}
                        resources={[require('../res/earth.mtl'),
                                    require('../res/earth_texture.png')]}
                        position={[0.0, 0.0, 0.0]}
                        scale={[0.025, 0.025, 0.025]}
                        rotation={[180, 0, -180]}
                        type="OBJ"

                        onClick={(position, source) => {console.log("Clicked on earth " + position);}}
                    />
                </ViroNode>
            );
        } else {
            return (
                <ViroNode position={[0,0.2,0]}>
                    <ViroAmbientLight color="#FFFFFF" />
    
                    <Viro3DObject source={require('../res/earth.obj')}
                        resources={[require('../res/earth.mtl'),
                                    require('../res/earth_texture.png')]}
                        position={[0.0, 0.0, 0.0]}
                        scale={[0.025, 0.025, 0.025]}
                        rotation={[180, 0, -180]}
                        type="OBJ"

                        onClick={(position, source)=> {console.log("Clicked on earth " + position);}}
                    />
    
                    {modelList}
                </ViroNode>
              )
        }
    }

    /*
    render() {
        return (
            <ViroNode position={[0,0.5,0]}>
                <ViroAmbientLight color="#FFFFFF" />

                <Viro3DObject source={require('./res/earth.obj')}
                    resources={[require('./res/earth.mtl'),
                                require('./res/earth_texture.png')]}
                    position={[0.0, 0.0, 0.0]}
                    scale={[0.05, 0.05, 0.05]}
                    rotation={[180, 0, -180]}
                    type="OBJ"
                />

                <ViroSphere
                    heightSegmentCount={20}
                    widthSegmentCount={20}
                    radius={0.1}
                    position={[0.3, 0.3, 0.3]}
                    materials={["red"]}
                />
            </ViroNode>
        );
    }
    */
    
    
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
    }
});
