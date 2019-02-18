import React from "react"
import { FlatList } from 'react-native'
import MessageItem from './MessageItem'
import Firechat from './Firechat'
import { Navigation } from "react-native-navigation"

//@connect(state => ({rooms: state.rooms}))
export default class extends React.Component {
  
  state =  {
    rooms: []
  }

  firechat = new Firechat

  componentWillMount(){ 
    this.unsubscribe = this.firechat.getRooms(rooms => {
      let notifications = 0
      for(const room of rooms){
        notifications += room.notifications[this.firechat.userId]
      }
      Navigation.mergeOptions(this.props.componentId, {
        bottomTab: {
          badge: String(notifications? notifications: ""),
          badgeColor: '#fc6157'
        }
      })
      this.setState({rooms})
      //this.props.dispatch({type: "ADD_ROOMS", rooms})
    })
  }
  
  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return (
      <FlatList 
      data={this.state.rooms} 
      keyExtractor={item => item.id} 
      renderItem={({ item }) => (
        <MessageItem componentId={this.props.componentId} room={item} userId={this.firechat.userId} />
      )}/>
    )
  }
}
