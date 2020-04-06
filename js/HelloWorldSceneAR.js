'use strict';

import React, { Component } from 'react';

import { StyleSheet } from 'react-native';

import {
    ViroARScene,
    ViroConstants,
    ViroARImageMarker,
    ViroARTrackingTargets,
    ViroSpotLight,
    ViroNode,
    ViroMaterials,
    ViroSphere,
} from 'react-viro';

import Globe from './components/Globe'

const targetNames = ["africa", "atlantic", "australia", "china", "europe",
    "hawaii", "indonesia", "northAmerica", "southAmerica"];

const angles = {
    "africa": 15,
    "atlantic": 340,
    "australia": 135,
    "china": 90,
    "europe": 15,
    "hawaii": 195,
    "indonesia": 140,
    "northAmerica": 260,
    "southAmerica": 300,
}


export default class HelloWorldSceneAR extends Component {
    constructor() {
        super();

        // Set initial state here
        this.state = {
            text: "Initializing AR...",

            globeRotation: [0, 0, 0],
            globeDetected: false,
            globePosition: null,

            // only for rerender on props change
            satelliteIDs: [],
            timeScale: 1
        };

        this.tracking = [];
        this.lastDetected = null;
        this.positionModCount = 0;

        this.renderDisabled = true;
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.state.satelliteIDs != this.props.arSceneNavigator.viroAppProps.satelliteIDs) || (this.state.timeScale != this.props.arSceneNavigator.viroAppProps.timeScale)) {
            this.setState({
                satelliteIDs: this.props.arSceneNavigator.viroAppProps.satelliteIDs,
                timeScale: this.props.arSceneNavigator.viroAppProps.timeScale,
            })
        }
    }

    getGlobeRotation = () => {
        if (this.tracking.length === 0) {
            return this.state.globeRotation;
        }

        let sum = 0;
        this.tracking.forEach(element => {
            // -15 is because of "default pose" of globe where africa is in front of camera
            sum += (angles[element] - 15);
        });

        let angle = sum / this.tracking.length;

        //negative angle is because rotation has opposite direction than angles on globe
        return [0, -angle, 0];
    }

    modifyGlobePosition = (position) => {
        // move Z coord into center of globe
        position[2] = position[2] - 0.07;

        if (this.positionModCount === 0) {
            this.setState({globePosition: position,});
        } else {
            if (this.positionModCount > 3) {
                return;
            }

            let newPos = [];
            
            newPos[0] = ((this.state.globePosition[0] * this.positionModCount) + position[0]) / (this.positionModCount + 1);
            newPos[1] = ((this.state.globePosition[1] * this.positionModCount) + position[1]) / (this.positionModCount + 1);
            newPos[2] = ((this.state.globePosition[2] * this.positionModCount) + position[2]) / (this.positionModCount + 1);
            
            /*
           newPos[0] = ((this.state.globePosition[0]) + position[0]) / 2;
           newPos[1] = ((this.state.globePosition[1]) + position[1]) / 2;
           newPos[2] = ((this.state.globePosition[2]) + position[2]) / 2;
           */
            
            this.setState({globePosition: newPos,});
        }

        this.positionModCount += 1;
    }

    _onAnchorFound = (e, targetName) => {
    }

    _onAnchorUpdated = (e, targetName) => {
        let changed = false;

        if (e.trackingMethod === "tracking") {
            this.renderDisabled = false;

            if (targetName === "flatTarget") {
                this.setState({globePosition: e.position, globeRotation: e.rotation});
                return;
            }

            if (!this.state.globeDetected && targetName !== "flatTarget") {
                this.setState({globeDetected: true});
            }

            // add target name to tracking if not there
            if (!this.tracking.includes(targetName)) {
                this.lastDetected = targetName;
                this.tracking.push(targetName);

                if (this.tracking.length > 3) {
                    this.tracking.shift();
                }
                
                changed = true;
            }

            // update globe position according to detected position
            this.modifyGlobePosition(e.position);
        } else if (e.trackingMethod === "lastKnownPose") {
            // remove from tracking
            if (this.tracking.includes(targetName)) {
                this.tracking = this.tracking.filter(e => e !== targetName);
                changed = true;
            }
        }

        if (changed) {
            console.log(this.tracking);

            let rotation = this.getGlobeRotation();
            this.setState({globeRotation: rotation});
        }
    }

    _onInitialized = (state, reason) => {
        if (state == ViroConstants.TRACKING_NORMAL) {
            this.setState({
                text: "Hello World!"
            });
        } else if (state == ViroConstants.TRACKING_NONE) {
            // Handle loss of tracking
        }
    }

    renderSphere = () => {
        if (this.state.globeDetected) {
            return(
                <ViroSphere
                    heightSegmentCount={20}
                    widthSegmentCount={20}
                    radius={0.17}
                    position={this.state.globePosition}
                    materials={["mat"]}
                />
            );
        } else {
            return(<ViroNode></ViroNode>);
        }
    }

    renderTargets = () => {
        let targets = [];

        targets = targetNames.map((name) => {
            return (
                <ViroARImageMarker
                    key={name}
                    target={name}
                    onAnchorFound={(e) => this._onAnchorFound(e, name)}
                    onAnchorUpdated={(e) => this._onAnchorUpdated(e, name)}
                />
            )
        });

        return targets;
    }

    renderGlobe = () => {
        if (this.renderDisabled) {
            return(<ViroNode></ViroNode>);
        }

        let position = this.state.globePosition;
        let flatTarget = true;
        let rotation = this.state.globeRotation;

        if (this.state.globeDetected) {
            flatTarget = false;
        }

        return(
            <ViroNode position={position} rotation={rotation}>
                <Globe
                    satelliteClickCallback={this.props.arSceneNavigator.viroAppProps.satelliteClickCallback}
                    satelliteIDs={this.state.satelliteIDs}
                    timeScale={this.state.timeScale}
                    flatTarget={flatTarget}
                    renderVirtualGlobe={true}
                    removeSatelliteCallback={this.props.arSceneNavigator.viroAppProps.removeSatelliteCallback}
                />
            </ViroNode>
        );
    }

    render() {
        return (
            <ViroARScene onTrackingUpdated={this._onInitialized} >

                <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0, -1, -.2]}
                    position={[0, 3, 1]} color="#ffffff" castsShadow={true} />

                <ViroARImageMarker target={"flatTarget"} onAnchorUpdated={(e) => this._onAnchorUpdated(e, "flatTarget")} />

                {this.renderTargets()}

                {this.renderGlobe()}

                {/*this.renderSphere()*/}
            </ViroARScene>
        );
    }
}

ViroARTrackingTargets.createTargets({
    "flatTarget": {
        source: require('./res/targets/earthFlat.png'),
        orientation: "Up",
        physicalWidth: 0.2 // real world width in meters
    },
    "africa": {
        source: require('./res/targets/africa.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "atlantic": {
        source: require('./res/targets/atlantic.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "australia": {
        source: require('./res/targets/australia.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "china": {
        source: require('./res/targets/china.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "europe": {
        source: require('./res/targets/europe.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "hawaii": {
        source: require('./res/targets/hawaii.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "indonesia": {
        source: require('./res/targets/indonesia.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "northAmerica": {
        source: require('./res/targets/northAmerica.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
    "southAmerica": {
        source: require('./res/targets/southAmerica.jpg'),
        orientation: "Up",
        physicalWidth: 0.3,
    },
});

ViroMaterials.createMaterials({
    mat: {
        lightingModel: "Blinn",
        diffuseColor: '#6e6e6e'
    }
});

module.exports = HelloWorldSceneAR;
