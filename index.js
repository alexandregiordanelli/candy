import { Navigation } from "react-native-navigation"
import { createStore, combineReducers } from 'redux'
import { Provider } from "react-redux"
import Login from "./Login"
import Messages from "./Messages"
import Chat from "./Chat"
import Screen from "./Screen"

const rooms = (state = [], action) => {
  if(action.type == 'ADD_ROOMS')
    return action.rooms
  return state
}

const store = createStore(combineReducers({rooms}))

Navigation.registerComponentWithRedux(`Main`, () => Main, Provider, store) // decide the view
Navigation.registerComponentWithRedux(`Login`, () => Login, Provider, store) //route 1
Navigation.registerComponentWithRedux(`Messages`, () => Messages, Provider, store) //route 2
Navigation.registerComponentWithRedux(`Chat`, () => Chat, Provider, store) //route 2
Navigation.registerComponentWithRedux(`Screen`, () => Screen, Provider, store) //route 2

Navigation.events().registerAppLaunchedListener(() => {
  //Firechat.shared
})