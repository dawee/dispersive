![Dispersive](https://raw.githubusercontent.com/dawee/dispersive-logo/master/dispersive-white-bg.png)

Flux with less code.

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
const addTweets = createAction((name, feed) => {
  const user =  User.objects.getOrCreate({name});

  feed.forEach(({text}) => {
    const tweet = Tweet.objects.create({text});

    user.tweets.add(tweet);
  })
}, [User, Tweet]);

const getLastTweets = async (userName) => {
  const feed = await request.get(`http://twitter...${userName}`);

  return addTweets(userName, feed);
};
```

Then update **render after each change**:

```js
Tweet.emitter.changed(() => {
  const hopefulcyborg = User.objects.get({name: 'hopefulcyborg'});

  console.log('here are hopefulcyborg tweets :');
  console.log(hopefulcyborg.tweets.map(({text}) => text));
})

getLastTweets('hopefulcyborg');
```
