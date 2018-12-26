import { Navigation } from "react-native-navigation";
import Messages from "./Messages";
import Chat from "./Chat";
import Screen from "./Screen";
import Home from "./Home";

Navigation.registerComponent(`Home`, () => Home);
Navigation.registerComponent(`Screen`, () => Screen);
Navigation.registerComponent(`Messages`, () => Messages);
Navigation.registerComponent(`Chat`, () => Chat);

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
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
})