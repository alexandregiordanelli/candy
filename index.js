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

const removeDuplicates = (array, prop) => array.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos)

const sortByDistance = array => array.sort((a, b) => ((a.distance < b.distance) ? -1 : ((a.distance > b.distance) ? 1 : 0)))

const geofire = (state = [], action) => {
  if(action.type == 'KEY_ENTERED')
    return sortByDistance(removeDuplicates(state.concat(action.payload), "key"))
  else if(action.type == 'KEY_EXITED')
    return state.filter(obj => obj.key !== action.payload.key)
  else if(action.type == 'KEY_MOVED'){
    const index = state.findIndex(obj => obj.key == action.payload.key)
    state = state.concat()
    state[index] = action.payload
    return state
  }
  return state
}

const store = createStore(combineReducers({rooms, geofire}))

Navigation.registerComponentWithRedux('Login', () => Login, Provider, store)
Navigation.registerComponentWithRedux('Home', () => Home, Provider, store)
Navigation.registerComponentWithRedux('Messages', () => Messages, Provider, store)
Navigation.registerComponentWithRedux('Chat', () => Chat, Provider, store)
Navigation.registerComponentWithRedux('Profile', () => Profile, Provider, store)

Navigation.events().registerAppLaunchedListener(() => {
  new Firechat(store)
})

