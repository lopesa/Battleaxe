import React from 'react';
import NewsItem from './../NewsItem/NewsItem';
import Promise from 'bluebird';
import classnames from 'classnames';
import styles from './NewsFeed.css';

class NewsFeed extends React.Component {
  constructor(){
    super();
    this.getPosts = this.getPosts.bind(this);
    this.getPostContent = this.getPostContent.bind(this);
    this.callHackerNewsApi = Promise.promisify(this.callHackerNewsApi, {context: this});
    this.updateNew = this.updateNew.bind(this);
    this.updateTop = this.updateTop.bind(this);
    this.updateButtons = this.updateButtons.bind(this);
  }

  getPosts(that, url){
    let feed = url;
    let itemIdArray = [];
    $.ajax({
      url: feed,
      type: 'GET',
      dataType: 'json', // added data type
      success: function(res) {
        that.props.newsfeed.loaded = true;
        that.getPostContent(res);  
      },
      error: function(err) {
        console.log('got an err');
        console.log(err);
      }
    });
  }

  getPostContent(ids) { 
    var postsArray = [];
    for(var i = 0; i < 5; i++) {
      postsArray.push(this.callHackerNewsApi(ids[i]));
    }
    Promise.all(postsArray)
    .then((results) => {
      this.props.getHnPosts(postsArray);
      this.props.newsfeed.loaded = true;
    })
  }

  callHackerNewsApi(id, callback) {
    $.ajax({
      url: 'https://hacker-news.firebaseio.com/v0/item/' + id + '.json?print=pretty',
      type: 'GET',
      dataType: 'json',
      success: function(res) {
        callback(null, res);
      }
    });
  }

  updateNew(e){
    e.preventDefault();
    this.updateButtons(e);
    this.getPosts(this, 'https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty');
    this.props.requestHnPosts();
  }

  updateTop(e){
    e.preventDefault();
    this.updateButtons(e);
    this.getPosts(this,  'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
    this.props.requestHnPosts();
  }

  updateButtons(button) {
    let buttonName = button.target.getAttribute('value');
    if(buttonName === 'Top') {
      this.props.newsfeed.Top = true;
      this.props.newsfeed.New = false;
    } else {
      this.props.newsfeed.Top = false;
      this.props.newsfeed.New = true;
    }
  }

  componentWillMount(){
    this.getPosts(this,  'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
  }

  render() {
    let list = this.props.newsfeed.posts;
    let cssClasses = `${styles.test}`;
    let spinner = `${styles.spinner}`
    let newClasses = classnames('card-footer-item', this.props.newsfeed.New ? cssClasses : '');
    let topClasses = classnames('card-footer-item', this.props.newsfeed.New ? '' : cssClasses);
    let spinnerClasses = classnames('button is-loading', spinner);
    let loaded = this.props.newsfeed.loaded;
    return (
      <div className="column">
        <div className="card">
          <header className="card-header">
            <div className="card-header-title">
              Hacker News
            </div>
            <div className="card-header-icon">
              <span className="icon">
                <i className="fa fa-hacker-news" aria-hidden="true"></i>
              </span>
            </div>
          </header>
          <div className="card-content">
            {loaded ? list ? list.map((item, key) => <NewsItem {...this.props} 
                                          newsItem={item._rejectionHandler0}
                                          key={key}/>) : [] : <a className={spinnerClasses}>Loading</a>}
          </div>
          <footer className="card-footer">
            <a value="New" className={newClasses} onClick={this.updateNew}>New</a>
            <a value="Top" className={topClasses} onClick={this.updateTop}>Top</a>
          </footer>
        </div>
      </div>
    )
  }
};

export default NewsFeed;