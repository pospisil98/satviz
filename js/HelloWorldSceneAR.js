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

export default class HelloWorldSceneAR extends Component {

  constructor() {
    super();

    // Set initial state here
    this.state = {
      text : "Initializing AR..."
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
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

        <ViroARImageMarker
          target={"globeOne"}        
          onAnchorFound={ (e) => this._onAnchorFound(e,"globeOne")}
          onAnchorRemoved={ (e) => this._onAnchorRemoved(e,"globeOne")}
        />

        <ViroARImageMarker
          target={"globeTwo"}        
          onAnchorFound={ (e) => this._onAnchorFound(e,"globeTwo")}
          onAnchorRemoved={ (e) => this._onAnchorRemoved(e,"globeTwo")}
        />

        <ViroARImageMarker
          target={"globeThree"}        
          onAnchorFound={ (e) => this._onAnchorFound(e,"globeThree")}
          onAnchorRemoved={ (e) => this._onAnchorRemoved(e,"globeThree")}
        />

        <ViroARImageMarker
          target={"globeFour"}        
          onAnchorFound={ (e) => this._onAnchorFound(e,"globeFour")}
          onAnchorRemoved={ (e) => this._onAnchorRemoved(e,"globeFour")}
        />


      </ViroARScene>
    );
  }

  _onAnchorFound = (e, targetName) => {
      console.log("ANCHOR FOUND");
      console.log(e);
      console.log(targetName);
  }

  _onAnchorRemoved = (e, targetName) => {
    console.log("ANCHOR REMOVED");
    console.log(e);
    console.log(targetName);
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
  "globeOne" : {
    source : require('./res/targets/1_edited_opt.png'),
    orientation : "Up",
    physicalWidth : 0.3 // real world width in meters
  },
  "globeTwo" : {
    source : require('./res/targets/2_edited_opt.png'),
    orientation : "Up",
    physicalWidth : 0.3 // real world width in meters
  },
  "globeThree" : {
    source : require('./res/targets/3_edited_opt.png'),
    orientation : "Up",
    physicalWidth : 0.3 // real world width in meters
  },
  "globeFour" : {
    source : require('./res/targets/4_edited_opt.png'),
    orientation : "Up",
    physicalWidth : 0.3 // real world width in meters
  },
});

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',  
  },
});

module.exports = HelloWorldSceneAR;
