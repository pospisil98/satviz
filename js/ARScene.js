/** 
 *  @fileOverview Default AR scene of Satviz application. 
 *
 *  @author       Vojtěch Pospíšil
 */

"use strict";

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
import { showMessage, hideMessage } from "react-native-flash-message";

/**
 * Class representing default AR scene.
 */
export default class ARScene extends Component {
    constructor() {
        super();


        this.state = {
            /** Rotation of globe based on real world 
             * @type {Array.<number>} */
            globeRotation: [0, 0, 0],
            /** State of detection true=globe target detected
             * @type {boolean} */
            globeDetected: false,
            /** Detected globe real world position 
             * @type {Array.<number>|null} */
            globePosition: null,

            /** IDs of selected satellites to render 
             * @type {Array.<string>} */
            satelliteIDs: [],

            /** IDs of satellites which should have orbit rendered 
             * @type {Array.<string>} */
            orbitIDs: [],
            /** Opacity of rendered orbits 
             * @type {number} */
            orbitOpacity: 0.8,

            /** Scale (multiply) of real time speed 
             * @type {number} */
            timeScale: 1
        };

        /** Names of currently tracked image targets 
         * @type {Array.<string>} */
        this.tracking = [];
        /** State of globe tracking 
         * @type {boolean} */
        this.isTracking = false;

        /** Count of globe position recalculation 
         * @type {number} */
        this.positionModCount = 0;

        /** Switch for Globe rendering 
         * @type {boolean} */
        this.renderDisabled = true;
    }

    componentDidUpdate(prevProps, prevState) {
        // Rerender on change of props
        if (this.state.satelliteIDs != this.props.arSceneNavigator.viroAppProps.satelliteIDs) {
            this.setState({
                satelliteIDs: this.props.arSceneNavigator.viroAppProps.satelliteIDs,
            })
        }
        if (this.state.timeScale != this.props.arSceneNavigator.viroAppProps.timeScale) {
            this.setState({
                timeScale: this.props.arSceneNavigator.viroAppProps.timeScale,
            })
        }
        if (this.state.orbitIDs != this.props.arSceneNavigator.viroAppProps.orbitIDs) {
            this.setState({
                orbitIDs: this.props.arSceneNavigator.viroAppProps.orbitIDs,
            });
        }
        if (this.state.orbitOpacity != this.props.arSceneNavigator.viroAppProps.orbitOpacity) {
            this.setState({
                orbitOpacity: this.props.arSceneNavigator.viroAppProps.orbitOpacity,
            });
        }
    }

    /**
     * Calculate globe rotation from tracking targets
     * 
     * @returns {Array.<number>} Rotation in format [0, Y rotation, 0]
     */
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

