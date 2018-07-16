// mailroom.js
import React, { Component } from 'react';
import LabelList from '../components/labelList';
import Record from '../components/Record';
import Header from '../components/Header';

export class MailroomPage extends Component {
  constructor(props) {
    super(props);
    this.state = { barcode: '', data: {} };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    fetch(`http://localhost:3000/api/v1/parcels?barcode=${this.state.barcode}`)
      .then(response => response.json())
      .then(data => {
        this.setState({ data: data[0] });
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
        <Header page="Mailroom" />
        <p>Please enter a barcode to retrieve a record</p>
        <form onSubmit={this.handleSubmit}>
          Barcode:
          <input
            type="text"
            name="barcode"
            value={this.state.barcode}
            onChange={this.handleChange}
          />
          <input type="submit" value="Submit" />
        </form>
        <Record data={this.state.data} />
        <LabelList />
      </div>
    );
  }
}

export default MailroomPage;
