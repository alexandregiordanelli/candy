import React from 'react'
import { Navigation } from "react-native-navigation"
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
} from 'react-native'

import Firechat from './Firechat'

export default class Profile extends React.Component {
  static get options(){
    return {
      topBar: {
        visible: false,
        drawBehind: true
      }
    }
  }

  state = {
    user: {}
  }

  firechat = new Firechat

  componentDidMount(){
    this.setState({user: this.firechat.user})
  }

  render() {
    const user = this.props.user? this.props.user: this.state.user
    return (
      <View style={{flex: 1}}>
        <Navigation.Element elementId={'cover'}>
          <Image resizeMode='cover' style={{aspectRatio: 1}} source={{uri: user.avatar}}/>
        </Navigation.Element>
        <Button
          onPress={() => Navigation.pop(this.props.componentId)}
          title="Sair"
        />
        <Button
          onPress={() => this.firechat.signOut()}
          title="Sair"
        />
      </View>
    )
  }
}