// Record.js
import React, { Component } from 'react';

export default class Record extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    if (!this.props.data.id) {
      return <div />;
    }
    return (
      <div>
        <div>Recipient Name: {this.props.data.attn_name}</div>
        <div>
          Recipient Address: {this.props.data.street_address} <br />
          {this.props.data.city}, {this.props.data.state_or_province} <br />
          {this.props.data.country}
          <br />
          {this.props.data.postal_code}
        </div>
        <div>Shipment Type: {this.props.data.shipment_type}</div>
        <div>Shipment Locale: {this.props.data.shipment_locale}</div>
        <div>Shipment Speed: {this.props.data.shipment_speed}</div>
        <div>Sender ID: {this.props.data.user_id}</div>
        <div>File ID: {this.props.data.file_id}</div>
      </div>
    );
  }
}
