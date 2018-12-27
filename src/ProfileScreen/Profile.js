import React from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
} from 'react-native'

import Firechat from '../Firechat'

export default class extends React.Component {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Profile'
        },
      }
    };
  }

  constructor(){
    super()
    this.firechat = new Firechat
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Profile</Text>
        <Button
          onPress={() => this.firechat.signOut()}
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