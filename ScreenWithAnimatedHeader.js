import React from 'react'
import { View, Animated, Platform } from 'react-native'
import { totalSize } from 'react-native-dimension'
import styles from './styles'

const HEADER_MAX_HEIGHT = totalSize(42)
const HEADER_MIN_HEIGHT = totalSize(18)
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

export default class ScreenWithAnimatedHeader extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollY: new Animated.Value(Platform.OS === 'ios' ? -HEADER_MAX_HEIGHT : 0),
    }
  }

  _renderHeader = () => {
    const scrollY = Animated.add(this.state.scrollY, Platform.OS === 'ios' ? HEADER_MAX_HEIGHT : 0)

    const mainTranslate = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -HEADER_SCROLL_DISTANCE],
      extrapolate: 'clamp',
    })
    const headerTranslate = scrollY.interpolate({
      inputRange: [totalSize(20), HEADER_SCROLL_DISTANCE],
      outputRange: [0, -HEADER_SCROLL_DISTANCE],
      extrapolate: 'clamp',
    })
    const headerOpacity = scrollY.interpolate({
      inputRange: [totalSize(10), totalSize(20)],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })

    return (
      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: mainTranslate }] }]}>
        <Animated.View
          style={[styles.headerBlock, { transform: [{ translateY: headerTranslate }], opacity: headerOpacity }]}
        >
          /* CONTENT */
        </Animated.View>
      </Animated.View>
    )
  }

  render() {
    const { scrollY } = this.state

    return (
      <View style={styles.full}>
        {this._renderHeader()}
        <Animated.ScrollView
          style={styles.scrollView}
          scrollEventThrottle={1}
          onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], { useNativeDriver: true } )}
          contentInset={{top: HEADER_MAX_HEIGHT}}
          contentOffset={{y: -HEADER_MAX_HEIGHT}}
        >
          /* CONTENT */
        </Animated.ScrollView>
      </View>
      )
  }
}
