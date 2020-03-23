import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Modal from "react-native-modal";

export default class CustomInfoModal extends Component {
    constructor() {
        super(); 

        this.state = {
            data: {
                id: 0,
                latitude: 0,
                longitude: 0,
                height: 0,
                velocity: 0,
            },
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.satellite && this.state.data.id != this.props.satellite[0].id) {
            this.updateSateliteData();
        }
    }

    updateSateliteData = () => {   
        console.log(this.props.satellite[0]);

        let temp = this.props.satellite[0].getDataForInfoModal();

        console.log(temp);

        this.setState({ data: temp });

        if (this.props.isModalVisible) {
            setTimeout(() => {
                this.updateSateliteData();
            }, 500);
        }
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
                        <View style={{ flex: 1 }}>
                            <Text>NORAD ID: {this.state.data.id}</Text>
                            <Text>Int'l Designator: {this.state.data.intlDes}</Text>
                            <Text>Apogee: {this.state.data.apogee}</Text>
                            <Text>Perigee: {this.state.data.perigee}</Text>
                            <Text>Inclination: {this.state.data.inclination}</Text>
                            <Text>Latitude: {this.state.data.latitude}</Text>
                            <Text>Longitude: {this.state.data.longitude}</Text>
                            <Text>Height: {this.state.data.height}</Text>
                            <Text>Velocity: {this.state.data.velocity}</Text>
                            <Text>Period: {this.state.data.period}</Text>
                        </View>
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
        alignItems: 'center'
    },
});