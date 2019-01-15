import React, { Component } from 'react'
import {
  Image,
  Text,
  View,
  TouchableOpacity,
} from 'react-native'
import moment from 'moment'
import 'moment/locale/pt-br'
import { Navigation } from "react-native-navigation"
import Icon from "react-native-vector-icons/SimpleLineIcons"

export default class extends Component {

  renderTime = timestamp => {
    const a = moment(timestamp)
    const diff = moment().diff(a, "days")
    if(diff == 0)
      return a.format("HH:mm")
    else if(diff == 1)
      return "Ontem"
    else if(diff < 8)
      return a.format("dddd").toLowerCase()
    return a.format("D/M/YYYY")
  }

  render() {
    let badge = null
    const notifications = this.props.room.notifications[this.props.userId]
    if(notifications)
      badge =  <View style={{borderRadius: 10, backgroundColor: '#fc6157', minWidth: 20, alignItems: 'center'}}><Text style={{color: 'white'}}>{notifications}</Text></View>
    return (
        <TouchableOpacity style={{backgroundColor: '#333', paddingRight: 0, paddingTop: 0, paddingBottom: 0 }} onPress={() => {
          Navigation.push(this.props.componentId, { 
            component: { 
              name: 'Chat',
              id: "Chat",
              passProps: {
                roomId: this.props.room.id,
                user: this.props.room.anotherUser
              }, 
            }
          })
        }}>
          <View style={{flexDirection: 'row', paddingTop: 8}}>
            <Image style={{width: 56, height: 56, borderRadius: 28, marginLeft: 16, marginRight: 8, marginBottom: 8}} source={{ uri: this.props.room.anotherUser.avatar }} /> 
            <View style={{flexDirection: 'row', flex: 1, borderBottomWidth: 1, borderBottomColor: '#444', paddingBottom: 8}}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={{fontWeight: '600', color: '#fff'}}>{this.props.room.anotherUser.name}</Text>
                  <Text style={{color: notifications? '#fc6157': '#fff'}}>{this.renderTime(this.props.room.updatedAt)}</Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                  <Text numberOfLines={2} style={{flex: 1, color: 'white'}}>{this.props.room.lastMessage}</Text>{badge}
                </View>
              </View>
              <Icon style={{alignSelf: 'center',marginLeft: 8, marginRight: 16, fontSize: 15, color: '#444'}} name="arrow-right" size={30} color="#444" />
            </View>
          </View>
        </TouchableOpacity>
    )
  }
}
