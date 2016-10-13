import React from 'react';
import MoviesWall from './MoviesWall';
import Header from './header';
import actions from '../actions';

class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <MoviesWall />
      </div>
    );
  }
}

export default App;
