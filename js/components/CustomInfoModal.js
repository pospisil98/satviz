import React, { Component } from 'react';

import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import Modal from "react-native-modal";

export default class CustominfoModal extends Component {
    constructor() {
        super(); 

        this.state = {
            data: {
                id: 0,
                latitude: 0,
                longitude: 0,
                height: 0,
                speed: 0,
            },
        };
    }

    getDataFromID = (satelliteID) => {   
        
        if (satelliteID === 'undefined') {
            satelliteID = 0;
        }

        let temp = {};
        temp['id'] = satelliteID;
        temp['latitude'] = 50.075539;
        temp['longitude'] = 14.437800;
        temp['height'] = 600;
        temp['speed'] = 2400;
        
        return temp;
    }


    render() {
        let data = this.getDataFromID(this.props.satelliteID);

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
                            <Text>ID: {data['id'].toString()}</Text>
                            <Text>Latitude: {data['latitude'].toString()}</Text>
                            <Text>Longitude: {data['longitude'].toString()}</Text>
                            <Text>Height: {data['height'].toString()}</Text>
                            <Text>Speed: {data['speed'].toString()}</Text>
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