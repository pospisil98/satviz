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

export default class CustomInfoModal extends Component {
    constructor() {
        super();

        this.state = {
            data: {},
            explanationRequest: null,

            modalVisible: false,

            buttonText: "Show orbit"
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.modalVisible != this.props.isModalVisible) {
            this.setState({modalVisible: this.props.isModalVisible});
        }

        if (this.props.satellite && this.state.data.id != this.props.satellite[0].id) {
            this.updateSateliteData();
        }

        if (!this.props.orbitEnabled && this.state.buttonText != "Hide orbit") {
            this.changeText();
        }
        
        if (this.props.orbitEnabled && this.state.buttonText != "Show orbit") {
            this.changeText();
        }
    }

    updateSateliteData = () => {
        let temp = this.props.satellite[0].getDataForInfoModal();
        this.setState({ data: temp });

        if (this.props.isModalVisible) {
            setTimeout(() => {
                this.updateSateliteData();
            }, 500);
        }
    }

    closeModal = () => {
        this.setState({modalVisible: false,});
    }

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
            </View>
        );
    }

    changeText = () => {
        let text;
        if ( this.state.buttonText == "Show orbit") {
            text = "Hide orbit";
        } else {
            text = "Show orbit";
        }

        this.setState({
            buttonText: text,
        });
    }

    closeModalCallback = () => {
        this.setState({
            explanationRequest: null,
        });
        this.props.closeModal();
    }

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
                    <View style={styles.helpModal}>
                    <TouchableOpacity onPress={this.closeModalCallback} style={styles.modalCloseIcon}>
                        <Icon name="close-a" size={20} color="grey" />
                    </TouchableOpacity>

                        {this.renderTextInfo()}
                        {this.renderExplanation()}

                        <Button
                            title={this.state.buttonText}
                            onPress={() => {
                                this.props.orbitButtonCallback(this.state.data.id);
                                this.changeText();
                            }}
                        />
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    helpModal: {
        backgroundColor: "white",
        marginHorizontal: '10%',
        height: '50%',
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