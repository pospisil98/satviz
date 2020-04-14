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
import IconF from 'react-native-vector-icons/Feather';
import IconM from 'react-native-vector-icons/MaterialIcons'
import Slider from '@react-native-community/slider';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";

import CustomInfoModal from './js/components/CustomInfoModal';

import CoordConverter from './utils/coordsConverter'

import * as satelliteSelectItems from './js/res/selectCategories.json';
import * as groundSegmentSelectItems from './js/res/selectGroundSegment.json';

const { width, height } = Dimensions.get('window');

// Sets the default scene you want for AR and VR
var InitialARScene = require('./js/HelloWorldSceneAR');

export default class satviz extends Component {
    constructor() {
        super();

        this.myTextInput = React.createRef();

        this.state = {
            selectedItems: [],
            maxItems: false,

            selectedItemsManual: [],

            selectedItemsGroundSegment: [],

            helpModalVisible: false,

            satelliteModalVisible: false,
            satelliteModalID: 0,
            satelliteModalSatellite: null,

            orbitIDs: [],

            groundSegmentModalVisible: false,

            slidingPanelToggled: false,
            slidingPanelText: "Click to reveal satellite selection!",

            timeSpeedSliderValue: 1,

            flashMessagePosition: "top",
            flashMessageAutoHide: true,
        };

        this.maxSelectedItems = 50;
    }

    onSatelliteSelectedItemsChange = (selectedItems) => {
        if (selectedItems.length >= this.maxSelectedItems) {
            if (selectedItems.length === this.maxSelectedItems) {
                this.setState({ selectedItems })
            }

            this.setState({
                maxItems: true,
            })
            return;
        }

        this.setState({ 
            selectedItems,
            maxItems: false,
        })
    }

    onGroundSegmentSelectedItemsChange = (selectedItemsGroundSegment) => {
        this.setState({ selectedItemsGroundSegment });
    };

    toggleModal = () => {
        this.setState({ helpModalVisible: !this.state.helpModalVisible });
    };

