import React from 'react';
import MoviesWall from './MoviesWall';
import actions from '../actions';

class App extends React.Component {
  render() {
    return (
      <div>
        <MoviesWall />
      </div>
    );
  }
}

export default App;
