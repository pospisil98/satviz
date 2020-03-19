'use-strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Button,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';

import {
  ViroARSceneNavigator
} from 'react-viro';

import SlidingPanel from 'react-native-sliding-up-down-panels';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Feather';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";

import CustomInfoModal from './js/components/CustomInfoModal';

import * as items from './js/res/selectCategories.json';

const { width, height } = Dimensions.get('window');

/*
const items = [
  {
    name: 'Fruits',
    id: 0,
    children: [
      {
        name: 'Apple',
        id: 10,
      },
      {
        name: 'Strawberry',
        id: 17,
      },
      {
        name: 'Pineapple',
        id: 13,
      },
      {
        name: 'Banana',
        id: 14,
      },
      {
        name: 'Watermelon',
        id: 15,
      },
      {
        name: 'Kiwi fruit',
        id: 16,
      },
    ],
  },
];
*/

// Sets the default scene you want for AR and VR
var InitialARScene = require('./js/HelloWorldSceneAR');

export default class satviz extends Component {
  constructor() {
    super();

    this.myTextInput = React.createRef();

    this.state = {
      selectedItems: [],
      selectedItemsManual: [],

      helpModalVisible: false,
      
      satelliteModalVisible: false,
      satelliteModalID: 0,
      satelliteModalSatellite: null,

      slidingPanelToggled: false,
      slidingPanelText: "Click to reveal satellite selection!",
    };
  }

  onSelectedItemsChange = (selectedItems) => {
    this.setState({ selectedItems });
  };

  toggleModal = () => {
    this.setState({ helpModalVisible: !this.state.helpModalVisible });
  };

  satelliteModalSetIDCallback = (sat) => {
    console.log(sat);

    this.setState({ 
      satelliteModalID: sat.id,
      satelliteModalSatellite: sat,
    });

    this.toggleSatelliteModal();
  }

  toggleSatelliteModal = () => {
    this.setState({ 
      satelliteModalVisible: !this.state.satelliteModalVisible,
    });
  };


  toggleSlidePanel = () => {
    var toggledBeforeChange = this.state.slidingPanelToggled;
    //console.log("Bef change:  " + toggledBeforeChange);

    this.setState({ slidingPanelToggled: !toggledBeforeChange });

    // console.log("Aft change: " + !toggledBeforeChange);
    if (!toggledBeforeChange) {
      this.setState({ slidingPanelText: "Click to hide satellite selection!" });
    } else {
      this.setState({ slidingPanelText: "Click to reveal satellite selection!" });
    } 
  };

  addManual = () => {
    if (this.state.selectedItemsManual.includes(this.myTextInput.current._lastNativeText) === false) {
      this.setState({selectedItemsManual: this.state.selectedItemsManual.concat(this.myTextInput.current._lastNativeText)});
    } else {
      showMessage({
        message: "Satellite with this ID is already selected!",
        type: "warning",
      });
    }

    this.myTextInput.current.clear();
  }

  removeManual = (value) => {
    this.setState({selectedItemsManual: this.state.selectedItemsManual.filter(e => e != value)})
  }

  removeManualAll = () => {
    this.setState({selectedItemsManual: []});
  }

