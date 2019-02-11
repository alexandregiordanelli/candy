import React, {Component} from 'react'
import {Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {KeyboardRegistry} from 'react-native-keyboard-input';


class Payment extends Component {

  onButtonPress() {
    KeyboardRegistry.toggleExpandedKeyboard('Payment');
  }

  render() {
    return (
      <ScrollView contentContainerStyle={[styles.keyboardContainer, {backgroundColor: 'orange'}]}>
        <Text>*** ANOTHER ONE ***</Text>
        <Text>{this.props.title}</Text>
        <TouchableOpacity
          testID={'toggle-fs'}
          style={{padding: 20, marginTop: 30, backgroundColor: 'white'}}
          onPress={() => this.onButtonPress()}
        >
          <Text>
            Toggle Full-Screen!
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: 'black',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

KeyboardRegistry.registerKeyboard('Payment', () => Payment);