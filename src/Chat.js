import React from 'react'
import { Navigation } from "react-native-navigation"
import Firechat from './Firechat'
import {
  Text,
  SectionList,
  View,
  TextInput,
  InputAccessoryView,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView
} from 'react-native'
import Icon from "react-native-vector-icons/Ionicons"

import moment from 'moment'
import "moment/locale/pt-br"

export default class extends React.Component {
  
  static options(props) {
    const fromMessagesScreen = !!props.roomId
    return {
      bottomTabs: { 
        visible: false, 
        drawBehind: true
      },
      topBar: { 
        title: { 
          text: props.user.name
        },
        rightButtons: [{
          id: 'avatar',
          component: {
            name: 'RightButton',
            passProps: {
              user: props.user,
              fromMessagesScreen
            }
          },
        }],
      }
    }
  }

  state = {
    messages: [],
    messagesInSections: [],
    loadEarlier: false,
    isLoadingEarlier: false,
    text: ''
  }
  cursor = null
  firechat = new Firechat
  offset = 44 + 20

  removeDuplicates = (myArr, prop) => {
    return myArr.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos)
  }

  async componentWillMount(){
    this.roomId = this.props.roomId? this.props.roomId: await this.firechat.getRoom(this.props.user.id)
    if(this.roomId)
      this.subscribe(this.roomId)
  }

  componentWillUnmount(){
    if(this.unsubscribe) 
      this.unsubscribe()
  }

  subscribe = roomId => {
    this.unsubscribe = this.firechat.getOnMessages(roomId, ({messages, cursor}) => {
      const oldMessages = this.state.messages
      this.storeMessages(this.removeDuplicates(messages.concat(oldMessages), "_id"), cursor)
    }) 
  }

  onLoadEarlier = () => {
    this.setState({isLoadingEarlier: true }) 
    this.firechat.getMessages(this.roomId, this.cursor).then(({messages, cursor}) => {
      const oldMessages = this.state.messages
      this.storeMessages(this.removeDuplicates(oldMessages.concat(messages), "_id"), cursor)
    })
  }

  splitToSections = messages => {
    let sectionListData = []
    for(message of messages){
      const title = moment(message.createdAt).calendar(null, {
        sameDay: '[Hoje]',
        lastDay: '[Ontem]',
        lastWeek: 'dddd',
        sameElse: 'DD/MM/YYYY'
      })
      let hasTitle = -1
      for(let i = 0; i < sectionListData.length; i++){
        if(sectionListData[i].title == title){
          hasTitle = i
          break
        }
      }
      if(hasTitle > -1){
        sectionListData[hasTitle].data.push(message)
      } else {
        sectionListData.push({
          data: [message],
          title
        })
      }
    }
    return sectionListData
  }

  storeMessages = (messages, cursor) => {
    let loadEarlier = false
    if(cursor)
      loadEarlier = true
    this.setState({
      messages: messages,
      messagesInSections: this.splitToSections(messages),
      loadEarlier,
      isLoadingEarlier: false,
    })
    this.cursor = cursor
  }

  onSend = async messages => {
    this.setState({text: ''})
    for(let message of messages){
      if(message.text.trim() == "")
        return
    }
    if(!this.roomId){
      this.roomId = await this.firechat.createRoom(this.props.user.id)
      this.subscribe(this.roomId)
    }
    this.firechat.createMessages(this.roomId, messages)
  }

  renderMessages(){
    return (
      <SectionList
      // style={{  transform: [{ scaleY: -1 }] }}
      initialNumToRender={30}
      inverted={true}
      renderSectionFooter={({section})=>{
        return (
          <View style={styles.container}>
            <Text style={styles.text2}>{section.title}</Text>
          </View>
        )
      }}
      contentContainerStyle={{padding: 8}}
      contentInset={{top: -this.offset, left: 0, bottom: this.offset, right: 0}}
      keyboardDismissMode='interactive'
      sections={this.state.messagesInSections}
      keyExtractor={item => item._id}
      renderItem={({ item, index, section, separators }) => {
        const me = item.user._id == this.firechat.userId? 'right': 'left'
        return (
          <React.Fragment>
            <View style={[styles.bubble, styles[me]]}>
              <Text style={styles.text}>{item.text}</Text>
              <View style={{flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'flex-end', height: 18, marginRight: me=="right"? 8: 0}}>
                <Text style={styles.time}>{moment(item.createdAt).format("HH:mm")}</Text>
                {me == "right" && <React.Fragment>
                  {item.sent && <Icon name="ios-checkmark" size={14} color="#fff" />}
                  {item.received && <Icon name="ios-checkmark" size={14} color="#fff" />}
                </React.Fragment>}
              </View>
            </View>
          </React.Fragment>
        )
      }} />
    )
  }

  renderToolbar(){
    const toolbar = (
      <SafeAreaView style={{flexDirection: 'row', alignItems: 'center', borderTopColor: '#444', borderTopWidth: 0.5, backgroundColor: '#222'}}>
        <TextInput
          style={{flex: 1, color: 'white', paddingTop: 0, fontSize: 16, margin: 8}}
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
      </SafeAreaView>
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