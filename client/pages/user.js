// user.js

import React, { Component } from 'react';
import Label from '../components/Label';
import Header from '../components/Header';
import Submit from '../components/Submit';

export default class UserPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLabel: {
        user_id: '',
        file_id: '',
        shipment_type: '',
        shipment_locale: '',
        shipment_speed: '',
        attn_name: '',
        attn_phone: '',
        attn_organization: '',
        street_address: '',
        city: '',
        state_or_province: '',
        country: '',
        postal_code: '',
      },
      prevLabel: {}
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    fetch(`http://100.115.92.195:3000/api/v1/parcels`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state.currentLabel)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        this.setState({ prevLabel: {...this.state.currentLabel, ...{barcode: data.barcode} }});
        this.setState({currentLabel: {
        user_id: '',
        file_id: '',
        shipment_type: '',
        shipment_locale: '',
        shipment_speed: '',
        attn_name: '',
        attn_phone: '',
        attn_organization: '',
        street_address: '',
        city: '',
        state_or_province: '',
        country: '',
        postal_code: '',
      },});
      })
      .catch(error => console.error(error));
    event.preventDefault();
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    const updated = {...this.state.currentLabel, ...{[name]: value}};
    this.setState({currentLabel: updated});
  }

  render() {
    return (
      <div>
        <Header page="User View" />
        <p>Please fill out the following form to generate your shipping code</p>

        <form onSubmit={this.handleSubmit}>
          <fieldset>
            <legend>User Information</legend>
            User ID:
            <input
              type="text"
              name="user_id"
              value={this.state.currentLabel.user_id}
              onChange={this.handleChange}
            />
            <br /> File Number:
            <input
              type="text"
              name="file_id"
              value={this.state.currentLabel.file_id}
              onChange={this.handleChange}
            />
          </fieldset>
          <br />
          <fieldset>
            <legend>Package Information</legend>
            <input
              type="radio"
              name="shipment_type"
              value="mail"
              checked={this.state.currentLabel.shipment_type === 'mail'}
              onChange={this.handleChange}
            />
            Mail
            <input
              type="radio"
              name="shipment_type"
              value="parcel"
              checked={this.state.currentLabel.shipment_type === 'parcel'}
              onChange={this.handleChange}
            />
            Parcel
            <br /> Destination:
            <select
              name="shipment_locale"
              value={this.state.currentLabel.shipment_locale}
              onChange={this.handleChange}
            >
              <option value="local">Within the Lower Mainland</option>
              <option value="national">Within Canada</option>
              <option value="international">International</option>
            </select>
            <br /> Shipping Speed:
            <select
              name="shipment_speed"
              value={this.state.currentLabel.shipment_speed}
              onChange={this.handleChange}
            >
              <option value="one">One</option>
              <option value="two">Two</option>
              <option value="three">Three</option>
            </select>
          </fieldset>
          <br />
          <fieldset>
            <legend>Recipient Information</legend>
            Recipient Name:
            <input
              type="text"
              name="attn_name"
              value={this.state.currentLabel.attn_name}
              onChange={this.handleChange}
            />
            <br /> Phone Number:
            <input
              type="tel"
              name="attn_phone"
              value={this.state.currentLabel.attn_phone}
              onChange={this.handleChange}
            />
            <br /> Organization:
            <input
              type="text"
              name="attn_organization"
              value={this.state.currentLabel.attn_organization}
              onChange={this.handleChange}
            />
          </fieldset>
          <br />
          <fieldset>
            <legend>Shipping Address</legend>
            Address:
            <input
              type="text"
              name="street_address"
              value={this.state.currentLabel.street_address}
              onChange={this.handleChange}
            />
            <br /> City:
            <input
              type="text"
              name="city"
              value={this.state.currentLabel.city}
              onChange={this.handleChange}
            />
            <br /> Province/State:
            <input
              type="text"
              name="state_or_province"
              value={this.state.currentLabel.state_or_province}
              onChange={this.handleChange}
            />
            <br /> Country:
            <input
              type="text"
              name="country"
              value={this.state.currentLabel.country}
              onChange={this.handleChange}
            />
            <br /> Postal Code:
            <input
              type="text"
              name="postal_code"
              value={this.state.currentLabel.postal_code}
              onChange={this.handleChange}
            />
          </fieldset>
          <br />
          <Submit />
        </form>
        <Label data={this.state.prevLabel} />
      </div>
    );
  }
}