import React, { Component } from 'react';
import Label from '../components/Label';
import Header from '../components/Header';

export default class UserPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      postal_code: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    fetch(`http://localhost:3000/api/v1/parcels`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        this.setState({ barcode: data.barcode });
      })
      .catch(error => console.error(error));
    event.preventDefault();
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }

  render() {
    return (
      <div style={{ margin: `0 auto`, maxWidth: 650, padding: `1.25rem 1rem` }}>
        <Header page="User View" />
        <p>Please fill out the following form to generate your shipping code</p>

        <form onSubmit={this.handleSubmit}>
          <fieldset>
            <legend>User Information</legend>
            User ID:
            <input
              type="text"
              name="user_id"
              value={this.state.user_id}
              onChange={this.handleChange}
            />
            <br /> File Number:
            <input
              type="text"
              name="file_id"
              value={this.state.file_id}
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
              checked={this.state.shipment_type === 'mail'}
              onChange={this.handleChange}
            />
            Mail
            <input
              type="radio"
              name="shipment_type"
              value="parcel"
              checked={this.state.shipment_type === 'parcel'}
              onChange={this.handleChange}
            />
            Parcel
            <br /> Destination:
            <select
              name="shipment_locale"
              value={this.state.shipment_locale}
              onChange={this.handleChange}
            >
              <option value="local">Within the Lower Mainland</option>
              <option value="national">Within Canada</option>
              <option value="international">International</option>
            </select>
            <br /> Shipping Speed:
            <select
              name="shipment_speed"
              value={this.state.shipment_speed}
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
              value={this.state.attn_name}
              onChange={this.handleChange}
            />
            <br /> Phone Number:
            <input
              type="tel"
              name="attn_phone"
              value={this.state.attn_phone}
              onChange={this.handleChange}
            />
            <br /> Organization:
            <input
              type="text"
              name="attn_organization"
              value={this.state.attn_organization}
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
              value={this.state.street_address}
              onChange={this.handleChange}
            />
            <br /> City:
            <input
              type="text"
              name="city"
              value={this.state.city}
              onChange={this.handleChange}
            />
            <br /> Province/State:
            <input
              type="text"
              name="state_or_province"
              value={this.state.state_or_province}
              onChange={this.handleChange}
            />
            <br /> Country:
            <input
              type="text"
              name="country"
              value={this.state.country}
              onChange={this.handleChange}
            />
            <br /> Postal Code:
            <input
              type="text"
              name="postal_code"
              value={this.state.postal_code}
              onChange={this.handleChange}
            />
          </fieldset>
          <br />
          <input type="submit" value="Submit" />
        </form>
        <Label userID={this.state.user_id} barcode={this.state.barcode} />
      </div>
    );
  }
}
