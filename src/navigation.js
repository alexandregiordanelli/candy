import { Navigation } from 'react-native-navigation'

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
});

export const goHome = () => Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'HomeRoot',
        children: [
          {
            stack: {
              children: [{
                component: {
                  name: 'Messages',
                  options: {
                    bottomTab: {
                      icon: require('../assets/signin.png')
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
                  icon: require('../assets/signup.png')
                }
              }
            },
          },
        ],
      }
    }
  })