import React from "react";
import { ListView } from 'react-native'
import {
  Button,
  Text,
  Container,
  Body,
  Content,
  Header,
  Left,
  Right,
  Icon,
  List,
  ListItem,
  Title,
  Input,
  Item,
  Label,
  Thumbnail,
  Badge
} from "native-base";
import MessageItem from './MessageItem'
import Firechat from './Firechat'

export default class extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isReady: false,
      rooms: []
    }
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
  }

  deleteRow(data, secId, rowId, rowMap) {
    rowMap[`${secId}${rowId}`].props.closeRow()
    Firechat.shared.deleteRoom(data.id)
  }

  componentWillMount(){
    this.unsubscribe = Firechat.shared.getOnAuth(rooms => {
      this.setState({isReady: true, rooms, user: { _id: Firechat.shared.userId}})
    }) 
  }

  componentWillUnmount(){
    if(this.unsubscribe)
      this.unsubscribe()
  }

  render() {
    if (!this.state.isReady)
      null
    return (
      <Container>
        <Content>
          <List
            rightOpenValue={-75}
            dataSource={this.ds.cloneWithRows(this.state.rooms)}
            renderRow={data => <MessageItem componentId={this.props.componentId} user={this.state.user} room={data} />}
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