  render() {
    return (
      <View style={styles.container}>                 

        <ViroARSceneNavigator
          style={styles.arView}
          autofocus={true}
          shadowsEnabled={true}
          initialScene={{scene: InitialARScene}}
          viroAppProps = {{
            satelliteClickCallback: this.satelliteModalSetIDCallback,
            satelliteIDs:   this.state.selectedItems.concat(this.state.selectedItemsManual),
          }}
        />     
        
        <Modal 
          isVisible={this.state.helpModalVisible}
          useNativeDriver={true}
          onBackdropPress={this.toggleModal}
        >
          <View style={styles.helpModal}>
            <Text>Informace o aplikaci</Text>
            <Text>Stručné info o používání a že to je moje BP</Text>
            <View style={styles.infoModalCloseButton}>
              <Button title="Hide modal" onPress={this.toggleModal}/>
            </View>
          </View>
        </Modal>

        <TouchableOpacity onPress={this.toggleModal} style={styles.modalIcon}>
          <Icon name="info" size={30} color="grey"/>
        </TouchableOpacity>
            
        <View style={styles.bodyViewStyle}>            
            { 
              this.state.selectedItemsManual.map((item, key) => (
                <Text key={key} onPress={() => this.toggleSatelliteModal(item)}> { item } </Text>)
              )
            }

            <CustomInfoModal 
              satellite={this.state.satelliteModalSatellite} 
              isModalVisible={this.state.satelliteModalVisible} 
              closeModal={() => this.toggleSatelliteModal()}
            >
            </CustomInfoModal>
        </View>
      
        
        <SlidingPanel
            headerLayoutHeight = {50}
            onAnimationStop={this.toggleSlidePanel}
            headerLayout = { () =>
                <View style={styles.headerLayoutStyle}>
                  <Text style={styles.commonTextStyle}>{this.state.slidingPanelText}</Text>
                </View>
            }
            
            slidingPanelLayout = { () =>
                <View style={styles.slidingPanelLayoutStyle}>
                    <View style={{flex: 1}}>
                      <ScrollView>
                        <SectionedMultiSelect
                        items={items.default}
                        uniqueKey="id"
                        subKey="children"
                        selectText="Choose from catogories.."
                        showDropDowns={true}
                        readOnlyHeadings={false}
                        selectChildren={true}
                        showRemoveAll={true}
                        onSelectedItemsChange={this.onSelectedItemsChange}
                        selectedItems={this.state.selectedItems}
                        />

                        <View
                          style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            marginTop: 10,
                            marginBottom: 10,
                          }}
                        />

                        <View 
                          style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                          }}
                        >
                          <TextInput
                            style={{
                              height: 40,
                              width: '70%',
                              paddingLeft: '3%',
                            }}
                            placeholder="Choose manualy by satellite ID"
                            ref={this.myTextInput}
                            keyboardType='numeric'
                            value={this.state.text}
                          />
                          <View style={{width: '20%', }}>
                            <Button title="Add!" onPress={this.addManual}/>  
                          </View>
                        </View>

                          <View
                            style={{
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              flexDirection: 'row',
                            }}
                          >
                          {
                            this.state.selectedItemsManual.length > 1 ? (
                              <View
                                style={{
                                  overflow: 'hidden',
                                  justifyContent: 'center',
                                  height: 34,
                                  borderColor: colors.selectedBubble,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingLeft: 10,
                                  margin: 3,
                                  paddingTop: 0,
                                  paddingRight: 10,
                                  paddingBottom: 0,
                                  borderRadius: 20,
                                  borderWidth: 1,
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => {
                                    this.removeManualAll()
                                  }}
                                  style={{
                                    borderTopRightRadius: 20,
                                    borderBottomRightRadius: 20,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: colors.selectedBubble,
                                      fontSize: 13,
                                      marginRight: 0,
                                    }}
                                  >
                                    Remove All
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) : null
                          }

                          { 
                            this.state.selectedItemsManual.map((item, key) => (
                              <View
                                style={{
                                  overflow: 'hidden',
                                  justifyContent: 'center',
                                  height: 34,
                                  borderWidth: 1,
                                  borderRadius: 20,
                                  borderColor: colors.selectedBubble,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingLeft: 10,
                                  margin: 3,
                                  paddingTop: 0,
                                  paddingRight:  0,
                                  paddingBottom: 0,
                                  color: colors.selectedBubble,
                                }}
                                key={key}
                              >
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    fontSize: 13,
                                    marginRight: 0,
                                    color: colors.selectedBubble,
                                  }}
                                >
                                  {item}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => this.removeManual(item)}
                                  style={{
                                    borderTopRightRadius: 20,
                                    borderBottomRightRadius: 20,
                                  }}
                                >
                                  <Icon
                                    name="x"
                                    style={{
                                      fontSize: 16,
                                      marginHorizontal: 6,
                                      marginVertical: 7,
                                      color: colors.selectedBubble,
                                    }}
                                  />
                                </TouchableOpacity>
                              </View>
                            ))
                          }
                          </View>
                          </ScrollView>
                    </View>
                </View>
            }
        />
        <FlashMessage position="top" />
      </View>
    );
  }
}

module.exports = satviz

const colors = {
  selectedBubble: '#848787',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyViewStyle: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  arView: {
    flex: 1,
    position: 'absolute',
    height: '100%',
  },
  headerLayoutStyle: {
    width, 
    height: 50, 
    backgroundColor: 'grey', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  slidingPanelLayoutStyle: {
    width, 
    height, 
    backgroundColor: '#ffffff', 
  },
  commonTextStyle: {
    color: 'white', 
    fontSize: 18,
  },

  modalIcon: {
    position: 'absolute',
    right: '5%',
    top: '2%',
  },
  helpModal: {
    backgroundColor: "white",
    marginHorizontal: '10%',
    height: '50%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },

  infoModalCloseButton: {
    marginTop: '30%',
    width: '50%',
  },
});
