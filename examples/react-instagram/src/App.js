import React, { Component } from 'react';
import { createModel } from 'dispersive/model';
import { withField } from 'dispersive/field';
import { createAction } from 'dispersive/action';
import './App.css';
import Post from './Post';

const PostModel = createModel([
  withField('pseudo'),
  withField('location'),
  withField('avatar'),
  withField('img')
]);

const posts = [
  {
    pseudo: 'mallowlechat',
    location: 'Paris',
    avatar: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s150x150/17125789_243906042735938_7457884880400023552_a.jpg',
    img: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/e35/17076488_1866101496961277_3592160137835446272_n.jpg',
  },
  {
    pseudo: 'madamereadsalot',
    avatar: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s150x150/15876094_194295257710417_6178693794012069888_n.jpg',
    img: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/s750x750/sh0.08/e35/17126393_2266222320322986_4386508798722834432_n.jpg',
  },
  {
    pseudo: 'greemtattoo',
    avatar: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/11326424_1583068125290569_1786294491_a.jpg',
    img: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/s1080x1080/e35/17126072_637863106415204_2090361476316397568_n.jpg',
  },
  {
    pseudo: 'theloonytuney',
    avatar: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s150x150/13355421_884939954974514_1656681233_a.jpg',
    img: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/e35/17077022_180948965739674_323376415657426944_n.jpg',
  },
];

const addFakePosts = createAction(() => {
  posts.forEach(post => PostModel.objects.create(post))
}, [PostModel]);

class App extends Component {
  constructor(props) {
    super(props);
    PostModel.emitter.changed(() => this.forceUpdate());
  }

  render = () => (
    <div className="App">
      {PostModel.objects.map(post => <Post key={post.pk} post={post} />)}
    </div>
  )
}

addFakePosts();

export default App;
