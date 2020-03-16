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

        /*
         TODO: remove - moved to props 
        this.satelliteIDS = [
            25544, // ISS
            28129, // NAVSAT 54 GPS
            26483 
        ];*/

        this.satelliteIDs = this.props.satelliteIDs;

        this.time = new Date();
        this.ST = new SpaceTrack();

        // call ST funtion to get data according to IDs
        var t0 = performance.now();
        this.ST.testBothAsync(this.satelliteIDS)
            .then(data => {
                // after getting data from function save them into tle variable and unset loading flag
                this.tle = SpaceTrack.convertTLEStringToArray(data);
                this.setState(prevState => ({ loading: false }));
                var t1 = performance.now();
                console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
            });
    }

    componentDidMount() {
        // start timer which tries to parse data every 500 ms
        this.parseTimer = setInterval(this.parseData, 500);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props != prevProps) {
            console.log("SAT IDS");
            console.log(this.props.satelliteIDs);
        }
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

    parseData = () => {
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

    updatePositions = () => {
        this.setState(prevState => {
            const list = prevState.satelites.map(
                satellite => satellite.updatePosition(this.time)
                );
            return {
              list,
            };
        });
        this.time = new Date(this.time.getTime());
    }

    convertTLEtoSatrecCollection = () => {
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

    selectSatelliteObjectById = (id) => {
        return this.state.satelites.filter((sat) => {
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

    renderGlobe = () => {
        let modelList;

        if (!this.state.loading) {
            modelList = this.state.satelites.map((sat) => {
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

        return(
            <ViroNode position={[0,0.2,0]}>
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

    render() {
        return (
            <View>
                {this.renderGlobe()}
            </View>
        );
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
    }
});
