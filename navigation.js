import { Navigation } from 'react-native-navigation'

export const goLogin = () => Navigation.setRoot({
  root: {
    stack: {
        children: [{
          component: {
            name: 'Login',
          },
        }]
      }
  }
});

export const goHome = () => Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'BottomTabsId',
        children: [
          {
            stack: {
              children: [{
                component: {
                  name: 'Messages',
                  options: {
                    bottomTab: {
                      icon: require('./signin.png')
                    }
                  }
                },
              }]
            }
          },
          {
            component: {
              name: 'Screen',
              options: {
                bottomTab: {
                  icon: require('./signup.png')
                }
              }
            },
          },
        ],
      }
    }
  })