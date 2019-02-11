import React from 'react'
import { Navigation } from "react-native-navigation"
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native'

import Firechat from './Firechat'

export default class Payments extends React.Component {

  state = {
    user: {}
  }

  firechat = new Firechat


  render() {

    return (
      <View style={{flex: 1}}>

      </View>
    )
  }
}