import React from 'react';
import Movie from '../store/Movie';

class MoviePoster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {movie: Movie.objects.get({id: props.movieId}).values()}
  }

  render() {
    const movie = this.state.movie;

    return (
      <div className="poster" style={{backgroundImage: `url(${movie.posterUrl})`}}>
        <div className="overlay"></div>
      </div>
    );
  }
}

export default MoviePoster;
