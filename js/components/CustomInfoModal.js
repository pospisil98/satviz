import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Modal from "react-native-modal";

const messageDict = {
    id: "The NORAD Catalog Number or USSPACECOM object number is a sequential 5-digit number assigned by USSPACECOM to all Earth orbiting satellites in order of identification.",
    intlDes: "The International Designator (or NSSDC ID) is an international naming convention for satellites. It consists of the launch year, a 3-digit incrementing launch number of that year and up to a 3-letter code representing the sequential id of a piece in a launch. Only publicly known satellites are designated.",
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
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.satellite && this.state.data.id != this.props.satellite[0].id) {
            this.updateSateliteData();
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

    renderTextInfo = () => {
        return(
            <View style={{ flex: 1 }}>
                <Text onPress={() => {this.setState({explanationRequest: "id"})}}>NORAD ID: {this.state.data.id}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "intlDes"})}}>Int'l Designator: {this.state.data.intlDes}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "apogee"})}}>Apogee: {this.state.data.apogee}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "perigee"})}}>Perigee: {this.state.data.perigee}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "inclination"})}}>Inclination: {this.state.data.inclination}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "latitude"})}}>Latitude: {this.state.data.latitude}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "longitude"})}}>Longitude: {this.state.data.longitude}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "height"})}}>Height: {this.state.data.height}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "velocity"})}}>Velocity: {this.state.data.velocity}</Text>
                <Text onPress={() => {this.setState({explanationRequest: "period"})}}>Period: {this.state.data.period}</Text>
            </View>
        );
    }

    renderExplanation = () => {
        return(
            <Text>
                {messageDict[this.state.explanationRequest]}
            </Text>
        );
    }

    render() {
        if (!this.props.isModalVisible) {
            return <View></View>
        }

        return (
            <View>
                <Modal isVisible={this.props.isModalVisible} 
                    useNativeDriver={true}
                    onBackdropPress={this.props.closeModal}
                >
                    <View style={styles.helpModal}>
                        {this.renderTextInfo()}  
                        {this.renderExplanation()}
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
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: "5%",
    },
});