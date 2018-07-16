import React, { Component } from 'react';

export default class LabelList extends Component {
  constructor(props) {
    super(props);

    this.state = { data: [] };
  }

  componentDidMount = () => {
    fetch(`http://localhost:3000/api/v1/parcels`)
      .then(response => response.json())
      .then(data => this.setState({ data: data }))
      .catch(err => console.error(err));
  };

  render() {
    return (
      <div>
        <h3>All Records</h3>
        {this.state.data.map(label => {
          return <div key={label.id}>{label.barcode}</div>;
        })}
      </div>
    );
  }
}
