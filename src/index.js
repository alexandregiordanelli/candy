import { Navigation } from "react-native-navigation"
import Firechat from "./Firechat"
import Login from "./Login"
import Home from "./Home"
import Messages from "./Messages"
import Chat from "./Chat"
import Profile from "./Profile"
import RightButton from "./RightButton"
import { Platform } from 'react-native'
import { goLogin, goHome, goHomeForCandies } from './navigation'

console.disableYellowBox = true

Navigation.registerComponent('Login', () => Login)
Navigation.registerComponent('Home', () => Home)
Navigation.registerComponent('Messages', () => Messages)
Navigation.registerComponent('Chat', () => Chat)
Navigation.registerComponent('Profile', () => Profile)
Navigation.registerComponent('RightButton', () => RightButton)

Navigation.events().registerAppLaunchedListener(() => {
  new Firechat({ goLogin, goHome, goHomeForCandies })

  let options = {
    topBar: {
      visible: true,
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

