import React, { Component } from 'react';
import { loadMtcnnModel, mtcnn, drawDetection } from 'face-api.js/dist/face-api';

class VideoFaces extends Component {
  constructor() {
    super();
    this.state = {
      areFaceModelsLoaded: false
    };

    this.forwardParams = {
      // number of scaled versions of the input image passed through the CNN
      // of the first stage, lower numbers will result in lower inference time,
      // but will also be less accurate
      maxNumScales: 10,
      // scale factor used to calculate the scale steps of the image
      // pyramid used in stage 1
      scaleFactor: 0.709,
      // the score threshold values used to filter the bounding
      // boxes of stage 1, 2 and 3
      scoreThresholds: [0.6, 0.7, 0.7],
      // mininum face size to expect, the higher the faster processing will be,
      // but smaller faces won't be detected
      minFaceSize: 60
    };
  }

  async componentDidMount() {
    if (!this.faceModel) this.faceModel = await loadMtcnnModel(this.props.models);

    this.setState({
      areFaceModelsLoaded: true
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  detectFaces = () => {
    this.timeout = setTimeout(async () => {
      if (this.props.drawDetection) this.canvasContext.clearRect(0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight);

      const result = await mtcnn(this.videoElement, this.forwardParams);
      this.onResult(result);
      this.detectFaces();
    }, 1000 / this.props.fps)
  }

  onResult = (result) => {
    if (result) {
      result.forEach(({ faceDetection }) => {

        // ignore results with low confidence score
        if (faceDetection.score < 0.9) {
          return;
        }

        drawDetection(this.canvasElement, faceDetection);
      })
    }

    this.props.onResult && this.props.onResult(result);
  }

  onPlaying = () => {
    if (this.state.areFaceModelsLoaded) {
      this.detectFaces();
    }
    if (typeof this.props.onPlaying === 'function') this.props.onPlaying();
  }

  onPause = () => {
    clearTimeout(this.timeout);
    if (this.props.drawDetection) this.canvasContext.clearRect(0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight);
    if (typeof this.props.onPause === 'function') this.props.onPause();
  }

  onLoadedData = () => {
    if (this.props.drawDetection) {
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.style.left = `${this.videoElement.offsetLeft}px`;
      this.canvasElement.style.top = `${this.videoElement.offsetTop}px`;
      this.canvasElement.style.pointerEvents = 'none';
      this.canvasContext = this.canvasElement.getContext('2d');
    }
    if (typeof this.props.onLoadedData === 'function') this.props.onLoadedData();
  }

  render() {
    const { src, onPause, onPlaying, onLoadedData, onResult, drawDetection, ...options } = this.props;

    return (
      <div style={{ "position": "relative" }}>
        {
          this.state.areFaceModelsLoaded && <video
            {...options}
            onPlaying={this.onPlaying}
            onPause={this.onPause}
            onLoadedData={this.onLoadedData}
            ref={refs => {
              this.videoElement = refs;
            }}
          >
            <source src={src} type="video/mp4" />

          </video>
        }
        {
          drawDetection && <canvas
            crossOrigin="anonymous"
            style={{ "position": "absolute" }}
            hidden={false}
            ref={refs => {
              this.canvasElement = refs;
            }}
          />
        }
      </div>
    );
  }
}

VideoFaces.defaultProps = {
  fps: 25
};

export default VideoFaces;