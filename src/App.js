/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native'

import { Card } from 'react-native-elements'
import clamp from 'clamp'
const users = [
  {
    name: 'brynn',
    avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg'
  },
  {
    name: 'brynn',
    avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg'
  }
]
const People = [
  'red',
  'green',
  'blue',
  'purple',
  'orange',
]
var {height, width} = Dimensions.get('window')
const SWIPE_THRESHOLD = width * 0.3
export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pan: new Animated.ValueXY(),
      enter: new Animated.Value(0.5),
      person: People[0]
    }
  }
  _goToNextPerson() {
    const currentPersonIdx = People.indexOf(this.state.person)
    const newIdx = currentPersonIdx + 1

    this.setState({
      person: People[newIdx > People.length - 1 ? 0 : newIdx]
    })
  }
  _resetState = () => {
    this.state.pan.setValue({x: 0, y: 0})
    this.state.enter.setValue(0)
    this._goToNextPerson()
    this._onAnimatedEntrance()
  } 
  componentWillMount = () => {
    this._panReposnder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      // to Capture the movement
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value})
        this.state.pan.setValue({x: 0, y: 0})
      },
      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y}
      ]),
      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset()
        let velocity
        if (vx >= 0) {
          velocity = clamp(vx, 3, 6)
        } else if(vx < 0) {
          velocity = clamp(vx * -1, 3, 6) * -1
        }
        if (Math.abs(this.state.pan.x._value) >= SWIPE_THRESHOLD) {
          Animated.decay(
            this.state.pan,
            {
              velocity: {x: velocity, y: vy},
              deceleration: 0.98
            }
          ).start(this._resetState)
        } else {
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }
    })
  }
  
  componentDidMount = () => {
    this._onAnimatedEntrance()
  }
  _onAnimatedEntrance = () => {
    Animated.spring(
      this.state.enter,
      {
        toValue: 1,
        friction: 7,
      }
    ).start()
  }
  render() {
    const { pan, enter } = this.state
    const [translateX, translateY] = [pan.x, pan.y]
    const scale = enter
    const rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ['-30deg', '0deg', '30deg']})
    const opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]})
    const animatedStyle = {borderColor: this.state.person, transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity, height: 200, width: 200}
    // When yes
    const yumOpacity = pan.x.interpolate({inputRange: [0, 150], outputRange: [0, 1]})
    const yupScale = pan.x.interpolate({inputRange: [0, 150], outputRange: [0.5, 1], extrapolate: 'clamp'})
    const animatedYupStyles = {transform: [{scale: yupScale}], opacity: yumOpacity}
    // When no
    const nopeOpacity = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0]})
    const nopeScale = pan.x.interpolate({inputRange: [-150, 0], outputRange: [1, 0.5], extrapolate: 'clamp'})
    const animatedNopeStyles = {transform: [{scale: nopeScale}], opacity: nopeOpacity}
    
    return (
      <View style={styles.container}>
        <Animated.View style={animatedStyle} {...this._panReposnder.panHandlers}>
          <Card title="CARD WITH DIVIDER">
            {
              users.map((u, i) => {
                return (
                  <View key={i} style={styles.user}>
                    <Image
                      style={styles.image}
                      resizeMode="cover"
                      source={{ uri: u.avatar }}
                    />
                    <Text style={styles.name}>{u.name}</Text>
                  </View>
                )
              })
            }
          </Card>
        </Animated.View>
        <Animated.View style={[styles.nope, animatedNopeStyles]}>
          <Text style={styles.nopeText}>Nope!{People.indexOf(this.state.person)}</Text>
        </Animated.View>

        <Animated.View style={[styles.yup, animatedYupStyles]}>
          <Text style={styles.yupText}>Yup!{People.indexOf(this.state.person)}</Text>
        </Animated.View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  user: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderColor: '#e1e8ee',
    padding: 5,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 25,
    padding: 10
  },
  name: {
    fontSize: 15,
    padding: 10
  },
  yup: {
    borderColor: 'green',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    bottom: 20,
    borderRadius: 5,
    right: 20,
  },
  yupText: {
    fontSize: 16,
    color: 'green',
  },
  nope: {
    borderColor: 'red',
    borderWidth: 2,
    position: 'absolute',
    bottom: 20,
    padding: 20,
    borderRadius: 5,
    left: 20,
  },
  nopeText: {
    fontSize: 16,
    color: 'red',
  }
})
