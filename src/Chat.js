import React from 'react'
import Firechat from './Firechat'
import {
  Text,
  SectionList,
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  PixelRatio,
  Dimensions,
} from 'react-native'
import Icon from "react-native-vector-icons/Ionicons"

import moment from 'moment'
import "moment/locale/pt-br"

import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import {BlurView} from 'react-native-blur';
import {KeyboardAccessoryView, KeyboardUtils} from 'react-native-keyboard-input';

import './demoKeyboards';

const IsIOS = Platform.OS === 'ios';

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
    refreshing: false,
    messages: [],
    messagesInSections: [],
    loadEarlier: false,
    isLoadingEarlier: false,
    text: '',
    customKeyboard: {
      component: undefined,
      initialProps: undefined,
    },
    receivedKeyboardData: undefined,
  }

  cursor = null
  firechat = new Firechat
  offset = 44 + 20

  async componentWillMount(){
    this.roomId = this.props.roomId? this.props.roomId: await this.firechat.getRoom(this.props.user.objectID)
    if(this.roomId)
      this.subscribe(this.roomId)
  }

  componentWillUnmount(){
    if(this.unsubscribe) 
      this.unsubscribe()
  }

  subscribe = roomId => {
    this.unsubscribe = this.firechat.getOnMessages(roomId, ({messages, cursor}) => {
      //const newMessages = messages.concat(this.state.messages)
      this.storeMessages(messages, cursor).then(()=>{

      })
    }) 
  }

  onLoadEarlier = () => {
    this.setState({isLoadingEarlier: true }) 
    this.firechat.getMessages(this.roomId, this.cursor).then(({messages, cursor}) => {
      const newMessages = messages.concat(this.state.messages)
      this.storeMessages(newMessages, cursor)   
    })
  }


  splitToSections = (messages) => {
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

  storeMessages = async (messages, cursor) => {
    let loadEarlier = false
    if(cursor)
      loadEarlier = true
    await this.setState({
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
      this.roomId = await this.firechat.createRoom(this.props.user.objectID)
      this.subscribe(this.roomId)
    }

    this.firechat.createMessages(this.roomId, messages)
  }
 
  getToolbarButtons = () => {
    return [
      {
        text: 'Fazer pagamento',
        testID: 'show2',
        onPress: () => this.showKeyboardView('Payment', 'SECOND - 2 (passed prop)'),
      },
    ];
  }

  resetKeyboardView = () => {
    this.setState({customKeyboard: {}})
  }

  onKeyboardResigned = () => {
    this.resetKeyboardView()
  }

  showKeyboardView = (component, title) => {
    this.setState({
      customKeyboard: {
        component,
        initialProps: {title},
      },
    })
  }

  keyboardAccessoryViewContent = () => {
    const InnerContainerComponent = (IsIOS && BlurView) ? BlurView : View;
    return (
      <InnerContainerComponent blurType="dark" style={styles.blurContainer}>
        <View style={styles.inputContainer}>
          <AutoGrowingTextInput
            maxHeight={200}
            style={styles.textInput}
            ref={(r) => {
              this.textInputRef = r;
            }}
            onChangeText={text => this.setState({text})}
            value={this.state.text}
            keyboardAppearance={'dark'}
            placeholder={'Escreva uma msg..'}
            underlineColorAndroid="transparent"
            onFocus={() => this.resetKeyboardView()}
            testID={'input'}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => this.onSend([{text: this.state.text}])}>
            <Text style={{color: 'white'}}>Enviar</Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row'}}>
          {
            this.getToolbarButtons().map((button, index) => {
              return (
                <TouchableOpacity onPress={button.onPress} style={{paddingLeft: 15, paddingBottom: 10}} key={index} testID={button.testID}>
                  <Text style={{color:'white'}}>{button.text}</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
      </InnerContainerComponent>
    )
  }

  render() {
    return (
      <React.Fragment>
        <SectionList
          inverted={true}
          onEndReached={this.onLoadEarlier}
          contentInset={{bottom: this.offset}}
          keyboardDismissMode='interactive'
          renderSectionFooter={({section})=>{
            return (
              <View style={styles.container}>
                <Text style={styles.text2}>{section.title}</Text>
              </View>
            )
          }}    
          sections={this.state.messagesInSections}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item, index, section, separators }) => {
            const me = item.userId == this.firechat.userId? 'right': 'left'
            return (
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
            )
          }} />

      <KeyboardAccessoryView
        renderContent={this.keyboardAccessoryViewContent}
        trackInteractive={true}
        kbInputRef={this.textInputRef}
        kbComponent={this.state.customKeyboard.component}
        kbInitialProps={this.state.customKeyboard.initialProps}
        onItemSelected={this.onKeyboardItemSelected}
        onKeyboardResigned={this.onKeyboardResigned}
        requiresSameParentToManageScrollView={true}
        scrollIsInverted={true}
        revealKeyboardInteractive={false}
      />
      </React.Fragment>
    )

  }
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
    margin: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  container: {
    width: 100,
    borderRadius: 18,
    backgroundColor: '#111',
    alignSelf: 'center',
    marginTop: 8
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
  text2: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blurContainer: {
    ...Platform.select({
      ios: {
        flex: 1,
      },
    }),
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingTop: 2,
    paddingBottom: 5,
    fontSize: 16,
    backgroundColor: '#666',
    borderWidth: 0.5 / PixelRatio.get(),
    borderRadius: 18,
  },
  sendButton: {
    paddingRight: 15,
    paddingLeft: 15,
    alignSelf: 'center',
  },
})