    satelliteModalSetIDCallback = (sat) => {
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

    toggleGroundSegmentModal = () => {
        this.setState({
            groundSegmentModalVisible: !this.state.groundSegmentModalVisible,
        });
    }


    toggleSlidePanel = () => {
        var toggledBeforeChange = this.state.slidingPanelToggled;

        this.setState({ slidingPanelToggled: !toggledBeforeChange });

        if (!toggledBeforeChange) {
            this.setState({ slidingPanelText: "Click to hide satellite selection!" });
        } else {
            this.setState({ slidingPanelText: "Click to reveal satellite selection!" });
        }
    };

    addManual = () => {
        if (this.state.selectedItemsManual.includes(this.myTextInput.current._lastNativeText) === false) {

            this.setState({ selectedItemsManual: [].concat(this.state.selectedItemsManual).concat(this.myTextInput.current._lastNativeText)});
        } else {
            this.setFlashMesageToSelectionError();

            showMessage({
                message: "Satellite with this ID is already selected!",
                type: "danger",
            });
        }

        this.myTextInput.current.clear();
    }

    removeManual = (value) => {
        this.setState({ selectedItemsManual: this.state.selectedItemsManual.filter(e => e != value) })
    }

    removeManualAll = () => {
        this.setState({ selectedItemsManual: [] });
    }

    removeSatelliteWithError = (satID) => {
        // try to remove from selected in category
        if (this.state.selectedItems.includes(satID)) {
            let arr = this.state.selectedItems.filter(e => e !== satID);

            this.setState({selectedItems: arr});
        }

        // try to remove from selected manually
        if (this.state.selectedItemsManual.includes(satID)) {
            let arr = this.state.selectedItemsManual.filter(e => e !== satID);

            this.setState({selectedItemsManual: arr});
        }

        showMessage({
            message: "Satellite with ID " + satID + " had to be removed from your selection because of internal problem with calculating its position.",
            type: "warning",
        });
    }

    setFlashMesageToSelectionError = () => {
        this.setState({
            flashMessageAutoHide: true,
            flashMessagePosition: "top",
        });
    }

    isOrbitEnabledForSatelliteInModal = () => {
        // type error protection
        if (this.state.satelliteModalSatellite === null) {
            return false;
        }

        return this.state.orbitIDs.includes(this.state.satelliteModalSatellite.id);
    }

    
    toggleOrbitVisibility = (satelliteID) => {
        // type error protection
        if (this.state.satelliteModalSatellite === null) {
            return;
        }

        if (this.state.orbitIDs.includes(satelliteID)) {
            let arr = this.state.orbitIDs.filter(id => id != satelliteID);

            this.setState({
                orbitIDs: arr,
            });
        } else {
            let current = [...this.state.orbitIDs];
            this.setState({
                orbitIDs: [...current, satelliteID],
            });
        }
    }

    render() {
        return (
            <View style={styles.container}>

                <ViroARSceneNavigator
                    style={styles.arView}
                    autofocus={true}
                    shadowsEnabled={true}
                    initialScene={{ scene: InitialARScene }}
                    viroAppProps={{
                        satelliteClickCallback: this.satelliteModalSetIDCallback,
                        satelliteIDs: [].concat(this.state.selectedItems).concat(this.state.selectedItemsManual),
                        groundSegmentIDs: this.state.selectedItemsGroundSegment,
                        orbitIDs: this.state.orbitIDs,
                        timeScale: this.state.timeSpeedSliderValue,
                        removeSatelliteCallback: this.removeSatelliteWithError,
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
                            <Button title="Hide modal" onPress={this.toggleModal} />
                        </View>
                    </View>
                </Modal>

                <TouchableOpacity onPress={this.toggleModal} style={styles.modalIcon}>
                    <IconM name="help-outline" size={30} color="white" style={styles.iconShadow}/>
                </TouchableOpacity>

                <View style={styles.bodyViewStyle}>
                    <CustomInfoModal
                        satellite={this.state.satelliteModalSatellite}
                        isModalVisible={this.state.satelliteModalVisible}
                        closeModal={() => this.toggleSatelliteModal()}
                        orbitEnabled={this.isOrbitEnabledForSatelliteInModal()}
                        orbitButtonCallback={this.toggleOrbitVisibility}
                    >
                    </CustomInfoModal>
                </View>

                <SlidingPanel
                    headerLayoutHeight={50}
                    onAnimationStop={this.toggleSlidePanel}
                    headerLayout={() =>
                        <View style={styles.headerLayoutStyle}>
                            <Text style={styles.commonTextStyle}>{this.state.slidingPanelText}</Text>
                        </View>
                    }
                    allowDragging={true}
                    slidingPanelLayout={() =>
                        <View style={styles.slidingPanelLayoutStyle}>
                            <View style={{ flex: 1 }}>
                                <ScrollView style={{ flex: 1 }}>
                                    <View style={{flex: 1, justifyContent: 'center'}}>
                                        <SectionedMultiSelect
                                            items={satelliteSelectItems.default}
                                            uniqueKey="id"
                                            subKey="children"
                                            selectText="Choose from catogories.."
                                            showDropDowns={true}
                                            readOnlyHeadings={false}
                                            selectChildren={true}
                                            showRemoveAll={true}
                                            onSelectedItemsChange={this.onSatelliteSelectedItemsChange}
                                            selectedItems={this.state.selectedItems}
                                            confirmText={`${this.state.maxItems ? 'Max satellites selected' : 'Confirm'}`}
                                        />
                                    </View>

                                    <View style={[styles.hairlineSplitLine]}/>

                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            marginVertical: 10,
                                        }}
                                    >
                                        <TextInput
                                            style={{
                                                height: 40,
                                                width: '70%',
                                                paddingLeft: '3%',
                                            }}
                                            placeholder="Choose by typing satellite ID"
                                            ref={this.myTextInput}
                                            keyboardType='numeric'
                                            value={this.state.text}
                                        />
                                        <View style={{ width: '20%'}}>
                                            <Button title="Add!" onPress={this.addManual} />
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
                                                        paddingRight: 0,
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
                                                        <IconF
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

                                    <View style={styles.hairlineSplitLine}/>
                                    
                                    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <View style={{width: '80%'}}>
                                            <SectionedMultiSelect
                                                items={groundSegmentSelectItems.default}
                                                uniqueKey="id"
                                                subKey="children"
                                                selectText="Choose from ground segments..."
                                                showDropDowns={false}
                                                readOnlyHeadings={true}
                                                selectChildren={true}
                                                // expandDropDowns={true} // causes weird bug at bottom part of screen
                                                showRemoveAll={true}
                                                onSelectedItemsChange={this.onGroundSegmentSelectedItemsChange}
                                                selectedItems={this.state.selectedItemsGroundSegment}
                                            />
                                        </View>
                                        <View style={{position: 'absolute', top: 15, right: 25}}>
                                            <TouchableOpacity onPress={this.toggleGroundSegmentModal}>
                                                <IconF name="info" size={30} color="gray" style={styles.iconShadow}/>
                                            </TouchableOpacity>
                                        </View>
                                        <View></View>
                                    </View>
                                    

                                    <Modal
                                        isVisible={this.state.groundSegmentModalVisible}
                                        useNativeDriver={true}
                                        onBackdropPress={this.toggleGroundSegmentModal}
                                    >
                                        <View style={styles.groundSegmentModal}>
                                            <View style={{height: '90%'}}>
                                                <ScrollView>
                                                    <Text style={styles.groundSegmentHeading}>Master Control Stations and Alternate MCS</Text>
                                                    <Text style={styles.groundSegmentColors}>Red and Gold</Text>
                                                    <Text style={styles.groundSegmentText}>The master control station, located at Schriever Air Force Base in Colorado Springs, Colorado, is responsible for overall management of the remote monitoring and transmission sites. GPS ephemeris being a tabulation of computed positions, velocities and derived right ascension and declination of GPS satellites at specific times, replace "position" with "ephemeris" because the Master Control Station computes not only position but also velocity, right ascension and declination parameters for eventual upload to GPS satellites.</Text>
                                                
                                                    <Text style={[styles.groundSegmentHeading, {marginTop: 5}]}>Monitor Stations</Text>
                                                    <Text style={styles.groundSegmentColors}>AFMS blue, AFSCN yellow, NGA purple</Text>
                                                    <Text style={styles.groundSegmentText}>Six monitor stations are located at Schriever Air Force Base in Colorado, Cape Canaveral, Florida, Hawaii, Ascension Island in the Atlantic Ocean, Diego Garcia Atoll in the Indian Ocean, and Kwajalein Island in the South Pacific Ocean.Six additional monitoring stations were added in 2005 in Argentina, Bahrain, United Kingdom, Ecuador, Washington DC, and Australia. Each of the monitor stations checks the exact altitude, position, speed, and overall health of the orbiting satellites. The control segment uses measurements collected by the monitor stations to predict the behavior of each satellite's orbit and clock. The prediction data is up-linked, or transmitted, to the satellites for transmission back to the users. The control segment also ensures that the GPS satellite orbits and clocks remain within acceptable limits. A station can track up to 11 satellites at a time. This "check-up" is performed twice a day, by each station, as the satellites complete their journeys around the earth. Noted variations, such as those caused by the gravity of the moon, sun and the pressure of solar radiation, are passed along to the master control station.</Text>
                                                
                                                    <Text style={[styles.groundSegmentHeading, {marginTop: 5}]}>Ground Antennas</Text>
                                                    <Text style={styles.groundSegmentColors}>Green</Text>
                                                    <Text style={styles.groundSegmentText}>
                                                        The Ground Antennas uplink data to the satellites via S-band radio signals. These data includes ephemerides and clock correction information transmitted within the Navigation Message, as well as command telemetry from the MCS.
                                                        This information can be uploaded to each satellite three times per day, i.e., every 8 hours; nevertheless, it is usually updated just once a day.
                                                    </Text>
                                                </ScrollView>
                                            </View>
                                            <View style={{width: '40%', justifyContent:'center', flex: 1,}}>
                                                <Button title="Hide info" onPress={this.toggleGroundSegmentModal} />
                                            </View>
                                        </View>
                                    </Modal>

                                    <View style={[styles.hairlineSplitLine]}/>

                                    <View style={{marginHorizontal: 10, marginTop: 10}}>
                                        <Text>Set time speed ({Math.trunc(this.state.timeSpeedSliderValue).toString()}x normal)</Text>
                                        <Slider
                                            value={this.state.timeSpeedSliderValue}
                                            minimumValue={1}
                                            maximumValue={1000}
                                            onValueChange={(val) => this.setState({ timeSpeedSliderValue: val })}
                                        />
                                    </View>

                                    <View style={{ paddingBottom: 400 }}></View>
                                </ScrollView>
                            </View>
                        </View>
                    }
                />

                <FlashMessage
                    position={this.state.flashMessagePosition}
                    autoHide={this.state.flashMessageAutoHide}
                />
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

    groundSegmentModal: {
        backgroundColor: "white",
        marginHorizontal: '10%',
        height: '80%',
        textAlign: 'right',
        alignItems: 'center',
        padding: '3%',
        paddingBottom: 0,
    },
    groundSegmentHeading: {
        fontWeight:'bold',
        textAlign: 'center',
        fontSize: 16
    },
    groundSegmentText: {
        textAlign: 'justify',
    },
    groundSegmentColors: {
        textAlign: 'center',
        fontSize: 12
    },

    hairlineSplitLine: {
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },



    iconShadow: {
        shadowOpacity: 2,
        textShadowRadius: 2,
        textShadowOffset:{width: 0,height: 0}
    },
});