        // Negative angle is because rotation has opposite direction than angles on globe
        return [0, -angle, 0];
    }

    /**
     * Modify globe position based on given position.
     * 
     * @param {Array.<number>} position Position to adjust globe position to
     */
    modifyGlobePosition = (position) => {
        // move Z coord into center of globe
        position[2] = position[2] - 0.085;

        if (this.positionModCount === 0) {
            this.setState({ globePosition: position, });
        } else {
            // Limit position modification to only first 4 attempts
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

            this.setState({ globePosition: newPos, });
        }

        this.positionModCount += 1;
    }

    /**
     * Function which is triggered everytime when imageTarget anchor changes.
     * 
     * @param {any} e Event which happened
     * @param {string} targetName Name of updated target
     */
    _onAnchorUpdated = (e, targetName) => {
        let changed = false;

        if (e.trackingMethod === "tracking") {
            // Tracking something - render Globe
            this.renderDisabled = false;

            // On flat target simply copy detected position and rotation
            if (targetName === "flatTarget") {
                this.setState({ globePosition: e.position, globeRotation: e.rotation });
                return;
            }

            if (!this.state.globeDetected && targetName !== "flatTarget") {
                this.setState({ globeDetected: true });
            }

            // Add target name to tracking if not there
            if (!this.tracking.includes(targetName)) {
                this.tracking.push(targetName);

                // Hold only last 3 targets
                if (this.tracking.length > 3) {
                    this.tracking.shift();
                }

                changed = true;
            }

            // Update globe position according to detected position
            this.modifyGlobePosition(e.position);
        } else if (e.trackingMethod === "lastKnownPose") {
            // LastKnownPose means that target is no longer available so remove it
            if (this.tracking.includes(targetName)) {
                this.tracking = this.tracking.filter(e => e !== targetName);
                changed = true;
            }
        }

        // When some target has been changed get user know it and update rotation
        if (changed) {
            if (this.tracking.length == 0 && this.isTracking == true) {
                this.isTracking = false;
                showMessage({
                    message: "Tracking lost :(",
                    type: "warning",
                });
            }

            if (this.tracking.length != 0 && this.isTracking == false) {
                this.isTracking = true;
                showMessage({
                    message: "Tracking established",
                    type: "success",
                });
            }

            let rotation = this.getGlobeRotation();
            this.setState({ globeRotation: rotation });
        }
    }

    /**
     * Maps all imageTarget names to ViroARImageMarker
     * 
     * @returns {Array.<ViroARImageMarker>} Array of AR image markers
     */
    renderTargets = () => {
        let targets = [];

        targets = targetNames.map((name) => {
            return (
                <ViroARImageMarker
                    key={name}
                    target={name}
                    onAnchorUpdated={(e) => this._onAnchorUpdated(e, name)}
                />
            )
        });

        return targets;
    }

    /**
     * Returns Globe component with everything set up to visualization
     * 
     * @returns {ViroNode} Globe with all properties set
     */
    renderGlobe = () => {
        if (this.renderDisabled) {
            return (<ViroNode></ViroNode>);
        }

        let position = this.state.globePosition;
        let flatTarget = true;
        let rotation = this.state.globeRotation;

        if (this.state.globeDetected) {
            flatTarget = false;
        }

        return (
            <ViroNode position={position} rotation={rotation}>
                <Globe
                    satelliteClickCallback={this.props.arSceneNavigator.viroAppProps.satelliteClickCallback}
                    satelliteIDs={this.state.satelliteIDs}
                    groundSegmentIDs={this.props.arSceneNavigator.viroAppProps.groundSegmentIDs}
                    timeScale={this.state.timeScale}
                    flatTarget={flatTarget}
                    renderVirtualGlobe={false}
                    removeSatelliteCallback={this.props.arSceneNavigator.viroAppProps.removeSatelliteCallback}
                    orbitIDs={this.state.orbitIDs}
                    orbitOpacity={this.state.orbitOpacity}
                    setDateTimeCallback={this.props.arSceneNavigator.viroAppProps.setDateTimeCallback}
                />
            </ViroNode>
        );
    }

    /**
     * Renders AR scene.
     * 
     * @returns {ViroARScene} ARscene with globe visualization 
     */
    render() {
        return (
            <ViroARScene onTrackingUpdated={this._onInitialized} >

                <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0, -1, -.2]}
                    position={[0, 3, 1]} color="#ffffff" castsShadow={true} />

                <ViroARImageMarker target={"flatTarget"} onAnchorUpdated={(e) => this._onAnchorUpdated(e, "flatTarget")} />

                {this.renderTargets()}

                {this.renderGlobe()}
            </ViroARScene>
        );
    }
}

/**
 * Names of imageTargets of globe
 * @constant
 * @type {Array.<string>}
 */
const targetNames = [
    "africa", "atlantic", "australia", "china", "europe",
    "hawaii", "indonesia", "northAmerica", "southAmerica"
];

/**
 * Angles of rotation of center of imageTarget
 * @constant
 * @type {Object<string, number>}
 */
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

// Definition of tracking targets for ARImageTargets
ViroARTrackingTargets.createTargets({
    "flatTarget": {
        source: require('./res/targets/earthFlat.jpeg'),
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

module.exports = ARScene;