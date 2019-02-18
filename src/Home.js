import React from 'react'
import { Navigation } from "react-native-navigation"
import {
  Text,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native'
import Firechat from './Firechat'
import { InstantSearch, connectInfiniteHits, Configure } from 'react-instantsearch-native'

const Hits = connectInfiniteHits(({ hits, hasMore, refine, componentId }) => {

  const onEndReached = () => {
    if (hasMore)
      refine()
  }

  return (
    <FlatList onEndReached={onEndReached} onEndThreshold={0} contentContainerStyle={{paddingRight: 1}} data={hits} numColumns={2} keyExtractor={item => item.objectID} renderItem={({ item }) => (
      <TouchableOpacity style={{flex: 1, marginLeft: 1, marginBottom: 1}} onPress={()=>{
        Navigation.push(componentId, { 
          component: { 
            name: 'Profile',
            passProps: {
              user: item
            },
            options: {
              customTransition: {
                animations: [
                  { type: 'sharedElement', fromId: item.objectID, toId: 'cover', startDelay: 0, springVelocity: 0.2, duration: 0.2 }
                ],
                duration: 0.2
              },
              bottomTabs: { 
                visible: false,
                drawBehind: true
              },
            }
          }
        })
      }}>
        <Navigation.Element elementId={item.objectID}>
          <Image resizeMode='stretch' style={{flex:1, aspectRatio: 1}} source={{uri: item.avatar}} blurRadius={0}/>
        </Navigation.Element>
        <Text style={{color: "#fff", backgroundColor: 'rgba(0,0,0,0.4)', fontSize: 11, position: 'absolute', right: 0, bottom:0}}>{item._rankingInfo.geoDistance/1000} km</Text>
      </TouchableOpacity>
      )} 
    />
  )
})

export default class extends React.Component {

  state = {
      users: [],
  }

  constructor(props){
    super(props)
    this.firechat = new Firechat
  }

  // componentDidMount() {

  //   Navigation.showModal({
  //     stack: {
  //       children: [{
  //         component: {
  //           name: 'CreditCard',
  //           options: {
  //             topBar: {
  //               title: {
  //                 text: 'Cartão de Crédito'
  //               }
  //             }
  //           }
  //         }
  //       }]
  //     }
  //   })

  // }

  

  render() {
    return ( 
      <InstantSearch
          appId="GVVG7LEMK4"
          apiKey="c769132b1de05084bcf0efef5b7cd92d"
          indexName="customers"
        >
        <Configure aroundLatLngViaIP={true} getRankingInfo={true}/>
        <Hits componentId={this.props.componentId}/>
      </InstantSearch>
    )
  }
}