import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="App-title">
            <h1>Dispersive</h1>
            <p className="App-subtitle">one state, several models.</p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
