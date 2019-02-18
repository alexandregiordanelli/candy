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
import Icon from "react-native-vector-icons/SimpleLineIcons"

import Firechat from './Firechat'

export default class Profile extends React.Component {
  static get options(){
    return {
      topBar: {
        visible: false,
        drawBehind: true,
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
          <Image resizeMode='stretch' style={{aspectRatio: 1}} source={{uri: user.avatar}} blurRadius={0}/>
        </Navigation.Element>
          <Text style={{color: 'white', fontSize: 26, margin: 20}}>{user.name}</Text>
        {this.props.user && <View style={{flexDirection: 'row', flex:1, justifyContent: 'center', position: 'absolute', bottom:0, left: 0, right: 0}}>
          <TouchableOpacity 
          style={{width: 60, height: 60, borderRadius: 30, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', margin: 30}}
          onPress={() => Navigation.pop(this.props.componentId)}
          >
            <Icon 
            name="arrow-left" size={20} 
            color="#fff" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
          style={{width: 60, height: 60, borderRadius: 30, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', margin: 30}}
          onPress={() => {
            if(this.props.fromMessagesScreen){
              Navigation.pop(this.props.componentId)
            } else {
              Navigation.push(this.props.componentId, { 
                component: { 
                  name: 'Chat',
                  id: "Chat",
                  passProps: {
                    user: this.props.user
                  }, 
                }
              })
            }
          }}
          >
            <Icon
            name="bubble" size={20} 
            color="#fff" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
          style={{width: 60, height: 60, borderRadius: 30, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', margin: 30}}
          onPress={() => Navigation.pop(this.props.componentId)}
          >
            <Icon 
            name="credit-card" size={20} 
            color="#fff" 
            />
          </TouchableOpacity>
        </View>}
        {!this.props.user && <Button
          color='#fc6157'
          onPress={() => {
            Navigation.showModal({
              stack: {
                children: [{
                  component: {
                    name: 'CreditCard',
                    options: {
                      topBar: {
                        title: {
                          text: 'Cartão de Crédito'
                        }
                      }
                    }
                  }
                }]
              }
            })
          }}
          title="Cartão de Crédito"
        />}
        {!this.props.user && <Button
          color='#fc6157'
          onPress={() => this.firechat.signOut()}
          title="Sair"
        />}
      </View>
    )
  }
}