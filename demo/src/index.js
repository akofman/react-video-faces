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
          crossOrigin="anonymous"
          src="https://github.com/justadudewhohacks/face-api.js/blob/master/examples/public/media/bbt.mp4?raw=true"
          models="./mtcnn/"
          onResult={this.onFacesDetection}
          drawDetection = { true }
        />
      </div>
    );
  }
}

render(<Demo/>, document.querySelector('#demo'));
