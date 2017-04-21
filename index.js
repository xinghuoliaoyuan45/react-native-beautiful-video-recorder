import React, { Component, PropTypes } from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  InteractionManager,
} from 'react-native';
import moment from 'moment';
import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RecordingButton from './RecordingButton';
import styles from './style';

export default class VideoRecorder extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
  }

  static defaultProps = {
    isOpen: false,
  }

  constructor(...props) {
    super(...props);
    this.state = {
      isOpen: this.props.isOpen,
      loading: true,
      time: 0,
      recorded: false,
      recordedData: null,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ loading: false });
    });
  }

  onSave = () => {
    if (this.callback) this.callback(this.state.recordedData);
    this.close();
  }

  open = (callback) => {
    this.callback = callback;
    this.setState({
      isOpen: true,
      isRecording: false,
      time: 0,
      recorded: false,
      recordedData: null,
    });
  }

  close = () => {
    this.setState({ isOpen: false });
  }

  startCapture = () => {
    this.startTimer();
    this.setState({
      isRecording: true,
      recorded: false,
      recordedData: null,
      time: 0,
    }, () => {
      this.camera.capture()
      .then((data) => {
        console.log('video capture', data);
        InteractionManager.runAfterInteractions(() => {
          this.setState({
            recorded: true,
            recordedData: data,
          });
        });
      }).catch(err => console.error(err));
    });
  }

  stopCapture = () => {
    this.setState({
      isRecording: false,
    }, () => {
      this.stopTimer();
      this.camera.stopCapture();
    });
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      this.setState({ time: this.state.time + 1 });
    }, 1000);
  }

  stopTimer = () => {
    if (this.timer) clearInterval(this.timer);
  }

  convertTimeString = (time) => {
    return moment().startOf('day').seconds(time).format('mm:ss');
  }

  renderTimer() {
    const { isRecording, time, recorded } = this.state;
    return (
      <View>
        {
          (recorded || isRecording) &&
          <Text style={styles.durationText}>
            <Text style={styles.dotText}>●</Text> {this.convertTimeString(time)}
          </Text>
        }
      </View>
    );
  }

  renderContent() {
    const { loading, isRecording, recorded } = this.state;
    if (loading) return <View />;
    return (
      <Camera
        ref={(cam) => { this.camera = cam; }}
        style={styles.preview}
        captureAudio
        captureMode={Camera.constants.CaptureMode.video}
        captureTarget={Camera.constants.CaptureTarget.temp}
        aspect={Camera.constants.Aspect.fill}>
        {this.renderTimer()}
        <View style={[styles.controls, { backgroundColor: isRecording ? 'transparent' : 'rgba(255,255,255,0.4)' }]}>
          <RecordingButton isRecording={isRecording} onStartPress={this.startCapture}
            onStopPress={this.stopCapture} />
          {
            recorded &&
              <TouchableOpacity onPress={this.onSave} style={styles.btnUse}>
                <View style={styles.btnUseContainer}>
                  <Icon style={styles.btnUseText} name="done" size={24} color="white" />
                </View>
              </TouchableOpacity>
          }
        </View>
      </Camera>
    );
  }

  render() {
    const { isOpen } = this.state;

    return (
      <Modal visible={isOpen} transparent animationType="fade"
        onRequestClose={this.close}>
        <View style={styles.modal}>
          <TouchableWithoutFeedback onPress={this.close}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.container}>
            <View style={styles.content}>
              {this.renderContent()}
            </View>
            <TouchableOpacity onPress={this.close} style={styles.buttonClose}>
              <Icon name="close" size={32} color={'white'} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}
