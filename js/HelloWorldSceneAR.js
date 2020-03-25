'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
  ViroARScene,
  ViroConstants,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroSpotLight,
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
    };

    this.tracking = [];
    this.lastKnownPose = [];

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
  }

  renderTargets = () => {
    let targets = [];

    targets = targetNames.map((name) => {
      return (
        <ViroARImageMarker
          key={name}
          target={name}        
          onAnchorFound={ (e) => this._onAnchorFound(e,name)}
          onAnchorUpdated={ (e) => this._onAnchorUpdated(e,name)}
        />
      )
    });

    return targets;
  }

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized} >

        <ViroSpotLight innerAngle={5} outerAngle={90} direction={[0,-1,-.2]}
                  position={[0, 3, 1]} color="#ffffff" castsShadow={true} />

        <ViroARImageMarker target={"targetOne"} >
          <Globe 
            satelliteClickCallback={this.props.arSceneNavigator.viroAppProps.satelliteClickCallback}
            satelliteIDs={this.props.arSceneNavigator.viroAppProps.satelliteIDs}
            timeScale={this.props.arSceneNavigator.viroAppProps.timeScale}
          />
        </ViroARImageMarker>

        {this.renderTargets()}
      </ViroARScene>
    );
  }

  _onAnchorFound = (e, targetName) => {
    // console.log("ANCHOR FOUND");
    // console.log(e);
    // console.log(targetName);
  }

  _onAnchorUpdated = (e, targetName) => {
      if (e.trackingMethod === "tracking") {
        // add target name to tracking if not there
        if (!this.tracking.includes(targetName)) {
          this.tracking = [...this.tracking, targetName];
        }

        // remove target name from lastKnownPoses
        if (this.lastKnownPose.includes(targetName)) {
          this.lastKnownPose = this.lastKnownPose.filter(e => e !== targetName);
        }
      } else if (e.trackingMethod === "lastKnownPose") {
        // add to lastKnownPoses if not there
        if (!this.lastKnownPose.includes(targetName)) {
          this.lastKnownPose = [...this.lastKnownPose, targetName];
        }

        // remove from tracking
        if (this.tracking.includes(targetName)) {
          this.tracking = this.tracking.filter(e => e !== targetName);
        }
      }
  }

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "Hello World!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }
}

ViroARTrackingTargets.createTargets({
  "targetOne" : {
    source : require('./res/targets/earthFlat.png'),
    orientation : "Up",
    physicalWidth : 0.2 // real world width in meters
  },  
  "africa" : {
    source : require('./res/targets/africa.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "atlantic" : {
    source : require('./res/targets/atlantic.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "australia" : {
    source : require('./res/targets/australia.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "china" : {
    source : require('./res/targets/china.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "europe" : {
    source : require('./res/targets/europe.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "hawaii" : {
    source : require('./res/targets/hawaii.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "indonesia" : {
    source : require('./res/targets/indonesia.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "northAmerica" : {
    source : require('./res/targets/northAmerica.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
  "southAmerica" : {
    source : require('./res/targets/southAmerica.jpg'),
    orientation : "Up",
    physicalWidth : 0.3,
  },
});

module.exports = HelloWorldSceneAR;
