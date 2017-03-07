import React, { Component } from 'react';
import { createModel } from 'dispersive/model';
import { withField } from 'dispersive/field';
import { createAction } from 'dispersive/action';
import { Watcher } from 'react-dispersive';

const Post = createModel([
  withField('pseudo'),
  withField('location'),
  withField('avatar'),
  withField('img')
]);

const addFakePosts = createAction(() => [
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
    location: 'Seoul',
    avatar: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/11326424_1583068125290569_1786294491_a.jpg',
    img: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/s1080x1080/e35/17126072_637863106415204_2090361476316397568_n.jpg',
  },
  {
    pseudo: 'theloonytuney',
    avatar: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-19/s150x150/13355421_884939954974514_1656681233_a.jpg',
    img: 'https://scontent-cdg2-1.cdninstagram.com/t51.2885-15/e35/17077022_180948965739674_323376415657426944_n.jpg',
  },
].forEach(post => Post.objects.create(post)), [Post]);


const PostItem = ({post}) => (
  <div className="post">
    <div className="post__info_bar">
      <img className="post__info_bar__avatar" alt={post.pseudo} src={post.avatar} />
      <div className="post__info_bar__text">
        <p className="post__info_bar__text__pseudo">{post.pseudo}</p>
        {post.location ? <p className="post__info_bar__text__location">{post.location}</p> : null}
      </div>
    </div>
    <img className="post__img" alt={post.pseudo} src={post.img} />
  </div>
);

const PostsFeed = ({posts}) => (
  <div className="posts-feed">
    {posts.map(post => <PostItem post={post} key={post.pk} />)}
  </div>
);

const App = () => (
  <div className="app">
    <Watcher sources={[Post]}>
      <PostsFeed posts={Post.objects} />
    </Watcher>
  </div>
);

addFakePosts();

export default App;
