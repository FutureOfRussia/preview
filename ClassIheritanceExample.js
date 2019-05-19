/* eslint-disable react/no-unused-state */
import { Component } from 'react'
import { AppState } from 'react-native'
import Orientation from 'react-native-orientation'

export default class Screen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      orientation: 'PORTRAIT',
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)
    Orientation.addOrientationListener(this._changeOrientation)
    this._getOrientation()
  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this._changeOrientation)
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _changeOrientation = orientation => this.setState({ orientation })

  _handleAppStateChange = state => state === 'active' && this._getOrientation()

  _getOrientation = () => Orientation.getOrientation((err, orientation) => this._changeOrientation(orientation))

  _isPortrait = () => this.state.orientation === 'PORTRAIT'

  _navigate = (path, params = null) => {
    this.props.navigation.navigate(path[0].toUpperCase() + path.slice(1), params)
  }

  _navigateBack = () => this.props.navigation.goBack(null)
}
