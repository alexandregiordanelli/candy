import React from 'react'
import { Navigation } from "react-native-navigation"
import Firechat from './Firechat'
import {
  Text,
  FlatList,
  View,
  TextInput,
  InputAccessoryView,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native'

import moment from 'moment'
import "moment/locale/pt-br"

export default class extends React.Component {
  static get options() {
    return {
      bottomTabs: { 
        visible: false, 
        drawBehind: true
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
  offset = 44 + 20

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
            visible: false
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
      const oldMessages = this.state.messages
      this.getMessages(this.removeDuplicates(oldMessages.concat(messages), "_id"), cursor)
    }) 

  }

  componentWillUnmount(){
    if(this.unsubscribe) 
      this.unsubscribe()
  }

  onLoadEarlier = () => {
    this.setState({isLoadingEarlier: true }) 
    this.firechat.getMessages(this.room.id, this.cursor).then(({messages, cursor}) => {
      const oldMessages = this.state.messages
      this.getMessages(this.removeDuplicates(messages.concat(oldMessages), "_id"), cursor)
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

  renderMessagesContainer(){
    return (
      <FlatList
      initialNumToRender={30}
      inverted={true}
      contentInset={{top: -this.offset, left: 0, bottom: this.offset, right: 0}}
      keyboardDismissMode='interactive'
      data={this.state.messages}
      keyExtractor={item => item._id}
      renderItem={({ item, index }) => {
        if(item.user._id != this.firechat.userId){
          return (
            <React.Fragment>
              <Day currentMessage={item} nextMessage={this.state.messages[index+1] || {}} />
              <View style={styles.textBubbleBackground}><Text style={styles.text}>{item.text}</Text></View>
            </React.Fragment>
          )
        } else {
          return (
            <React.Fragment>
              <Day currentMessage={item} nextMessage={this.state.messages[index+1] || {}} />
              <View style={styles.textBubbleBackground2}><Text style={styles.text}>{item.text}</Text></View>
            </React.Fragment>
          )
        }
      }} />
    )
  }

  renderToolbar(){
    const toolbar = (
      <View style={{flexDirection: 'row', borderTopColor: '#444', borderTopWidth: 0.5, backgroundColor: '#222'}}>
        <TextInput
          style={{flex: 1, color: 'white'}}
          onChangeText={text => {
            this.setState({text})
          }}
          keyboardAppearance={'dark'}
          value={this.state.text}
          placeholderTextColor='#444'
          placeholder={'Escrever mensagem..'}
          multiline={true}
        />
        <Button
          color='#fc6157'
          onPress={() => {
            this.onSend([{text: this.state.text}])
          }}
          title="Enviar"
        />
      </View>
    )
    // if(Platform.OS == "ios"){
    //   return (
    //     <InputAccessoryView>
    //       {toolbar}
    //     </InputAccessoryView>
    //   )
    // }
    return toolbar
  }

  render() {
    const chat = (
      <React.Fragment>
        {this.renderMessagesContainer()}
        {this.renderToolbar()}
      </React.Fragment>
    )
    if(Platform.OS == "ios"){
      return (
        <KeyboardAvoidingView behavior={'padding'} style={{flex: 1}}>
          {chat}
        </KeyboardAvoidingView>
      )
    } else {
      return (
        <View style={{flex: 1}}>
          {chat}
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  text: {
    padding: 10,
    color: 'white',
  },
  textBubbleBackground: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
    borderRadius: 10,
    minWidth: 110,
    maxWidth: 300,
    margin: 2,
  },
  textBubbleBackground2: {
    alignSelf: 'flex-end',
    backgroundColor: '#fc6157',
    borderRadius: 10,
    minWidth: 110,
    maxWidth: 300,
    margin: 2,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  text2: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
})

const Day = ({currentMessage, nextMessage}) => {
  if (!isSameDay(currentMessage, nextMessage)) {
    return (
      <View style={styles.container}>
        <Text style={styles.text2}>
          {moment(currentMessage.createdAt)
            // .locale(context.getLocale())
            .format('dddd')
            }
        </Text>
      </View>
    )
  }
  return null
}

const isSameDay = (currentMessage, nextMessage) => {
  if (!nextMessage.createdAt)
    return false
  const currentCreatedAt = moment(currentMessage.createdAt)
  const diffCreatedAt = moment(nextMessage.createdAt)
  return currentCreatedAt.isSame(diffCreatedAt, 'day')
}