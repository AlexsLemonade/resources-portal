import { Box } from 'grommet'
import * as React from 'react'
import { Component } from 'react'

export default class StoreToken extends Component {
  componentDidMount(token) {
    console.log(token, 'HERE IS THE TOKEN')
    if (token) {
      localStorage.setItem('token', token)
    }
  }

  render() {
    return <Box />
  }
}
