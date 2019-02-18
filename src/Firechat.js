import firebase from 'react-native-firebase'
import DeviceInfo from 'react-native-device-info'
import algoliasearch from 'algoliasearch'
const client = algoliasearch('GVVG7LEMK4', 'c769132b1de05084bcf0efef5b7cd92d')
const index = client.initIndex('customers')
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
        this.userId = "5521992527291"

        if(isEmulator){
          if(model == "iPhone 6")
            this.userId = "5521996180248" 
          else if(model == "iPhone 7")
            this.userId = "21XthwDngB0fnVCKigBl" 
          else if(model == "iPhone 5s")
            this.userId = "5521992527291" 
        }

        await this.getUser()
        if(!this.user) 
          await this.createUser()
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

  async getUser(){
    await new Promise(resolve => {
      index.getObject(this.userId, (err, user) => {
        this.user = user
        resolve()
      })
    })
  }

  createMessages(roomId, messages){
    for(const message of messages){
      const msg = {
        ...message,
        userId: this.userId,
        createdAt: this.firebase.firestore.FieldValue.serverTimestamp(),
      }
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
        createdAt: data.createdAt || new Date(),
        sent
      }
      if(data.userId != this.userId && !data.received){
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
              index.getObject(user, (err, anotherUser) => {
                let room = {
                  anotherUser
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