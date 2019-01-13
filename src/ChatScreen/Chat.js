import React from 'react'
import { Navigation } from "react-native-navigation"
import {GiftedChat, Send, Composer, Bubble, InputToolbar} from 'react-native-gifted-chat'
import Firechat from '../Firechat'

import "moment"
import "moment/locale/pt-br"

export default class extends React.Component {
  static get options() {
    return {
      bottomTabs: { 
        visible: false, 
        drawBehind: true, 
        animate: true 
      },
      topBar: {
        rightButtons: [{
          id: 'avatar',
          icon: require('../../assets/signin.png'),
        }],
      }
    }
  }

  state = {
    messages: [],
    loadEarlier: false,
    isLoadingEarlier: false
  }
  cursor = null
  firechat = new Firechat

  constructor(props){
    super(props)
    Navigation.events().bindComponent(this)
  }

  navigationButtonPressed() {
    Navigation.push(this.props.componentId, { 
      component: { 
        name: 'Profile',
        options: {
          bottomTabs: { 
            visible: false, 
            drawBehind: true, 
            animate: true 
          },
        }
      }
    })
  }

  removeDuplicates = (myArr, prop) => {
    return myArr.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos)
  }

  componentWillMount(){
    this.room = this.props.room    
    this.unsubscribe = this.firechat.getOnMessages(this.room.id, ({messages, cursor}) => {
      this.getMessages(this.removeDuplicates(GiftedChat.append(this.state.messages, messages), "_id"), cursor)
    }) 
  }

  componentWillUnmount(){
    if(this.unsubscribe) 
      this.unsubscribe()
  }

  onLoadEarlier = () => {
    this.setState({isLoadingEarlier: true, messages: this.state.messages.concat() }) //https://github.com/FaridSafi/react-native-gifted-chat/pull/1047 render only updates with messages state changes
    this.firechat.getMessages(this.room.id, this.cursor).then(({messages, cursor}) => {
      this.getMessages(this.removeDuplicates(GiftedChat.prepend(this.state.messages, messages), "_id"), cursor)
    })
  }

  getMessages = (messages, cursor) => {
    let loadEarlier = false
    if(cursor)
      loadEarlier = true
    this.setState({
      messages,
      loadEarlier,
      isLoadingEarlier: false,
    })
    this.cursor = cursor
  }

  onSend = messages => {
    for(let message of messages){
      if(message.text.trim() == "")
        return
    }
    this.firechat.createMessages(this.room.id, messages)
  }

  renderSend = props => {
    return <Send {...props} textStyle={{color: '#fc6157'}} label={"Enviar"}/>
  }

  renderComposer = props => {
    return <Composer {...props} textInputStyle={{color: '#fff'}} textInputProps={{keyboardAppearance: 'dark'}} placeholderTextColor='#444' placeholder={'Escrever mensagem..'} />
  }

  renderInputToolbar = props => {
    return <InputToolbar {...props} containerStyle={{backgroundColor:'#333', borderTopColor: '#444'}}  />
  }

  renderBubble = props => {
    return (
      <Bubble
        {...props}
        textStyle={{
          left: {
            color: 'white',
          },
          right: {
            color: 'white',
          },
        }}
        wrapperStyle={{
          left: {
            backgroundColor: '#222',
          },
          right: {
            backgroundColor: '#fc6157'
          }
        }}
      />
    )
  }

  render() {
    return (
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend}
          loadEarlier={this.state.loadEarlier}
          isLoadingEarlier={this.state.isLoadingEarlier}
          onLoadEarlier={this.onLoadEarlier}
          label={"carregar mais"}
          alwaysShowSend={true}
          user={{_id: this.firechat.userId}}
          locale={'pt-br'}
          renderSend={this.renderSend}
          renderComposer={this.renderComposer}
          renderAvatar={null}
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar}
        />
    )
  }
}