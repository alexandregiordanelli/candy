import { Navigation } from "react-native-navigation"
import { createStore, combineReducers } from 'redux'
import { Provider } from "react-redux"
import Firechat from "./Firechat"
import Login from "./LoginScreen/Login"
import Home from "./HomeScreen/Home"
import Messages from "./MessagesScreen/Messages"
import Chat from "./ChatScreen/Chat"
import Profile from "./ProfileScreen/Profile"
import { Platform } from 'react-native'

console.disableYellowBox = true

const rooms = (state = [], action) => {
  if(action.type == 'ADD_ROOMS')
    return action.rooms
  return state
}

const store = createStore(combineReducers({rooms}))

Navigation.registerComponentWithRedux('Login', () => Login, Provider, store)
Navigation.registerComponentWithRedux('Home', () => Home, Provider, store)
Navigation.registerComponentWithRedux('Messages', () => Messages, Provider, store)
Navigation.registerComponentWithRedux('Chat', () => Chat, Provider, store)
Navigation.registerComponentWithRedux('Profile', () => Profile, Provider, store)

Navigation.events().registerAppLaunchedListener(() => {
  new Firechat(store)

  let options = {
    topBar: {
      title: {
        color: 'white',
      },
      backButton: { 
        color: 'white' 
      },
      background: {
        translucent: true,
      },
      barStyle: 'black',
      drawBehind: true,
    },
    bottomTabs: {
      translucent: true,
      barStyle: 'black', 
      drawBehind: true,
    },
  }
  if(Platform.OS == "android"){
    options = {
      topBar: {
        title: {
          color: 'white',
        },
        backButton: { 
          color: 'white' 
        },
        background: {
          color: '#222',
        },
        drawBehind: false
      }, 
      bottomTabs: {
        drawBehind: false,
        backgroundColor: '#222',
      },
    }
  }


  Navigation.setDefaultOptions({
    layout: {
      backgroundColor: '#333'
    },
    statusBar: {
      style: 'light'
    },
    bottomTab: {
      textColor: '#666',
      iconColor: '#666',
      selectedIconColor: '#fff',
      selectedTextColor: '#fff'
    },
    ...options
  })
})

