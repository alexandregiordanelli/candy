import { Navigation } from 'react-native-navigation'
import Icon from "react-native-vector-icons/MaterialIcons"

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

export const goHome = () => {
  Promise.all([
    Icon.getImageSource('menu', 20, '#ffffff'),
    Icon.getImageSource('add', 20, '#ffffff'),
    Icon.getImageSource('add', 20, '#ffffff')
  ]).then(icons => {
    Navigation.setRoot({
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
                      bottomTab: {
                        icon: icons[0]
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
                      bottomTab: {
                        icon: icons[1]
                      }
                    }
                  },
                }]
              }
            },
            {
              component: {
                name: 'Profile',
                options: {
                  bottomTab: {
                    icon: icons[2]
                  }
                }
              },
            },
          ],
        }
      }
    })
  })
}