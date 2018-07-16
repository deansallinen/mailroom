import React, { Component } from 'react';
import bwipjs from 'bwip-js';

export default class Label extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    bwipjs(
      'target-canvas',
      {
        bcid: 'qrcode',
        text: this.props.barcode
      },
      (err, cvs) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }

  render() {
    return (
      <div>
        <canvas id="target-canvas" />
        <p>User ID: {this.props.userID}</p>
      </div>
    );
  }
}
