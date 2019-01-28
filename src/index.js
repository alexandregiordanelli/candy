import { Navigation } from "react-native-navigation"
import { createStore, combineReducers } from 'redux'
import { Provider } from "react-redux"
import Firechat from "./Firechat"
import Login from "./Login"
import Home from "./Home"
import Messages from "./Messages"
import Chat from "./Chat"
import Profile from "./Profile"
import Demo from "./demoScreen"
import RightButton from "./RightButton"
import { Platform } from 'react-native'
import { goLogin, goHome, goDemo } from './navigation'

console.disableYellowBox = true

const rooms = (state = [], action) => {
  if(action.type == 'ADD_ROOMS')
    return action.rooms
  return state
}

const store = createStore(combineReducers({rooms}))

Navigation.registerComponentWithRedux('Demo', () => Demo, Provider, store)
Navigation.registerComponentWithRedux('Login', () => Login, Provider, store)
Navigation.registerComponentWithRedux('Home', () => Home, Provider, store)
Navigation.registerComponentWithRedux('Messages', () => Messages, Provider, store)
Navigation.registerComponentWithRedux('Chat', () => Chat, Provider, store)
Navigation.registerComponentWithRedux('Profile', () => Profile, Provider, store)
Navigation.registerComponent('RightButton', () => RightButton)

Navigation.events().registerAppLaunchedListener(() => {
  new Firechat({ goLogin, goHome, goDemo })

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
      style: 'light',
      backgroundColor: '#222'
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

