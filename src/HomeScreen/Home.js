import React from 'react'
import { Navigation } from "react-native-navigation"
import {
  Text,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native'
import Firechat from '../Firechat'

export default class extends React.Component {
  state = {
      data: []
  }

  componentDidMount() {
    this.makeRemoteRequest();
  }

  makeRemoteRequest = () => {
    const { page, seed } = this.state;
    const url = `https://randomuser.me/api/?seed=${seed}&page=${page}&results=20`;
    this.setState({ loading: true });
    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.setState({
          data: page === 1 ? res.results : [...this.state.data, ...res.results],
          error: res.error || null,
          loading: false,
          refreshing: false
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  render() {
    return (
      <FlatList contentContainerStyle={{paddingRight: 1}} data={this.state.data} numColumns={4} keyExtractor={item => item.email} renderItem={({ item }) => (
          <TouchableOpacity style={{flex: 1, paddingLeft: 1, paddingBottom: 1}} onPress={()=>{
            Navigation.push(this.props.componentId, { 
              component: { 
                name: 'Profile',
                options: {
                  bottomTabs: { 
                    visible: false, 
                    drawBehind: true, 
                    animate: true 
                  },
                }
              }
            })
          }}>
                <Image resizeMode='cover' style={{flex:1,aspectRatio: 1}} source={{uri: item.picture.large}}/>
                {/* <Text style={{color: "#fff", lineHeight: 30, textAlign: "center"}}>{item.name.first}</Text> */}
          </TouchableOpacity>
          )} 
      />
    )
  }
}