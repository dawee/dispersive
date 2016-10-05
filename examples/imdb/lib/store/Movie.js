import {Model} from 'dispersive';
import actions from '../actions';

const schema = {
  title: null,
  posterUrl: null,
};


class Movie extends Model.use(schema) {

  parse(feed) {
    this.title = feed.title;
    this.posterUrl = `https://image.tmdb.org/t/p/w500${feed.poster_path}`;
  }

  static createAll(feed) {
    for (const movieFeed of feed.results) {
      const movie = new Movie();

      movie.parse(movieFeed);
      movie.save();
    }
  }

}


actions.fetchLastMovies.subscribe(feed => Movie.createAll(feed));

window.Movie = Movie;

export default Movie;