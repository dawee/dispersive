import {Model} from 'dispersive';
import actions from '../actions';
import moment from 'moment';


const schema = {
  theMovieId: null,
  title: null,
  posterUrl: null,
  releaseDate: null,
};


class NoPosterError {

  constructor(title) {
    this.name = 'NoPosterError';
    this.message = `"${title}" was not shown : no poster found`;
  }
}


class Movie extends Model.use(schema) {

  parse(feed) {
    this.releaseDate = this.releaseDate || feed.release_date;
    this.posterUrl = this.posterUrl || this.getPoster(feed.poster_path);
  }

  getPoster(path) {
    if (!path) return null;

    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  save(...argv) {
    if (!!this.posterUrl) super.save(...argv);
  }

  static createAll(feeds) {
    for (const feed of feeds.results) {
      const theMovieId = feed.id;
      const model = Movie.objects.getOrCreate({theMovieId}, {emitChange: false});

      model.parse(feed);
      model.save();
    }

    this.objects.emitChange();
  }

}


actions.fetchMovies.subscribe(feeds => Movie.createAll(feeds));

export default Movie;