import request from 'superagent';
import moment from 'moment';
import qs from 'qs';


class TheMovieDB {

  constructor() {
    const startDate = moment().add(1, 'month').startOf('month').format('YYYY-MM-DD');
    const endDate = moment().add(1, 'month').endOf('month').format('YYYY-MM-DD');

    this.baseQuery = {
      'primary_release_date.gte': startDate,
      'primary_release_date.lte': endDate,
      'api_key': 'b54fdd936c40e2df62dbfab8efa08c6b',
    }
  }

  fetchNext() {
    return TheMovieDB.createRequest('https://api.themoviedb.org/3/discover/movie', this.baseQuery);
  }

  static createRequest(url, query) {
    const queryString = qs.stringify(query);

    return new Promise((resolve, reject) => request.get(`${url}?${queryString}`, (err, res) => {
      if (!!err) return reject(err);

      resolve(res.body);
    }));
  }

}

export default TheMovieDB;