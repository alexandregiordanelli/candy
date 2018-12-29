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
                    drawBehind: true,
                    background: {
                      translucent: true,
                    },
                    title: {
                      text: 'Candy'
                    },
                  },
                  bottomTab: {
                    icon: await Icon.getImageSource('home', 20, '#000'),
                    text: "Candies",
                    selectedIconColor: '#007aff',
                    selectedTextColor: '#007aff'
                  },
                  bottomTabs: {
                    translucent: true,
                    drawBehind: true,
                    background: {
                      translucent: true,
                    }
                  }
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
                    drawBehind: true,
                    background: {
                      translucent: true,
                    },
                    title: {
                      text: 'Mensagens'
                    },
                  },
                  bottomTab: {
                    icon: await Icon.getImageSource('bubbles', 20, '#000'),
                    text: "Mensagens",
                    selectedIconColor: '#007aff',
                    selectedTextColor: '#007aff'
                  },
                  bottomTabs: {
                    translucent: true,
                    drawBehind: true,
                    background: {
                      translucent: true,
                    }
                  }
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
                  topBar: {
                    drawBehind: true,
                    background: {
                      translucent: true,
                    },
                    title: {
                      text: 'Perfil'
                    },
                  },
                  bottomTab: {
                    icon: await Icon.getImageSource('user', 20, '#000'),
                    text: "Perfil",
                    selectedIconColor: '#007aff',
                    selectedTextColor: '#007aff'
                  },
                  bottomTabs: {
                    translucent: true,
                    drawBehind: true,
                    background: {
                      translucent: true,
                    }
                  }
                }
              },
            }],
          }
        }
      ],
    }
  }
})
