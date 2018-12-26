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
      badge = <Text>{notifications}</Text>
    return (
        <ListItem noBorder style={{paddingRight: 0, paddingTop: 0, paddingBottom: 0 }} onPress={() => {
          Navigation.push(this.props.componentId, { component: { name: 'Chat', passProps: {room: this.props.room}, options: { bottomTabs: { visible: false, drawBehind: true, animate: true } } }, });
        }}>
          <View style={{flexDirection: 'row'}}>
            <Image style={{width: 56, height: 56, borderRadius: 28, marginLeft: 16}} source={{ uri: this.props.room.anotherUser.avatar }} /> 
            <View style={{flexDirection: 'row', flex: 1, borderBottomWidth: 1, borderBottomColor: '#ddd'}}>
              <View style={{flex: 1, justifyContent:'flex-start', alignItems: 'flex-start'}}>
                <Text>{this.props.room.anotherUser.name}</Text>
                <Text>{this.props.room.lastMessage}</Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent:'flex-end', alignItems: 'flex-start'}}>
                  <View style={{alignItems: 'flex-end', backgroundColor: 'yellow'}}>
                    <Text>{Moment(this.props.room.updatedAt).fromNow()}</Text>
                    {badge}
                  </View>
                  <Icon style={{alignSelf: 'center', marginRight: 16}} ios='ios-arrow-forward' android="md-arrow-forward"/>
              </View>
            </View>
          </View>
        </ListItem>
    )
  }
}
