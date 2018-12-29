import React from "react"
import { ListView } from 'react-native'
import {
  Button,
  Container,
  Content,
  Icon,
  List,
} from "native-base";
import { connect } from 'react-redux'
import MessageItem from './MessageItem'
import Firechat from '../Firechat'

@connect(state => ({rooms: state.rooms}))
export default class extends React.Component {

  constructor(props) {
    super(props)
    this.firechat = new Firechat
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
  }

  deleteRow(data, secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow()
    this.firechat.deleteRoom(data.id)
  }

  componentWillMount(){ 
    this.unsubscribe = this.firechat.getRooms(rooms => {
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
            renderRow={data => <MessageItem componentId={this.props.componentId} room={data} userId={this.firechat.userId} />}
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
