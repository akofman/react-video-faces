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
        this.setState({
            areFaceModelsLoaded: true
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        cancelAnimationFrame(this.raf);
    }

    detectFaces = async () => {
        if (this.canvasContext) this.canvasContext.clearRect(0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight);

        const input = await toNetInput(this.videoElement);
        const result = await locateFaces(input);
        this.onFacesDetection(result);
    }

    onFacesDetection = (result) => {
        if (this.props.drawDetection) {                
            drawDetection(this.canvasElement, result.map(det => det.forSize(this.videoElement.videoWidth, this.videoElement.videoHeight)))
        }
        this.props.onResult && this.props.onResult(result);
    }

    onPlaying = (eventListener) => {
        if (this.state.areFaceModelsLoaded) {
            this.timeout = setTimeout(() => {
                this.raf = requestAnimationFrame(() => this.onPlaying(eventListener));
                this.detectFaces();
            }, 1000 / this.props.fps);
        }
        if (typeof eventListener === 'function') eventListener();
    }

    onPause = (eventListener) => {
        this.timeout = clearTimeout(this.timeout);
        this.raf = cancelAnimationFrame(this.raf);
        if (this.canvasContext) this.canvasContext.clearRect(0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight);
        if (typeof eventListener === 'function') eventListener();
    }

    onLoadedData = (eventListener) => {
        if (this.props.drawDetection) {
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            this.canvasElement.style.left = `${this.videoElement.offsetLeft}px`;
            this.canvasElement.style.top = `${this.videoElement.offsetTop}px`;
            this.canvasElement.style.pointerEvents = 'none';
            this.canvasContext = this.canvasElement.getContext('2d');
        }
        if (typeof eventListener === 'function') eventListener();
    }

    render() {
        const { src, onPause, onPlaying, onLoadedData, onResult, drawDetection, ...options } = this.props;

        return (
            <div style={{ "position": "relative" }}>
                {
                    this.state.areFaceModelsLoaded && <video
                        {...options}
                        onPlaying={() => this.onPlaying(onPlaying)}
                        onPause={() => this.onPause(onPause)}
                        onLoadedData={() => this.onLoadedData(onLoadedData)}
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