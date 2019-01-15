import React from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from 'react-native'
import { Navigation } from "react-native-navigation"

export default class extends React.Component {

  render() {
    return (
      <View style={styles.container} key={'guyguy'}>
          <TouchableOpacity onPress={() => {
            if(this.props.fromMessagesScreen){
              Navigation.push("Chat", { 
                  component: { 
                      name: 'Profile',
                      passProps: {
                          user: this.props.user,
                          fromMessagesScreen: this.props.fromMessagesScreen
                      },
                      options: {
                          bottomTabs: { 
                              visible: false,
                              drawBehind: true
                          },
                      }
                  }
              })
            } else {
              Navigation.pop("Chat")
            }
          }}>
            <Image style={styles.button} source={{ uri: this.props.user.avatar }} />
          </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    alignSelf: 'center'
  }
})
