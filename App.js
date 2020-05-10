/** 
 *  @fileOverview Default class for Satviz application. 
 *
 *  @author       Vojtěch Pospíšil
 */

"use strict";

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
import Icon from 'react-native-vector-icons/Fontisto';
import Slider from '@react-native-community/slider';

import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";

import CustomInfoModal from './js/components/CustomInfoModal';

import CoordConverter from './utils/coordsConverter'

import * as satelliteSelectItems from './js/res/selectCategories.json';
import * as groundSegmentSelectItems from './js/res/selectGroundSegment.json';


let InitialARScene = require('./js/ARScene');

/**
 * Default class of Satviz application.
 */
export default class satviz extends Component {
    constructor() {
        super();

        /**
         * Reference to text input for manual satellite selection
         * @type {React.RefObject<any>} */
        this.manualSatSelectTextInput = React.createRef();

        this.state = {
            /** Selected satellite IDs from satellite multislect
             *  @type {Array.<string>} */
            selectedItems: [],
            /** Indication of reaching maximum of selcted items in select 
             * @type {boolean} */
            maxItems: false,

            /** Selected satellite IDs from manual select 
             * @type {Array.<string>} */
            selectedItemsManual: [],

            /** Selected GPS ground segment IDS from GS multiselect 
             * @type {Array.<string>} */
            selectedItemsGroundSegment: [],

            /** Visibility of help modal window 
             * @type {boolean} */
            helpModalVisible: false,

            /** Visibility of satellite info modal (CustomInfoModal) 
             * @type {boolean} */
            satelliteModalVisible: false,
            /** Selected satellite which info is displayed in info modal 
             * @type {SatelliteObject} */
            satelliteModalSatellite: null,

            /** IDs of satellites with enabled orbit rendering 
             * @type {Array.<string>} */
            orbitIDs: [],
            /** Opacity of orbit line (0 = 100% transparent) 
             * @type {number} */
            orbitOpacity: 0.8,

            /** Visibility of GPS ground segment information modal 
             * @type {boolean}*/
            groundSegmentModalVisible: false,

            /** Visibility of sliding panel 
             * @type {boolean} */
            slidingPanelToggled: false,
            /** Text of toggle part of sliding panel 
             * @type {string} */
            slidingPanelText: "Click to reveal satellite selection!",

            /** Value of time speed slider
             * @type {number} */
            timeSpeedSliderValue: 1,
        };

        /** Timeout for opacity slider 
         * @type {any} */
        this.opacitySliderTimeout;

        /** Maximum number of selected items in satellite multiselect 
         * @type {number} */
        this.maxSelectedItems = 50;
    }

    /**
     * Callback for change in satellite multiselect selected items.
     * 
     * @param {Array.<string>} selectedItems IDs of selected items in multiselect
     */
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

    /**
     * Callback for change in ground segment multiselect selected items.
     * 
     * @param {Array.<string>} selectedItemsGroundSegment IDs of selected items in multiselect
     */
    onGroundSegmentSelectedItemsChange = (selectedItemsGroundSegment) => {
        this.setState({ selectedItemsGroundSegment });
    };

    /**
     *  Change visibility of help modal
     */
    toggleHelpModal = () => {
        this.setState({ helpModalVisible: !this.state.helpModalVisible });
    };

    /**
     * Callback for setting satellite for satellite info modal.
     * 
     * @param {SatelliteObject} sat Satellite to be displayed info about
     */
    satelliteModalSetSatelliteCallback = (sat) => {
        this.setState({
            satelliteModalSatellite: sat,
        });

        this.toggleSatelliteModal();
    }

    /**
     * Change visibility of satellite modal.
     */
    toggleSatelliteModal = () => {
        this.setState({
            satelliteModalVisible: !this.state.satelliteModalVisible,
        });
    };

    /**
     * Change visibility of GPS ground segment modal.
     */
    toggleGroundSegmentModal = () => {
        this.setState({
            groundSegmentModalVisible: !this.state.groundSegmentModalVisible,
        });
    }

