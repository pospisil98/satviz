/** 
 *  @fileOverview Component for displaying info about selected satellite. 
 *
 *  @author       Vojtěch Pospíšil
 */

import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Button
} from 'react-native';

import Modal from "react-native-modal";

import Icon from 'react-native-vector-icons/Fontisto';

 /**
 * Dictionary of term descriptions.
 * @constant
 *
 * @type {Object<string, string>}
 */
const messageDict = {
    id: "The NORAD Catalog Number or USSPACECOM object number is a sequential 5-digit number assigned by USSPACECOM to all Earth orbiting satellites in order of identification.",
    intlDes: "The International Designator is an naming convention for satellites. It consists of the launch year, a 3-digit incrementing launch number of that year and up to a 3-letter code representing the sequential id of a piece in a launch. Only publicly known satellites are designated.",
    apogee: "Apogee is the point where the satellite is farthest from Earth is called apogee (sometimes called apoapsis, or apifocus",
    perigee: "Perigee is the point where the satellite is closest to the Earth (sometimes called periapsis or perifocus)",
    inclination: "Inclination is the angle between the orbital plane and the equatorial plane. By convention, inclination is a number between 0 and 180 degrees. A satellite in a geostationary orbit has an inclination zero. A satellite in a polar orbit will have an inclination of 90 degrees.",
    latitude: "Latitude is a geographic coordinate that specifies the north–south position of a point on the Earth's surface. It is an angle which ranges from 0° at the Equator to 90° (North or South) at the poles.",
    longitude: "Longitude is a geographic coordinate that specifies the east–west position of a point on the Earth's surface. The longitude of other places is measured as the angle east or west from the Prime Meridian, ranging from 0° at the Prime Meridian to +180° eastward and −180° westward.",
    height: "Altitude or height (sometimes known as 'depth') a distance measurement, usually in the vertical or \"up\" direction, between a reference datum and a point or object. It is basically the distance between object and Earth sea level.",
    velocity: "The velocity of an object is the rate of change of its position with respect to a frame of reference, and is a function of time. It is more known as speed.",
    period: "Period is the amount of time to complete one revolution around the Earth.",
}

 /**
 * Dictionary of orbit toggle button messages.
 * @constant
 *
 * @type {Object<string, string>}
 */
const message = {
    show: "Show orbit",
    hide: "Hide orbit"
}

/**
 * Component for displaying info about selected satellite.
 * 
 * 
 */
export default class CustomInfoModal extends Component {
    constructor() {
        super();

        this.state = {
            /** Data for rendering information about satellite. @type {Object<string, string>} */
            data: {},
            /** Selected term to be explained. @type {string} */
            explanationRequest: null,
            /** State of component (modal) visibility - `true` means modal is visible @type {boolean} */
            modalVisible: false,
            /** Text of the orbit toggle button. @type {string} */
            buttonText: message.hide,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        // update state to rerender component
        if (this.state.modalVisible != this.props.isModalVisible) {
            this.setState({modalVisible: this.props.isModalVisible});
        }

        // update info when the sat ID is changed
        if (this.props.satellite && this.state.data.id != this.props.satellite[0].id) {
            this.updateSateliteData();
        }

        // set apropriate text to orbit toggle button
        if (this.props.orbitEnabled != prevProps.orbitEnabled && prevProps.orbitEnabled) {
            if (!this.props.orbitEnabled) {
                this.setState({
                    buttonText: message.hide,
                });
            }
            
            if (this.props.orbitEnabled) {
                this.setState({
                    buttonText: message.show,
                });
            }
        }
    }

    /**
     * Updates information about satellite.
     */
    updateSateliteData = () => {
        let temp = this.props.satellite[0].getDataForInfoModal();
        this.setState({ data: temp });

        if (this.props.isModalVisible) {
            setTimeout(() => {
                this.updateSateliteData();
            }, 500);
        }
    }

    /**
     * Alternates between toggle orbit button messages.
     */
    changeText = () => {
        let text;
        if (this.state.buttonText === message.show) {
            text = message.hide;
        } else {
            text = message.show;
        }

        this.setState({
            buttonText: text,
        });
    }

    /**
     * Callback for closing modal window.
     */
    closeModalCallback = () => {
        // next opening of modal will be without any explanation
        this.setState({
            explanationRequest: null,
        });

        this.props.closeModal();
    }

    /**
     * Renders text info with satellite informations.
     * 
     * @returns {View} All satellite informations
     */
    renderTextInfo = () => {
        return (
            <View style={styles.textInfo}>
                <Text onPress={() => { this.setState({ explanationRequest: "id" }) }}>
                    <Text style={styles.boldFont}>NORAD ID: </Text>{this.state.data.id}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "intlDes" }) }}>
                    <Text style={styles.boldFont}>Int'l Designator: </Text>{this.state.data.intlDes}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "apogee" }) }}>
                    <Text style={styles.boldFont}>Apogee: </Text>{this.state.data.apogee}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "perigee" }) }}>
                    <Text style={styles.boldFont}>Perigee: </Text>{this.state.data.perigee}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "inclination" }) }}>
                    <Text style={styles.boldFont}>Inclination: </Text>{this.state.data.inclination}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "latitude" }) }}>
                    <Text style={styles.boldFont}>Latitude: </Text>{this.state.data.latitude}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "longitude" }) }}>
                    <Text style={styles.boldFont}>Longitude: </Text>{this.state.data.longitude}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "height" }) }}>
                    <Text style={styles.boldFont}>Height: </Text>{this.state.data.height}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "velocity" }) }}>
                    <Text style={styles.boldFont}>Velocity: </Text>{this.state.data.velocity}
                </Text>
                <Text onPress={() => { this.setState({ explanationRequest: "period" }) }}>
                    <Text style={styles.boldFont}>Period: </Text>{this.state.data.period}
                </Text>
                <Text style={{fontSize: 10, color: 'gray', marginTop: 5}}>By clicking on line you can get more info</Text>
            </View>
        );
    }

    /**
     * Renders selected term explanation.
     */
    renderExplanation = () => {
        return (
            <Text style={styles.explanation}>
                {messageDict[this.state.explanationRequest]}
            </Text>
        );
    }

    render() {
        if (!this.state.modalVisible) {
            return <View></View>
        }

        return (
            <View>
                <Modal isVisible={this.state.modalVisible}
                    useNativeDriver={true}
                    onBackdropPress={this.closeModalCallback}
                >
                    <View style={styles.infoModal}>
                    <TouchableOpacity onPress={this.closeModalCallback} style={styles.modalCloseIcon}>
                        <Icon name="close-a" size={20} color="grey" />
                    </TouchableOpacity>

                        {this.renderTextInfo()}

                        <View style={{marginTop: 10}}>
                            <Button
                                title={this.state.buttonText}
                                onPress={() => {
                                    this.props.orbitButtonCallback(this.state.data.id);
                                    this.changeText();
                                }}
                            />
                        </View>

                        {this.renderExplanation()}
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    infoModal: {
        backgroundColor: "white",
        marginHorizontal: '10%',
        height: '53%',
        paddingHorizontal: "5%",
    },
    modalCloseIcon: {
        position: 'absolute',
        right: '5%',
        top: '2%',
    },
    infoRow : {
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: 'row',
    },
    rowElement: {
        flex: 1,
        alignSelf: 'stretch' },
    boldFont: {
        fontWeight: 'bold',
    },
    textInfo: {
        paddingTop: '5%',
        width: '80%',
    },
    explanation: {
        paddingTop: '3%',
    }
});