import { Navigation } from 'react-native-navigation'
import Icon from "react-native-vector-icons/SimpleLineIcons"

export const goLogin = () => Navigation.setRoot({
  root: {
    stack: {
        id: 'LoginRoot',
        children: [{
          component: {
            name: 'Login',
          },
        }]
      }
  }
})

export const goHome = async () => Navigation.setRoot({
  root: {
    bottomTabs: {
      id: 'HomeRoot',
      options: {
        layout: {
          backgroundColor: '#333'
        },
        // bottomTabs: {
        //   backgroundColor: '#333',
        //   drawBehind: true,
        //   // hideShadow: true,
        //   // elevation: 0
        // },
      },
      children: [
        {
          stack: {
            children: [{
              component: {
                name: 'Home',
                options: {
                  topBar: {
                    title: {
                      text: 'Candy',
                      color: 'white'
                    },   
                  },
                  bottomTab: {
                    icon: await Icon.getImageSource('home', 20, '#666'),
                    text: "Candies",
                    textColor: '#666',
                    selectedIconColor: '#fff',
                    selectedTextColor: '#fff'
                  },
                }
              },
            }]
          }
        },
        {
          stack: {
            children: [{
              component: {
                name: 'Messages',
                options: {
                  topBar: {
                    title: {
                      text: 'Mensagens',
                      color: 'white'
                    },
                  },
                  bottomTab: {
                    icon: await Icon.getImageSource('bubbles', 20, '#666'),
                    text: "Mensagens",
                    textColor: '#666',
                    selectedIconColor: '#fff',
                    selectedTextColor: '#fff'
                  },
                }
              },
            }]
          }
        },
        {
          stack: {
            children: [{
              component: {
                name: 'Profile',
                options: {
                  bottomTab: {
                    icon: await Icon.getImageSource('user', 20, '#666'),
                    text: "Perfil",
                    textColor: '#666',
                    selectedIconColor: '#fff',
                    selectedTextColor: '#fff'
                  },
                }
              },
            }],
          }
        }
      ],
    }
  }
})