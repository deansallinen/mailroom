//Label.js
import React, { Component } from 'react';
import bwipjs from 'bwip-js';

export default class Label extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.data.barcode !== prevProps.barcode) {
      bwipjs(
      'target-canvas',
      {
        bcid: 'qrcode',
        text: this.props.data.barcode
      },
      (err, cvs) => {
        if (err) {
          console.error(err);
        }
      }
    );
    if (!this.state.display) {
      this.setState({display: true});
    }
    }
  }

  render() {
    if (this.state.display) { return (
      <div style={containerStyles}>
        <canvas id="target-canvas" />
        <div>
          <p style={textStyles}>User ID: {this.props.data.user_id}</p>
          <p style={textStyles}>File No: {this.props.data.file_id}</p>
        </div>
      </div>
    );
    }
    return <div />
  }
}

const containerStyles = {
  border: '1px solid black',
  padding: '1rem',
  display: 'flex',
  alignItems: 'top',
  justifyContent: 'space-around'
  
}

const textStyles = {
  margin: '0'
}