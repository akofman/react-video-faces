import React, { Component } from 'react';
import { toNetInput, loadFaceDetectionModel, locateFaces, drawDetection } from 'face-api.js/dist/face-api';

class VideoFaces extends Component {
  constructor() {
    super();
    this.state = {
      areFaceModelsLoaded: false
    };
  }

  async componentDidMount() {
    if (!this.faceModel) this.faceModel = await loadFaceDetectionModel(this.props.models);

    this.rafInterval = 1000 / this.props.fps;
    this.rafThen = Date.now();

    this.setState({
      areFaceModelsLoaded: true
    });
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
  }

  analyseVideoFrames = () => {
    this.raf = requestAnimationFrame(this.analyseVideoFrames);
    const now = Date.now();
    const delta = now - this.rafThen;
    if (delta > this.rafInterval) {
      this.rafThen = now - (delta % this.rafInterval);
      this.detectFaces();
    }
  }

  detectFaces = async () => {
    if (this.props.drawDetection) this.canvasContext.clearRect(0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight);

    const input = await toNetInput(this.videoElement);
    const result = await locateFaces(input);
    this.onResult(result);
  }

  onResult = (result) => {
    if (this.props.drawDetection) {
      drawDetection(this.canvasElement, result.map(det => det.forSize(this.videoElement.videoWidth, this.videoElement.videoHeight)))
    }
    this.props.onResult && this.props.onResult(result);
  }


  onPlaying = () => {
    if (this.state.areFaceModelsLoaded) {
      this.analyseVideoFrames();
    }
    if (typeof this.props.onPlaying === 'function') this.props.onPlaying();
  }

  onPause = () => {
    this.raf = cancelAnimationFrame(this.raf);
    if (this.canvasContext) this.canvasContext.clearRect(0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight);
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