    /**
     * Change visibility of sliding panel and change appropriately toggle text.
     */
    toggleSlidePanel = () => {
        if (this.state.slidingPanelToggled) {
            this.setState({ slidingPanelText: "Click to show satellite selection!" });
        } else {
            this.setState({ slidingPanelText: "Click to hide satellite selection!" });
        }

        this.setState({ slidingPanelToggled: !this.state.slidingPanelToggled });
    };

    /**
     * Adds satellite manually with ID in manualSatSelectTextInput.
     */
    addManual = () => {
        // Check whether user added valid input
        if (this.manualSatSelectTextInput.current._lastNativeText === undefined ||
            isNaN(this.manualSatSelectTextInput.current._lastNativeText) ||
            this.manualSatSelectTextInput.current._lastNativeText.trim() == "") {
                showMessage({
                    message: "Satellite ID is 5 digit number only.",
                    type: "danger",
                })

                this.manualSatSelectTextInput.current.clear();
                return;
        }

        // Add trailing zeros where the number is shorter than 5 chars
        let userInput = this.manualSatSelectTextInput.current._lastNativeText;
        if (userInput.length < 5) {
            userInput = ("00000" + userInput).slice(-5);
        }

        if (this.state.selectedItemsManual.includes(userInput) === false) {
            this.setState({ selectedItemsManual: [].concat(this.state.selectedItemsManual).concat(userInput) });
        } else {
            showMessage({
                message: "Satellite with this ID is already selected!",
                type: "danger",
            });
        }

        this.manualSatSelectTextInput.current.clear();
    }

    /**
     * Removes satellite manually with given ID.
     * 
     * @param {string} removeID ID to be removed from manualy selected IDs
     */
    removeManual = (removeID) => {
        this.setState({ selectedItemsManual: this.state.selectedItemsManual.filter(id => id != removeID) })
    }

    /**
     * Removes all manualy selected satellites.
     */
    removeManualAll = () => {
        this.setState({ selectedItemsManual: [] });
    }

    /**
     * Removes satellite with given ID from selected satellites.
     * 
     * @param {string} satID ID of satellite to be removed
     */
    removeSatelliteWithError = (satID) => {
        // Try to remove from selected in category
        if (this.state.selectedItems.includes(satID)) {
            let arr = this.state.selectedItems.filter(e => e !== satID);

            this.setState({ selectedItems: arr });
        }

        // Try to remove from selected manually
        if (this.state.selectedItemsManual.includes(satID)) {
            let arr = this.state.selectedItemsManual.filter(e => e !== satID);

            this.setState({ selectedItemsManual: arr });
        }

        showMessage({
            message: "Satellite with ID " + satID + " had to be removed from your selection because of internal problem with calculating its position.",
            type: "warning",
        });
    }

    /**
     * Get orbit status for satellite in Satellite Info Modal.
     */
    isOrbitEnabledForSatelliteInModal = () => {
        // No sat selected protection
        if (this.state.satelliteModalSatellite === null) {
            return false;
        }

        return this.state.orbitIDs.includes(this.state.satelliteModalSatellite.id);
    }

