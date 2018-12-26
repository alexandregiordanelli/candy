import React, { Component } from 'react'
import {
    Icon,
    ListItem,
    Badge
  } from "native-base"
  import {
    Image,
    Text,
    View,
  } from 'react-native'
  import Moment from 'moment'
  import 'moment/locale/pt-br'
  import { Navigation } from "react-native-navigation"

export default class extends Component {
  render() {
    let badge = null
    const notifications = this.props.room.notifications[this.props.userId]
    if(notifications)
      badge =  <View style={{borderRadius: 10, backgroundColor: '#007aff', minWidth: 20, alignItems: 'center'}}><Text style={{color: 'white'}}>{notifications}</Text></View>
    return (
        <ListItem noBorder style={{paddingRight: 0, paddingTop: 0, paddingBottom: 0 }} onPress={() => {
          Navigation.push(this.props.componentId, { component: { name: 'Chat', passProps: {room: this.props.room}, options: { bottomTabs: { visible: false, drawBehind: true, animate: true } } }, });
        }}>
          <View style={{flexDirection: 'row', paddingTop: 8, paddingBottom: 8}}>
            <Image style={{width: 56, height: 56, borderRadius: 28, marginLeft: 16, marginRight: 8}} source={{ uri: this.props.room.anotherUser.avatar }} /> 
            <View style={{flexDirection: 'row', flex: 1, borderBottomWidth: 1, borderBottomColor: '#ddd'}}>

              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={{fontWeight: '600'}}>{this.props.room.anotherUser.name}</Text>
                  <Text>{Moment(this.props.room.updatedAt).fromNow()}</Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                  <Text numberOfLines={2} style={{flex: 1}}>{this.props.room.lastMessage}</Text>{badge}
                </View>
              </View>

              <Icon style={{alignSelf: 'center',marginLeft: 8, marginRight: 16}} ios='ios-arrow-forward' android="md-arrow-forward"/>
            </View>
          </View>
        </ListItem>
    )
  }
}
