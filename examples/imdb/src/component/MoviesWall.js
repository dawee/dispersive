import React from 'react';
import Movie from '../store/Movie';
import actions from '../actions';


class MoviesWall extends React.Component {

  componentDidMount() {
    actions.fetchLastMovies();
  }

  render() {
    return (
      <div className="wall">
      </div>
    );
  }
}

export default MoviesWall;