    /**
     * Change visibility of orbit ofsatellite with given ID.
     * 
     * @param {string} satelliteID Satellite which orbit we want to toggle
     */
    toggleOrbitVisibility = (satelliteID) => {
        // No sat selected protection
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

    /**
     * Renders main window of the Satviz application.
     * 
     * @returns {View} Top level View node
     */
    render() {
        return (
            <View style={styles.container}>

                <ViroARSceneNavigator
                    style={styles.arView}
                    autofocus={true}
                    shadowsEnabled={true}
                    initialScene={{ scene: InitialARScene }}
                    viroAppProps={{
                        satelliteClickCallback: this.satelliteModalSetSatelliteCallback,
                        satelliteIDs: [].concat(this.state.selectedItems).concat(this.state.selectedItemsManual),
                        groundSegmentIDs: this.state.selectedItemsGroundSegment,
                        orbitIDs: this.state.orbitIDs,
                        orbitOpacity: this.state.orbitOpacity,
                        timeScale: this.state.timeSpeedSliderValue,
                        removeSatelliteCallback: this.removeSatelliteWithError,
                    }}
                />

                <Modal
                    isVisible={this.state.helpModalVisible}
                    useNativeDriver={true}
                    onBackdropPress={this.toggleHelpModal}
                >
                    <View style={styles.helpModal}>
                        <TouchableOpacity onPress={this.toggleHelpModal} style={styles.modalCloseIcon}>
                            <Icon name="close-a" size={20} color="grey" />
                        </TouchableOpacity>

                        <Text style={styles.helpModalHeading}>About</Text>
                        <Text style={{ textAlign: 'justify' }}>This application is used to visualize satellites orbiting the Earth in augmented reality. Along with the orbit visualization, it allows the display of basic satellite information (position, speed, ...) as well as the display of positions and information regarding the terrestrial GPS segment. </Text>


                        <Text style={[styles.helpModalHeading, { marginTop: 10, textAlign: 'center' }]}>How To</Text>
                        <Text>1. Detect target   </Text>
                        <Text style={{ textAlign: 'center' }}>2. Choose satellite or ground segment element from slide-up menu   </Text>
                        <Text style={{ textAlign: 'center' }}>3. Click on satellites to get more info   </Text>


                        <Text style={[styles.helpModalHeading, { marginTop: 10 }]}>Settings</Text>
                        <Text>Orbit opacity: </Text>
                        <Slider
                            value={this.state.orbitOpacity}
                            minimumValue={0}
                            maximumValue={1}
                            onValueChange={(val) => {
                                clearTimeout(this.opacitySliderTimeout);
                                this.opacitySliderTimeout = setTimeout(() => {
                                    this.setState({ orbitOpacity: val })
                                }, 100)
                            }
                            }
                            style={{ width: '90%' }}
                        />
                    </View>
                </Modal>

                <TouchableOpacity onPress={this.toggleHelpModal} style={styles.modalIcon}>
                    <IconM name="help-outline" size={30} color="white" style={styles.iconShadow} />
                </TouchableOpacity>

                <View style={styles.bodyViewStyle}>
                    <CustomInfoModal
                        satellite={this.state.satelliteModalSatellite}
                        isModalVisible={this.state.satelliteModalVisible}
                        closeModal={() => this.toggleSatelliteModal()}
                        orbitEnabled={this.isOrbitEnabledForSatelliteInModal()}
                        orbitButtonCallback={this.toggleOrbitVisibility}
                    />
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
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <SectionedMultiSelect
                                            items={satelliteSelectItems.default}
                                            uniqueKey="id"
                                            subKey="children"
                                            selectText="Choose satellites from catogories"
                                            searchPlaceholderText="Search by name..."
                                            showDropDowns={true}
                                            readOnlyHeadings={false}
                                            selectChildren={true}
                                            showRemoveAll={true}
                                            onSelectedItemsChange={this.onSatelliteSelectedItemsChange}
                                            selectedItems={this.state.selectedItems}
                                            confirmText={`${this.state.maxItems ? 'Max satellites selected' : 'Confirm'}`}
                                        />
                                    </View>

                                    <View style={[styles.hairlineSplitLine]} />

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
                                            ref={this.manualSatSelectTextInput}
                                            keyboardType='numeric'
                                            value={this.state.text}
                                        />
                                        <View style={{ width: '20%' }}>
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

                                    <View style={styles.hairlineSplitLine} />

                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ width: '80%' }}>
                                            <SectionedMultiSelect
                                                items={groundSegmentSelectItems.default}
                                                uniqueKey="id"
                                                subKey="children"
                                                selectText="Choose ground segments"
                                                searchPlaceholderText="Search by name..."
                                                showDropDowns={false}
                                                readOnlyHeadings={true}
                                                selectChildren={true}
                                                // expandDropDowns={true} // causes weird bug at bottom part of screen
                                                showRemoveAll={true}
                                                onSelectedItemsChange={this.onGroundSegmentSelectedItemsChange}
                                                selectedItems={this.state.selectedItemsGroundSegment}
                                            />
                                        </View>
                                        <View style={{ position: 'absolute', top: 15, right: 25 }}>
                                            <TouchableOpacity onPress={this.toggleGroundSegmentModal}>
                                                <IconF name="info" size={30} color="gray" style={styles.iconShadow} />
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
                                            <View style={{ height: '93%' }}>
                                                <ScrollView>
                                                    <Text style={styles.groundSegmentHeading}>Master Control Stations and Alternate MCS</Text>
                                                    <Text style={styles.groundSegmentColors}>Red and Gold</Text>
                                                    <Text style={styles.groundSegmentText}>The master control station, located at Schriever Air Force Base in Colorado Springs, Colorado, is responsible for overall management of the remote monitoring and transmission sites. GPS ephemeris being a tabulation of computed positions, velocities and derived right ascension and declination of GPS satellites at specific times, replace "position" with "ephemeris" because the Master Control Station computes not only position but also velocity, right ascension and declination parameters for eventual upload to GPS satellites.</Text>

                                                    <Text style={[styles.groundSegmentHeading, { marginTop: 5 }]}>Monitor Stations</Text>
                                                    <Text style={styles.groundSegmentColors}>AFMS blue, AFSCN yellow, NGA purple</Text>
                                                    <Text style={styles.groundSegmentText}>Six monitor stations are located at Schriever Air Force Base in Colorado, Cape Canaveral, Florida, Hawaii, Ascension Island in the Atlantic Ocean, Diego Garcia Atoll in the Indian Ocean, and Kwajalein Island in the South Pacific Ocean.Six additional monitoring stations were added in 2005 in Argentina, Bahrain, United Kingdom, Ecuador, Washington DC, and Australia. Each of the monitor stations checks the exact altitude, position, speed, and overall health of the orbiting satellites. The control segment uses measurements collected by the monitor stations to predict the behavior of each satellite's orbit and clock. The prediction data is up-linked, or transmitted, to the satellites for transmission back to the users. The control segment also ensures that the GPS satellite orbits and clocks remain within acceptable limits. A station can track up to 11 satellites at a time. This "check-up" is performed twice a day, by each station, as the satellites complete their journeys around the earth. Noted variations, such as those caused by the gravity of the moon, sun and the pressure of solar radiation, are passed along to the master control station.</Text>

                                                    <Text style={[styles.groundSegmentHeading, { marginTop: 5 }]}>Ground Antennas</Text>
                                                    <Text style={styles.groundSegmentColors}>Green</Text>
                                                    <Text style={styles.groundSegmentText}>
                                                        The Ground Antennas uplink data to the satellites via S-band radio signals. These data includes ephemerides and clock correction information transmitted within the Navigation Message, as well as command telemetry from the MCS.
                                                        This information can be uploaded to each satellite three times per day, i.e., every 8 hours; nevertheless, it is usually updated just once a day.
                                                    </Text>
                                                </ScrollView>
                                            </View>
                                            <View style={{ width: '40%', marginTop: 10 }}>
                                                <Button title="Hide info" onPress={this.toggleGroundSegmentModal} />
                                            </View>
                                        </View>
                                    </Modal>

                                    <View style={[styles.hairlineSplitLine]} />

                                    <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                                        <Text>Set time speed ({Math.trunc(this.state.timeSpeedSliderValue).toString()}x normal)</Text>
                                        <Slider
                                            value={this.state.timeSpeedSliderValue}
                                            minimumValue={1}
                                            maximumValue={10000}
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
                    position={"top"}
                    autoHide={true}
                />
            </View>
        );
    }
}

module.exports = satviz

// Constants used in styles
const { width, height } = Dimensions.get('window');

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
        padding: 15,
        height: '50%',
        textAlign: 'center',
        alignItems: 'center',
    },
    helpModalHeading: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16
    },
    modalCloseIcon: {
        position: 'absolute',
        right: 9,
        top: 9,
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
        fontWeight: 'bold',
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
        textShadowOffset: { width: 0, height: 0 }
    },
});
