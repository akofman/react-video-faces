import React, { Component } from 'react';
import { render } from 'react-dom';
import VideoFaces from '../../src'


class Demo extends Component {

  onFacesDetection = (result) => {
    console.log(result);
  }

  render() {
    return (
      <div>
        <h1>react-video-faces Demo</h1>
        <VideoFaces
          controls={true}
          crossOrigin="Anonymous"
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4#t=300"
          models="./face-models"
          onResult={this.onFacesDetection}
          drawDetection = { true }
        />
      </div>
    );
  }
}

render(<Demo/>, document.querySelector('#demo'));
