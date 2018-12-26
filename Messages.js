import React from "react"
import { ListView } from 'react-native'
import {
  Button,
  Container,
  Content,
  Icon,
  List,
  View,
  Text,
} from "native-base";
import MessageItem from './MessageItem'
import Firechat from './Firechat'
import { connect } from 'react-redux'

@connect(state => ({rooms: state.rooms}))
export default class extends React.Component {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Messages'
        },
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      rooms: [],
    }
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
  }

  deleteRow(data, secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow()
    Firechat.shared.deleteRoom(data.id)
  }

  componentDidMount(){ 
    this.unsubscribe = Firechat.shared.getRooms(rooms => {
      this.props.dispatch({type: "ADD_ROOMS", rooms})
    })
  }
  
  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return (
      <Container>
        <Content>
          <List
            rightOpenValue={-75}
            dataSource={this.ds.cloneWithRows(this.props.rooms)}
            renderRow={data => <MessageItem componentId={this.props.componentId} room={data} userId={Firechat.shared.userId} />}
            renderRightHiddenRow={(data, secId, rowId, rowMap) =>
              <Button full danger onPress={() => this.deleteRow(data, secId, rowId, rowMap)}>
                <Icon active name="trash" />
              </Button>}
            />
        </Content>
      </Container>
    );
  }
}
