import React from 'react';
import Movie from '../store/Movie';
import actions from '../actions';
import MoviePoster from './MoviePoster';


class MoviesWall extends React.Component {

  constructor(props) {
    super(props);

    Movie.objects.changed(this.updateMovies, this);
    this.state = {movies: Movie.objects.values()};
  }

  updateMovies() {
    this.setState({movies: Movie.objects.values()});
  }

  render() {
    return (
      <div className="wall">
        {this.state.movies.map(movie => <MoviePoster key={movie.id} movieId={movie.id} />)}
      </div>
    );
  }
}

export default MoviesWall;
