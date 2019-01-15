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
  Platform,
  Image
} from 'react-native'
import Icon from "react-native-vector-icons/Ionicons"

import moment from 'moment'
import "moment/locale/pt-br"

export default class extends React.Component {
  
  static options(props) {
    const fromMessagesScreen = !!props.room
    return {
      bottomTabs: { 
        visible: false, 
        drawBehind: true
      },
      topBar: { 
        title: { 
          text: fromMessagesScreen? props.room.anotherUser.name: props.user.name
        },
        rightButtons: [{
          id: 'avatar',
          component: {
            name: 'RightButton',
            passProps: {
              user: fromMessagesScreen?  props.room.anotherUser: props.user,
              fromMessagesScreen
            }
          },
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

  removeDuplicates = (myArr, prop) => {
    return myArr.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos)
  }

  componentWillMount(){
    this.room = this.props.room
    if(this.room){
      this.unsubscribe = this.firechat.getOnMessages(this.room.id, ({messages, cursor}) => {
        const oldMessages = this.state.messages
        this.storeMessages(this.removeDuplicates(messages.concat(oldMessages), "_id"), cursor)
      }) 
    }
  }

  componentWillUnmount(){
    if(this.unsubscribe) 
      this.unsubscribe()
  }

  onLoadEarlier = () => {
    this.setState({isLoadingEarlier: true }) 
    this.firechat.getMessages(this.room.id, this.cursor).then(({messages, cursor}) => {
      const oldMessages = this.state.messages
      this.storeMessages(this.removeDuplicates(messages.concat(oldMessages), "_id"), cursor)
    })
  }

  storeMessages = (messages, cursor) => {
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

  renderMessages(){
    return (
      <FlatList
      initialNumToRender={30}
      inverted={true}
      contentContainerStyle={{padding: 8}}
      contentInset={{top: -this.offset, left: 0, bottom: this.offset, right: 0}}
      keyboardDismissMode='interactive'
      data={this.state.messages}
      keyExtractor={item => item._id}
      renderItem={({ item, index }) => {
        if(item.user._id != this.firechat.userId){
          return (
            <React.Fragment>
              <View style={[styles.bubble, styles.left]}>
                <Text style={styles.text}>{item.text}</Text>
                <View style={{flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'flex-end', height: 18}}>
                  <Text style={styles.time}>{moment(item.createdAt).format("HH:mm")}</Text>
                </View>
              </View>
              <Day currentMessage={item} nextMessage={this.state.messages[index+1] || {}} />
            </React.Fragment>
          )
        } else {
          return (
            <React.Fragment>
              <View style={[styles.bubble, styles.right]}>
                <Text style={styles.text}>{item.text}</Text>
                <View style={{flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'flex-end', height: 18, marginRight: 8}}>
                  <Text style={styles.time}>{moment(item.createdAt).format("HH:mm")}</Text>
                  {item.sent && <Icon name="ios-checkmark" size={14} color="#fff" />}
                  {item.received && <Icon name="ios-checkmark" size={14} color="#fff" />}
                </View>
              </View>
              <Day currentMessage={item} nextMessage={this.state.messages[index+1] || {}} />
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
        {this.renderMessages()}
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
    color: 'white',
    margin: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  time: {
    color: 'white',
    fontSize: 11,
    marginRight: 4,
    marginBottom: 6,
  },
  left: {
    alignSelf: 'flex-start',
    backgroundColor: '#222',
  },
  right: {
    alignSelf: 'flex-end',
    backgroundColor: '#fc6157',
  },
  bubble: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    borderRadius: 5,
    maxWidth: 250,
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