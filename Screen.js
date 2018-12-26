import React from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
} from 'react-native'

import Firechat from './Firechat'

export default class Screen extends React.Component {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Screen'
        },
      }
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Screen</Text>
        <Button
          onPress={() => Firechat.shared.signOut()}
          title="Sair"
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})