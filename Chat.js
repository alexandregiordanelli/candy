import React from 'react'
import {
  Button,
  Text,
  Container,
  Body,
  Header,
  Left,
  Right,
  Icon,
  Title,
  Thumbnail
} from "native-base"
import Firechat from './Firechat'
import {
  StyleSheet,
  View,
} from 'react-native'

import {GiftedChat, Bubble, SystemMessage} from 'react-native-gifted-chat'
//import CustomActions from './CustomActions'
//import CustomView from './CustomView'
import "moment"
import "moment/locale/pt-br"

export default class extends React.Component {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Chat'
        },
      }
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: false,
      typingText: null,
      isLoadingEarlier: false
    }

    this.onSend = this.onSend.bind(this)
    //this.renderCustomActions = this.renderCustomActions.bind(this)
    this.renderBubble = this.renderBubble.bind(this)
    this.renderSystemMessage = this.renderSystemMessage.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
    this.onLoadEarlier = this.onLoadEarlier.bind(this)
    this.cursor = null
  }

  removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
    })
  }

  componentDidMount(){
    this.room = this.props.room
    
    this.onLoadEarlier(cursor => {
      this.unsubscribe = Firechat.shared.getOnMessages(this.room.id, cursor, messages => {
        this.setState(previousState => {
          return {
            messages: this.removeDuplicates(GiftedChat.append(previousState.messages, messages), "_id")
          }
        })
      }) 
    })
  }

  componentWillUnmount(){
    if(this.unsubscribe)
      this.unsubscribe()
  }

  onLoadEarlier(cb) {
    this.setState({
      isLoadingEarlier: true,
      messages: this.state.messages.concat(), //https://github.com/FaridSafi/react-native-gifted-chat/pull/1047 render only updates with messages state changes
    })
    Firechat.shared.getMessages(this.room.id, 20, this.cursor).then(({messages, cursor}) => {
      let loadEarlier = false
      if(cursor)
        loadEarlier = true
      this.setState(previousState => {
        return {
          messages: this.removeDuplicates(GiftedChat.prepend(previousState.messages, messages), "_id"),
          loadEarlier,
          isLoadingEarlier: false,
        }
      })
      this.cursor = cursor
      if(cb)
        cb(cursor)
    })
  }

  onSend(messages = []) {
    Firechat.shared.createMessages(this.room.id, messages)
  }

  // renderCustomActions(props) {
  //   return <CustomActions {...props}/>
  // }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f0f0f0',
          }
        }}
      />
    );
  }

  renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
        }}
        textStyle={{
          fontSize: 14,
        }}
      />
    )
  }

  // renderCustomView(props) {
  //   return <CustomView {...props} />
  // }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      )
    }
    return null
  }

  render() {
    return (
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend}
          loadEarlier={this.state.loadEarlier}
          onLoadEarlier={this.onLoadEarlier}
          isLoadingEarlier={this.state.isLoadingEarlier}
          user={{_id: Firechat.shared.userId}}
          locale={'pt-br'}
          //renderActions={this.renderCustomActions}
          renderBubble={this.renderBubble}
          renderSystemMessage={this.renderSystemMessage}
          //renderCustomView={this.renderCustomView}
          renderFooter={this.renderFooter}
          renderAvatar={null}
        />
    )
  }
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
})