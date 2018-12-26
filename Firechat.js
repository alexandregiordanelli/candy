import firebase from 'react-native-firebase'

class Firechat {

  constructor() {
    this.db = firebase.firestore()
    this.db.settings({ timestampsInSnapshots: true })
    this.roomsRef = this.db.collection("rooms")
    this.usersRef = this.db.collection("users")

    firebase.auth().signInAnonymously()

  }

  getOnAuth(cb){
    return firebase.auth().onAuthStateChanged(user => {
      this.userId = null
      if(user){
        this.userId = user.uid
        //this.createUser().then(() => {
          //this.createRoom("ERd3rVuyasaZscuLCIFjz90O7tQ2")
          this.unsubscribe = this.getRooms(cb)
        //})
      } else {
        if(this.unsubscribe)
          this.unsubscribe()
      }
    })
  }

  createFakeUser(){
    fetch("https://randomuser.me/api/").then(e => e.json()).then(e => {
      const data = e.results[0]
      this.usersRef.add({
        name: data.name.first,
        avatar: data.picture.medium
      })
    })
  }

  createUser(){
    return fetch("https://randomuser.me/api/").then(e => e.json()).then(e => {
      const data = e.results[0]
      return this.usersRef.doc(this.userId).set({
        name: data.name.first,
        avatar: data.picture.medium
      })
    })
  }

  updateUser(data){
    this.usersRef.doc(this.userId).update(data)
  }

  getUser(){
    return this.usersRef.doc(this.userId).get().then(doc => {
      return {...doc.data(), _id: doc.id}
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
      let cursor = querySnapshot.docs[querySnapshot.docs.length-1]
      let messages = []
      querySnapshot.forEach(doc => {
        const data = doc.data()
        const message = {
          ...data,
          _id: doc.id,
          createdAt: data.createdAt,
          sent: true
        }
        messages.push(message)
      })
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
        messages.push(message)
      })
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
          createdAt: timestamp,
          updatedAt: timestamp,
          lastMessage: ""
        })
      }
    })
  }

  updateRoom(roomId, lastMessage){
    this.roomsRef.doc(roomId).update({
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage
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

Firechat.shared = new Firechat()
export default Firechat