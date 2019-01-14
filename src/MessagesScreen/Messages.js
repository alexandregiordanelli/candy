import React from "react"
import { FlatList } from 'react-native'
import { connect } from 'react-redux'
import MessageItem from './MessageItem'
import Firechat from '../Firechat'

@connect(state => ({rooms: state.rooms}))
export default class extends React.Component {
  
  firechat = new Firechat

  componentWillMount(){ 
    this.unsubscribe = this.firechat.getRooms(rooms => {
      this.props.dispatch({type: "ADD_ROOMS", rooms})
    })
  }
  
  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return (
      <FlatList 
      data={this.props.rooms} 
      keyExtractor={item => item.id} 
      renderItem={({ item }) => (
        <MessageItem componentId={this.props.componentId} room={item} userId={this.firechat.userId} />
      )}/>
    )
  }
}
