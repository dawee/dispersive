import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import Movie from '../store/Movie';
import actions from '../actions';
import MoviePoster from './MoviePoster';



class MoviesWall extends React.Component {

  constructor(props) {
    super(props);

    Movie.objects.changed(this.updateMovies, this);
    this.state = {movies: Movie.objects.values(), loadCount: 0};
  }

  updateMovies() {
    this.setState({movies: Movie.objects.values(), loadCount: this.state.loadCount + 1});
  }

  onSensorVisibilityChange(isVisible) {
    if (isVisible) actions.fetchMovies();
  }

  render() {
    return (
      <div className="wall">
        {this.state.movies.map(movie => <MoviePoster key={movie.id} movieId={movie.id} />)}
        <VisibilitySensor
          partialVisibility={true}
          onChange={this.onSensorVisibilityChange}>
          <div className='sensor' />
        </VisibilitySensor>
      </div>
    );
  }
}

export default MoviesWall;
