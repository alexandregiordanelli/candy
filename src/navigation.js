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
                    }, 
                  },
                  bottomTab: {
                    icon: await Icon.getImageSource('home', 20),
                    text: "Candies",
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
                    },
                  },
                  bottomTab: {
                    icon: await Icon.getImageSource('bubbles', 20),
                    text: "Mensagens",
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
                    icon: await Icon.getImageSource('user', 20),
                    text: "Perfil",
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