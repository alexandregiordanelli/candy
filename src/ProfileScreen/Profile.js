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
        noBorder: true,
        drawBehind: true,
        elevation: 0,
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
    this.firechat.getUser().then(user => {
      console.log(user)
      this.setState({user})
    })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Image resizeMode='cover' style={{aspectRatio: 1}} source={{uri: this.state.user.avatar}}/>
        <Button
          onPress={() => this.firechat.signOut()}
          title="Sair"
        />
      </View>
    )
  }
}