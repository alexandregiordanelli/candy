import React from 'react'
import {
  View,
  Text,
  FlatList,
  Image
} from 'react-native'
import Firechat from '../Firechat'

export default class extends React.Component {
  static get options() {
    return {
      topBar: {
        title: {
          text: 'Candy'
        },
      }
    };
  }

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
        <FlatList contentContainerStyle={{padding: 5}} data={this.state.data} numColumns={2} keyExtractor={item => item.email} renderItem={({ item }) => (
            <View style={{flex: 1, height: 180, margin: 5, backgroundColor: "#000"}}>
                <Image resizeMode='cover' style={{flex:1}} source={{uri: item.picture.large}}/>
                <Text style={{color: "#fff", lineHeight: 30, textAlign: "center"}}>{item.name.first}</Text>
            </View>
            )} 
        />
    )
  }
}