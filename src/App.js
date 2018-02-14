import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import YouTube from 'react-youtube';

import axios from 'axios';

class App extends Component {
  state = {
    videos: [],
    activeIndex: 0,
    requestCount: 0
  };

  componentDidMount() {
    this.loadVideos();
  }

 loadVideos = refresh => {
   const { requestCount, videos } = this.state;
   let params = '';
    if(requestCount > 0 || refresh) {
      params = `?count=25&after=${videos[videos.length-1].data.name}`;
    }
    const url =`https://www.reddit.com/r/videos.json${params}`;
    axios.get(url)
    .then( (response) => {
      this.setState({
        videos: this.state.videos.concat(response.data.data.children),
        requestCount: this.state.requestCount + 1
      }, () => {
        if(this.state.requestCount < 4) {
          this.loadVideos();
        }
      });
    });
  }

  goTo = index => {
    this.setState({
      activeIndex: index
    });
  }

  loadMore = () => {
    this.setState({
      requestCount: 0
    }, () => this.loadVideos(true));
  }

  getYoutubeId = activeVideo => {
    if(activeVideo) {
      try{
        const src = activeVideo.data.secure_media_embed.content;
        const matches = src.match(/src=\"([^"]*)\"/)
        const url = matches[1];
        return url.substring(url.indexOf('/embed/')+7, url.indexOf('?feature'));
      }catch(e){
        this.setState({
          activeIndex: this.state.activeIndex+1
        });
      }
    }
    return '';
  };

  renderThumbnails = () => {
    return this.state.videos.map( (video, i) =>  (
      <li key={i} onClick={this.goTo.bind(this, i)} className={this.state.activeIndex === i ? 'active' : ''}>
        <img src={video.data.thumbnail} />
        <p>{`${video.data.title.substring(0, 90)}${video.data.title.length > 90 ? '...' : '' }`}</p>
      </li>
    ));
  };

  componentDidUpdate(prevProps, prevState) {
    if(prevState.activeIndex !== this.state.activeIndex) {
      this.list.children[this.state.activeIndex].scrollIntoView();
    }
  }

  render() {
    const thumbnails = this.renderThumbnails();
    const activeVideo = this.state.videos[this.state.activeIndex];
    const title = activeVideo ? activeVideo.data.title : 'Weddit';
    const youtubeID = this.getYoutubeId(activeVideo);
    const playerOptions = {
      playerVars: {
        autoplay: 1
      }
    };
    return (
      <div className="App">
        <header className="App-header">
          <p className="App-title">{`${title.substring(0, 125)}${title.length > 125 ? '...' : '' }`}</p>
        </header>
        <div className="wrapper">
          <div className="left">
            <div className="video-wrapper">

              <YouTube
                videoId={youtubeID}
                className="video"
                opts={playerOptions}
                onEnd={() => this.setState({ activeIndex: this.state.activeIndex + 1 })}
                onError={() => this.setState({ activeIndex: this.state.activeIndex + 1 })}
              />

            </div>
            <span className="signature">Made with ❤ for Bethany</span><br/>
            <span className="signature">{`${this.state.activeIndex+1} out of ${this.state.videos.length} videos`}</span>
          </div>
          <div className="right">
            <ul ref={ ref => this.list = ref }>
              {thumbnails}
              <li onClick={this.loadMore}>
                <p>Y'all got any more of them videos?</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
