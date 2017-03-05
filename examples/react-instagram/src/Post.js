import React from 'react';

const Post = props => (
  <div className="post">
    <div className="post__info_bar">
      <img className="post__info_bar__avatar" alt={props.post.pseudo} src={props.post.avatar} />
      <div className="post__info_bar__text">
        <p className="post__info_bar__text__pseudo">{props.post.pseudo}</p>
        {props.post.location ? <p className="post__info_bar__text__location">{props.post.location}</p> : null}
      </div>
    </div>
    <img className="post__img" alt={props.post.pseudo} src={props.post.img} />
  </div>
)

export default Post;
