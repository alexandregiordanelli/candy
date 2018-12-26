import firebase from 'react-native-firebase'
import { Navigation } from "react-native-navigation"
import { goLogin, goHome } from './navigation'
import DeviceInfo from 'react-native-device-info'
import {Platform } from 'react-native'

const isEmulator = DeviceInfo.isEmulator()

class Firechat {

  constructor() {
    this.db = firebase.firestore()
    this.db.settings({ timestampsInSnapshots: true })
    this.roomsRef = this.db.collection("rooms")
    this.usersRef = this.db.collection("users")

    firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.userId = user.uid
        if(isEmulator){
          if(Platform.OS == "ios"){
            this.userId = "NLXyeIMnS3QriEQ9vWH772Ltdn12"
          } else {  //android
            this.userId = "0S9g0nptjZUTCe7CTyIIdgm8uWh2"
          }
        } 
        else { //device
          this.userId = "ua2ezI5QJceHg5XhX17kiJvEY132"
        }
        this.createUser().then(user => {
          goHome()
        })
      } else {
        this.userId = null
        goLogin()
      }
    })
  }

  signOut(){
    firebase.auth().signOut()
  }

  createUser(){
    return new Promise(resolve => {
      this.getUser().then(user => {
        if(!user){
          fetch("https://randomuser.me/api/").then(e => e.json()).then(e => {
            const data = e.results[0]
            user = {
              name: data.name.first,
              avatar: data.picture.medium
            }
            this.usersRef.doc(this.userId).set(user).then(()=>{
              user._id = this.userId
              resolve(user)
            })
          })
        } else {
          resolve(user)
        }
      })
    })
  }

  updateUser(data){
    this.usersRef.doc(this.userId).update(data)
  }

  getUser(){
    return new Promise(resolve => {
      this.usersRef.doc(this.userId).get().then(doc => {
        if(doc.exists)
          resolve({...doc.data(), _id: doc.id})
        else
          resolve(false)
      })
    })
  }

  createMessages(roomId, messages){
    for(const message of messages){
      const msg = {
        ...message,
        user: {
          _id: this.userId
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }
      delete msg._id 
      this.roomsRef.doc(roomId).collection("messages").add(msg)
      if(message.image || message.location)
        this.updateRoom(roomId, "[Anexo]")
      else
        this.updateRoom(roomId, message.text)
    }
  }

  getMessages(roomId, nMax, cursor){
    let ref = this.roomsRef.doc(roomId).collection("messages").orderBy("createdAt", "desc")
    if(cursor)
      ref = ref.startAfter(cursor)
    return ref.limit(nMax).get().then(querySnapshot => { 
      let batch = this.db.batch()       
      let cursor = querySnapshot.docs[querySnapshot.docs.length-1]
      let messages = []
      querySnapshot.forEach(doc => {
        const data = doc.data()
        let message = {
          ...data,
          _id: doc.id,
          createdAt: data.createdAt,
          sent: true
        }
        if(data.user._id != this.userId && !data.received){
          batch.update(doc.ref, {received: true})
          this.updateRoom(roomId)
          message.received = true
        }
        messages.push(message)
      })
      batch.commit()
      if(messages.length < nMax)
        cursor = null
      return {
        messages,
        cursor
      }
    })
  }

  getOnMessages(roomId, cursor, cb){
    let ref = this.roomsRef.doc(roomId).collection("messages").orderBy("createdAt", "desc")
    if(cursor)
      ref = ref.endBefore(cursor)
    return ref.onSnapshot(querySnapshot => { 
      let batch = this.db.batch()   
      let messages = []
      querySnapshot.forEach(doc => {
        const sent = !doc.metadata.hasPendingWrites
        const data = doc.data({serverTimestamps: 'estimate'})
        const message = {
          ...data,
          _id: doc.id,
          createdAt: data.createdAt,
          sent
        }
        if(data.user._id != this.userId && !data.received){
          batch.update(doc.ref, {received: true})
          this.updateRoom(roomId)
          message.received = true
        }

        messages.push(message)
      })
      batch.commit()
      cb(messages)
    })
  }

  createRoom(uid){
    this.roomsRef.where(`users.${this.userId}`,'==', true).where(`users.${uid}`,'==', true).get().then(querySnapshot => {
      if(querySnapshot.empty){
        const timestamp = firebase.firestore.FieldValue.serverTimestamp()
        this.roomsRef.add({
          users: {
            [this.userId]: true,
            [uid]: true,
          },
          notifications: {
            [this.userId]: 0,
            [uid]: 0,
          },
          createdAt: timestamp,
          updatedAt: timestamp,
          lastMessage: ""
        })
      }
    })
  }

  updateRoom(roomId, lastMessage = null){
    const ref = this.roomsRef.doc(roomId)

    this.db.runTransaction(transaction => {
      return transaction.get(ref).then(doc => {
          const data = doc.data()
          let notifications = data.notifications
          for(let user in data.users){
            if(user != this.userId)
              if(lastMessage)
                notifications[user]++
              else
                if(notifications[this.userId] > 0)
                  notifications[this.userId]--
          }
          let room = { 
            notifications,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }
          if(lastMessage)
            room.lastMessage = lastMessage
          transaction.update(ref, room)
      })
    })
  }

  deleteRoom(roomId){
    this.roomsRef.doc(roomId).delete()
    //TODO delete subcolection messages on cloud functions
  }

  getRooms(cb){
    return this.roomsRef.where(`users.${this.userId}`,'==', true).onSnapshot(querySnapshot => { 
      let rooms = []
      querySnapshot.forEach(doc => {
        rooms.push(new Promise(resolve => {
          const data = doc.data({serverTimestamps: 'estimate'})
          for(let user in data.users){
            if(user != this.userId){
              this.usersRef.doc(user).get().then(anotherUser => {
                let room = {
                  anotherUser: anotherUser.data()
                }
                room.notifications = data.notifications
                room.lastMessage = data.lastMessage
                room.updatedAt = data.updatedAt
                room.anotherUser.id = anotherUser.id
                room.id = doc.id
                resolve(room)
              })
            }
          }
        }))
      })
      Promise.all(rooms).then(rooms => {
        rooms = rooms.sort(function(a, b) {
          a = new Date(a.updatedAt)
          b = new Date(b.updatedAt)
          return a>b ? -1 : a<b ? 1 : 0
        })
        cb(rooms)
      })
    })
  }
}
Navigation.events().registerAppLaunchedListener(() => {
  Firechat.shared = new Firechat()
})
export default Firechat