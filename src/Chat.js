import React from 'react'
import { Navigation } from "react-native-navigation"
import Firechat from './Firechat'
import {
  Text,
  SectionList,
  FlatList,
  View,
  TextInput,
  InputAccessoryView,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  PixelRatio,
  NativeModules,
  Dimensions,
  RefreshControl
} from 'react-native'
import Icon from "react-native-vector-icons/Ionicons"

import moment from 'moment'
import "moment/locale/pt-br"

import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import {BlurView} from 'react-native-blur';
import {KeyboardAccessoryView, KeyboardUtils} from 'react-native-keyboard-input';

import './demoKeyboards';

const IsIOS = Platform.OS === 'ios';
const TrackInteractive = true
const screenSize = Dimensions.get('window')

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
      const newMessages = this.removeDuplicates(messages.concat(this.state.messages), "_id").sort((a,b)=>a.createdAt - b.createdAt)
      this.storeMessages(newMessages, cursor)
    }) 
  }

  onLoadEarlier = () => {
    this.setState({isLoadingEarlier: true }) 
    this.firechat.getMessages(this.roomId, this.cursor).then(({messages, cursor}) => {
      const newMessages = this.removeDuplicates(messages.concat(this.state.messages), "_id").sort((a,b)=>a.createdAt - b.createdAt)
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
    KeyboardUtils.dismiss()
  }
 
  getToolbarButtons = () => {
    return [
      {
        text: 'show1',
        testID: 'show1',
        onPress: () => this.showKeyboardView('KeyboardView', 'FIRST - 1 (passed prop)'),
      },
      {
        text: 'show2',
        testID: 'show2',
        onPress: () => this.showKeyboardView('AnotherKeyboardView', 'SECOND - 2 (passed prop)'),
      },
      {
        text: 'reset',
        testID: 'reset',
        onPress: () => this.resetKeyboardView(),
      },
    ];
  }

  resetKeyboardView = () => {
    this.setState({customKeyboard: {}});
  }

  onKeyboardResigned = () => {
    this.resetKeyboardView();
  }

  showKeyboardView = (component, title) => {
    this.setState({
      customKeyboard: {
        component,
        initialProps: {title},
      },
    });
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
              console.log(button)
              return (
                <TouchableOpacity onPress={button.onPress} style={{paddingLeft: 15, paddingBottom: 10}} key={index} testID={button.testID}>
                  <Text style={{color:'white'}}>{button.text}</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
      </InnerContainerComponent>
    );
  }


  render() {
    return (
      <View style={{flex: 1}}>
        <SectionList
          refreshControl={
            <RefreshControl
              refreshing={this.state.isLoadingEarlier}
              onRefresh={this.onLoadEarlier}
            />
          }
          contentInset={{top: this.offset}}
          automaticallyAdjustContentInsets={true}
          contentInsetAdjustmentBehavior='scrollableAxes'
          keyboardDismissMode='interactive'
          renderSectionHeader={({section})=>{
            return (
              <View style={styles.container}>
                <Text style={styles.text2}>{section.title}</Text>
              </View>
            )
          }}    
          sections={this.state.messagesInSections}
          keyExtractor={item => item._id}
          renderItem={({ item, index, section, separators }) => {
            const me = item.user._id == this.firechat.userId? 'right': 'left'
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
        // onHeightChanged={IsIOS ? height => this.setState({keyboardAccessoryViewHeight: height}) : undefined}
        trackInteractive={true}
        kbInputRef={this.textInputRef}
        kbComponent={this.state.customKeyboard.component}
        kbInitialProps={this.state.customKeyboard.initialProps}
        onItemSelected={this.onKeyboardItemSelected}
        onKeyboardResigned={this.onKeyboardResigned}
        // revealKeyboardInteractive
      />
    </View>
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