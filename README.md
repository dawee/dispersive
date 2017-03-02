# dispersive

_ flux
_ less code
_ period.

## Usage

Create **models**:

```js
const Tweet = createModel([
  withField('text'),
]);

const User = createModel([
  withField('name'),
  withMany('tweets', {model: Tweet, relatedName: 'user'}),
]);
```

Create **actions**:

```js
const fetchTweets = createAction(async name => {
  const res = await request.get(`http://twitter/api/user/${userName}/tweets`);

  res.body.forEach(tweet => User.objects.getOrCreate({name}).tweets.add(tweet));
}, [User, Tweet]);
```

Then update **render after each change**:

```js
Tweet.emitter.changed(() => {
  const hopefulcyborg = User.objects.get({name: 'hopefulcyborg'});

  console.log('here are hopefulcyborg tweets : ', hopefulcyborg.tweets.map(({text}) => text));
})

fetchTweets('hopefulcyborg');
```
