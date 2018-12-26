import React, { Component } from 'react'
import {
    Text,
    Body,
    Left,
    Right,
    Icon,
    ListItem,
    Thumbnail,
    Badge
  } from "native-base"
  import {
    View,
  } from 'react-native'
  import Moment from 'moment'
  import 'moment/locale/pt-br'
  import { Navigation } from "react-native-navigation"

export default class extends Component {
  render() {
    return (
        <ListItem avatar noBorder onPress={() => {
          Navigation.push(this.props.componentId, { component: { name: 'Chat', passProps: {room: this.props.room}, options: { bottomTabs: { visible: false, drawBehind: true, animate: true } } }, });
        }}>
            <Left style={{marginLeft: 12}}>
              <Thumbnail source={{ uri: this.props.room.anotherUser.avatar }} /> 
            </Left>
            <Body>
              <Text>{this.props.room.anotherUser.name}</Text>
              <Text note>{this.props.room.lastMessage}</Text>
            </Body>
            <Right style={{flexDirection: 'row'}}>
                <View style={{alignItems: 'flex-end',}}>
                  <Text note>{Moment(this.props.room.updatedAt).fromNow()}</Text>
                  {/* <TimeAgo note live={false} component={Text} date={this.props.room.updatedAt} formatter={buildFormatter(ptStrings)} /> */}
                  <Badge><Text>{this.props.room.notifications[this.props.userId]}</Text></Badge>
                </View>
                <Icon style={{marginLeft: 10, alignSelf: 'center',}} ios='ios-arrow-forward' android="md-arrow-forward"/>
            </Right>
        </ListItem>
    )
  }
}
