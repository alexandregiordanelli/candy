import { Navigation } from "react-native-navigation"
import { createStore, combineReducers } from 'redux'
import { Provider } from "react-redux"
import Firechat from "./src/Firechat"
import Login from "./src/LoginScreen/Login"
import Home from "./src/HomeScreen/Home"
import Messages from "./src/MessagesScreen/Messages"
import Chat from "./src/ChatScreen/Chat"
import Profile from "./src/ProfileScreen/Profile"

const rooms = (state = [], action) => {
  if(action.type == 'ADD_ROOMS')
    return action.rooms
  return state
}

const root = (state = "", action) => { //importante string vazia, deixar o firebase auth decidir
  if(action.type == 'SET_ROOT')
    return action.root
  return state
}

const store = createStore(combineReducers({rooms, root}))

Navigation.registerComponentWithRedux('Login', () => Login, Provider, store)
Navigation.registerComponentWithRedux('Home', () => Home, Provider, store)
Navigation.registerComponentWithRedux('Messages', () => Messages, Provider, store)
Navigation.registerComponentWithRedux('Chat', () => Chat, Provider, store)
Navigation.registerComponentWithRedux('Profile', () => Profile, Provider, store)

Navigation.events().registerAppLaunchedListener(() => {
  new Firechat(store)
})

