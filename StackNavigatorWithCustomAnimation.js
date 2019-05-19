/*
  Пример стэка навигатора с измененной анимацией переходов между экранами.
*/
import { Easing, Animated } from 'react-native'
import { createStackNavigator } from 'react-navigation'
import {
  PlayScreen, SportScreen, StrategyScreen,
} from '../screens'

const transitionConfig = () => ({
  transitionSpec: {
    duration: 500,
    easing: Easing.out(Easing.poly(5)),
    timing: Animated.timing,
    useNativeDriver: true,
  },
  screenInterpolator: (sceneProps) => {
    const { layout, position, scene } = sceneProps

    const thisSceneIndex = scene.index
    const width = layout.initWidth

    const translateX = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex],
      outputRange: [width, 0],
    })

    return { transform: [{ translateX }] }
  },
})

export default createStackNavigator({
  Play: {
    screen: PlayScreen,
    navigationOptions: {
      header: null,
    },
  },
  Sport: {
    screen: SportScreen,
    navigationOptions: {
      header: null,
    },
  },
  Strategy: {
    screen: StrategyScreen,
    navigationOptions: {
      header: null,
    },
  },
}, {
  initialRouteName: 'Play',
  cardStyle: { backgroundColor: 'black' },
  transitionConfig: () => transitionConfig(),
})
