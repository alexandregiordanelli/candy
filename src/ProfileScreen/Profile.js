import React from 'react'
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
} from 'react-native'

import Firechat from '../Firechat'

export default class extends React.Component {
  static get options() {
    return {
      topBar: {
        drawBehind: true,
        elevation: 0,
        // noBorder: true,
        background: {
          color: 'transparent',
        },  
      }
    }
  }

  constructor(props){
    super(props)
    this.firechat = new Firechat
    this.state = {
      user: {}
    }
  }

  componentDidMount(){
    this.setState({user: this.firechat.user})
  }

  render() {
    const user = this.props.user? this.props.user: this.state.user
    return (
      <View style={{flex: 1}}>
        <Image resizeMode='cover' style={{aspectRatio: 1}} source={{uri: user.avatar}}/>
        <Button
          onPress={() => this.firechat.signOut()}
          title="Sair"
        />
      </View>
    )
  }
}