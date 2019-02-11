import firebase from 'react-native-firebase'
import DeviceInfo from 'react-native-device-info'
//import { Platform } from 'react-native'
import { getDocumentsNearby, encodeGeohash } from './Geofire'

const isEmulator = DeviceInfo.isEmulator()
const model = DeviceInfo.getModel()

export default class Firechat {

  static instance

  constructor(action) {
    if(Firechat.instance)
      return Firechat.instance
    this.firebase = firebase
    this.db = this.firebase.firestore()
    this.db2 = this.firebase.database()
    this.db.settings({ timestampsInSnapshots: true })
    this.roomsRef = this.db.collection("rooms")
    this.usersRef = this.db.collection("users")
    this.nMax = 40
    this.page = "open"

    this.firebase.auth().onAuthStateChanged(async user => {
      if(user){
        this.userId = user.uid
        this.userId = "NLXyeIMnS3QriEQ9vWH772Ltdn12"

        if(isEmulator){
          if(model == "iPhone 6")
            this.userId = "1zbTrIwKtwfsSTkqj3rV" //diná lopes
          else if(model == "iPhone 7")
            this.userId = "21XthwDngB0fnVCKigBl" //gonçala silveira
          else if(model == "iPhone 5s")
            this.userId = "3NoshWHsGYdHuoHqoNPK" //cida costa
        }
        
        await this.getUser()
        if(!this.user) 
          await this.createUser()
        await this.updatetUserLocation(-22.9690888, -43.2041239)
        if(this.page == "login" || this.page == "open"){
          this.page = "home"
          if(this.user.candie)
            action.goHomeForCandies()
          else
            action.goHome()
        }
      } else {
        if(this.page == "home" || this.page == "open"){
          this.page = "login"
          action.goLogin()
        }
        this.userId = null
      }
    })

    Firechat.instance = this
  }

  signOut(){
    this.firebase.auth().signOut()
  }

  async createFakeUser(name, avatar, latitude, longitude){
    const location = new firebase.firestore.GeoPoint(latitude, longitude)
    await this.usersRef.add({
      name,
      fake: true,
      candie: true,
      avatar,
      geohash: encodeGeohash([location.latitude, location.longitude]),
      location
    })
  }

  async createUser(){
    await this.usersRef.doc(this.userId).set({
      name: "Alexandre",
      avatar: "https://avatars2.githubusercontent.com/u/1518223?s=460&v=4"
    }, {merge: true})
    await this.getUser()
  }

  async updateUser(data){
    await this.usersRef.doc(this.userId).set(data, {merge: true})
    await this.getUser()
  }

  async getUser(){
    const doc = await this.usersRef.doc(this.userId).get()
    if(doc.exists)
      this.user = doc.data()
    else
      this.user = null
  }

  createMessages(roomId, messages){
    for(const message of messages){
      const msg = {
        ...message,
        user: {
          _id: this.userId
        },
        createdAt: this.firebase.firestore.FieldValue.serverTimestamp(),
      }
      delete msg._id 
      this.roomsRef.doc(roomId).collection("messages").add(msg)
      if(message.image || message.location)
        this.updateRoom(roomId, "[Anexo]")
      else
        this.updateRoom(roomId, message.text)
    }
  }

  getMessages(roomId, cursor){
    const ref = this.roomsRef.doc(roomId).collection("messages").orderBy("createdAt", "desc").startAfter(cursor).limit(this.nMax)
    return ref.get().then(querySnapshot => this.parseSnapshot(querySnapshot, roomId))
  }

  getOnMessages(roomId, cb){
    const ref = this.roomsRef.doc(roomId).collection("messages").orderBy("createdAt", "desc").limit(this.nMax)
    return ref.onSnapshot(querySnapshot => this.parseSnapshot(querySnapshot, roomId, cb))
  }

  parseSnapshot(querySnapshot, roomId, cb){
    const batch = this.db.batch()
    let cursor = querySnapshot.docs[querySnapshot.docs.length-1]
    let messages = []
    querySnapshot.forEach(doc => {
      const sent = !doc.metadata.hasPendingWrites
      const data = doc.data({serverTimestamps: 'estimate'})
      const message = {
        ...data,
        _id: doc.id,
        createdAt: data.createdAt || new Date(),
        sent
      }
      if(data.user._id != this.userId && !data.received){
        batch.update(doc.ref, {received: true})
        message.received = true
      }
      messages.push(message)
    })
    batch.commit().then(()=>{
      this.updateRoom(roomId)
    })
    if(messages.length < this.nMax)
      cursor = null
    const resp = {
      messages,
      cursor
    }
    if(cb)
      cb(resp)
    else
      return resp
  }

  getRoom(uid){
    return this.roomsRef.where(`users.${this.userId}`,'==', true).where(`users.${uid}`,'==', true).get().then(querySnapshot => {
      if(querySnapshot.empty)
        return null
      return querySnapshot.docs[0].id
    })
  }

  createRoom(uid){
    return this.getRoom(uid).then(id => {
      if(id == null){
        const timestamp = this.firebase.firestore.FieldValue.serverTimestamp()
        return this.roomsRef.add({
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
        }).then(doc => doc.id)
      } else {
        return id
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
                  notifications[this.userId] = 0
          }
          let room = { 
            notifications,
          }
          if(lastMessage){
            room.lastMessage = lastMessage
            room.updatedAt = firebase.firestore.FieldValue.serverTimestamp()
          }
          transaction.update(ref, room)
      })
    }).then(e => {
      //console.log("beleza")
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

  async getUsersNearby(radius){
    return await getDocumentsNearby(this.usersRef.where("fake","==",true), [this.user.location.latitude, this.user.location.longitude], radius)
  }

  async updatetUserLocation(latitude, longitude){
    const location = new this.firebase.firestore.GeoPoint(latitude, longitude)
    await this.updateUser({
      geohash: encodeGeohash([location.latitude, location.longitude]),
      location
    })
  }

}