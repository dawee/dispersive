import request from 'superagent';
import moment from 'moment';
import qs from 'qs';


class Resource {

  static createRequest(url, query) {
    const queryString = qs.stringify(query);

    return new Promise((resolve, reject) => request.get(`${url}?${queryString}`, (err, res) => {
      if (!!err) return reject(err);

      resolve(res.body);
    }));
  }

}


class TheMovieDB extends Resource {

  constructor() {
    super();

    const startDate = moment().add(1, 'month').startOf('year').format('YYYY-MM-DD');
    const endDate = moment().add(1, 'month').endOf('year').format('YYYY-MM-DD');

    this.query = {
      page: 0,
      api_key: 'b54fdd936c40e2df62dbfab8efa08c6b',
      'primary_release_date.gte': startDate,
      'primary_release_date.lte': endDate,
    };
  }

  fetchNext() {
    this.query.page++;

    return TheMovieDB.createRequest('https://api.themoviedb.org/3/discover/movie', this.query);
  }

}

export default TheMovieDB;