// @flow
import React, { Component } from 'react'
import {
  View, TouchableWithoutFeedback, Animated, StyleSheet,
} from 'react-native'
import { Colors, pxToTotalSize } from '../constants'

const styles = StyleSheet.create({
  container: {
    width: pxToTotalSize(100),
    height: pxToTotalSize(62),
    borderRadius: pxToTotalSize(31),
    justifyContent: 'center',
    paddingHorizontal: pxToTotalSize(2),
  },
  button: {
    width: pxToTotalSize(56),
    height: pxToTotalSize(56),
    backgroundColor: Colors.white,
    borderRadius: pxToTotalSize(28),
  },
})

type SwitchButtonProps = {
  value?: boolean,
  onChange?: Function,
}

export default class SwitchButton extends Component<SwitchButtonProps> {
  static defaultProps = {
    value: false,
    onChange: () => {},
  }

  state = {
    transformPosition: new Animated.Value(0),
    value: this.props.value,
  }

  _toggle = () => {
    if (this.state.value) {
      Animated.timing(this.state.transformPosition, {
        toValue: 0,
        duration: 250,
      }).start()
      this.setState(
        { value: false },
        () => this.props.onChange(false),
      )
    } else {
      Animated.timing(this.state.transformPosition, {
        toValue: pxToTotalSize(44),
        duration: 250,
      }).start()
      this.setState(
        { value: true },
        () => this.props.onChange(true),
      )
    }
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={this._toggle}>
        <View
          style={[
            styles.container, { backgroundColor: this.state.value ? Colors.purple : Colors.gray },
          ]}
        >
          <Animated.View style={[styles.button, { left: this.state.transformPosition }]} />
        </View>
      </TouchableWithoutFeedback>
    )
  }
}
