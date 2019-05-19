/*
  Плиточная галерея с возможностью просмотра, добавления, редактирования и удаления изображений.
*/

/* eslint-disable no-plusplus,camelcase,no-nested-ternary */
import React from 'react'
import PropTypes from 'prop-types'
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Easing, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { ImagePicker, Permissions } from 'expo'
import { Image } from 'react-native-elements'
import DatePicker from 'react-native-datepicker'
import Modal from 'react-native-modalbox'
import moment from 'moment'
import { Ionicons } from '@expo/vector-icons'
import {
  Row, Column as Col, ScreenInfo, Grid, setBreakPoints,
} from 'react-native-responsive-grid'
import { width, totalSize } from 'react-native-dimension'

/* SET DEVICE BREAK POINTS */
setBreakPoints({
  SMALL_Width: 320,
  MEDIUM_Width: 375,
  LARGE_Width: 767,
  SMALL_Height: 480,
  MEDIUM_Height: 667,
  LARGE_Height: 1023,
});

const sizes = {
  sm: 100,
  md: 50,
  lg: 33,
  xl: 25,
};

export default class Gallery extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    myProfile: PropTypes.bool,
    delImage: PropTypes.func,
    addImage: PropTypes.func,
    editImage: PropTypes.func,
    style: PropTypes.object,
    maxImages: PropTypes.number,
  };

  static defaultProps = {
    myProfile: false,
    delImage: () => {},
    addImage: () => {},
    editImage: () => {},
    style: {},
    maxImages: 1000,
  };

  state = {
    isOpenModal: false,
    load: false,
  };

  _renderItem = (url, thumb_url, h, w, colWidth, id, date, label) => (
    <Row style={styles.itemBlock} key={id.toString()} noWrap>
      <Col fullWidth>
        <TouchableOpacity
          onLongPress={() => {
            if (this.props.myProfile) this._editImage(id, url, date, label)
          }}
          onPress={() => this._openImage(url, date, label, h)}
          style={{ maxHeight: totalSize(30) }}
        >
          <Image
            source={{ uri: thumb_url || url }}
            style={{
              width: colWidth,
              height: h + ((colWidth - w) * h / w),
            }}
            resizeMode="cover"
            placeholderStyle={styles.bodyBgImagePlaceholder}
            PlaceholderContent={<ActivityIndicator />}
          />
          <View style={styles.imageLabelBlock}>
            <Text style={styles.imageLabelDate}>
              {moment(date).format('Do MMM, YY')}
            </Text>
            <Text style={styles.imageLabelText} numberOfLines={1} ellipsizeMode="tail">
              {label || ''}
            </Text>
          </View>
          {this.props.myProfile ? (
            <TouchableOpacity style={styles.trash} onPress={() => this._delImage(id)}>
              <Ionicons name="ios-trash" style={styles.trashIcon} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Col>
    </Row>
  );

  _renderLayout = (state, data) => {
    const numCols = Math.floor(100 / sizes[ScreenInfo().mediaSize]);
    const numRows = Math.ceil(data.length / numCols);
    const colWidth = state.layout.grid ? state.layout.grid.width / numCols : 0;

    const layoutMatrix = [];
    const layoutCols = [];

    for (let col = 0; col < numCols; col++) {
      layoutMatrix.push([]);
      for (let row = 0, i = col; row < numRows; row++, i += numCols) {
        if (data[i]) {
          layoutMatrix[col].push(
            this._renderItem(
              data[i].url,
              data[i].thumb_url,
              data[i].height,
              data[i].width,
              colWidth,
              data[i].id,
              data[i].creation_date,
              data[i].description,
            ),
          )
        }
      }
      layoutCols.push(
        <Col
          key={col.toString()}
          smSize={state.layout.grid ? sizes.sm : 0}
          mdSize={state.layout.grid ? sizes.md : 0}
          lgSize={state.layout.grid ? sizes.lg : 0}
          xlSize={state.layout.grid ? sizes.xl : 0}
        >
          {layoutMatrix[col]}
        </Col>,
      )
    }

    return layoutCols
  };

  _renderAddButton = () => (
    <View style={styles.addBtnBlock}>
      <TouchableOpacity style={styles.addBtn} onPress={this._addImage} disabled={this.state.load}>
        <Ionicons name="md-add-circle" style={styles.addBtnIcon} />
      </TouchableOpacity>
    </View>
  );

  _renderModal = () => (
    <Modal
      coverScreen
      backdropOpacity={this.state.modalType === 'show' ? 0.9 : 0.5}
      useNativeDriver={Platform.OS !== 'ios'}
      easing={Easing.elastic(1)}
      swipeThreshold={0}
      style={styles.modal}
      isOpen={this.state.isOpenModal}
      onClosed={this._onClosedModal}
    >
      {this.state.modalType === 'show' ? (
        <View style={styles.showImageBlock}>
          <View style={styles.full} />
          <Image
            source={this.state.image}
            style={[
              styles.showImage,
              {
                height: this.state.image.height > totalSize(50)
                  ? totalSize(50)
                  : this.state.image.height,
              },
            ]}
            resizeMode="contain"
            placeholderStyle={styles.bodyBgImagePlaceholder}
            PlaceholderContent={<ActivityIndicator />}
          />
          <View style={styles.showImageTextBlock}>
            <Text style={styles.imageLabelDate}>
              {this.state.date}
            </Text>
            <Text style={styles.imageLabelText} numberOfLines={1} ellipsizeMode="tail">
              {this.state.label || ''}
            </Text>
          </View>
        </View>

      ) : (
        <View style={styles.modalBlock}>
          <View style={styles.pickerBlock}>
            {!this.state.image ? (
              <TouchableOpacity style={styles.pickerBtn} onPress={this._onImagePicker}>
                <Ionicons name="md-add-circle" style={styles.pickerBtnIcon} />
              </TouchableOpacity>
            ) : this.state.modalType === 'add' ? (
              <TouchableOpacity onPress={this._onImagePicker}>
                <Image
                  source={this.state.image}
                  style={styles.pickerImage}
                  resizeMode="contain"
                  placeholderStyle={styles.bodyBgImagePlaceholder}
                  PlaceholderContent={<ActivityIndicator />}
                />
              </TouchableOpacity>
            ) : (
              <Image
                source={this.state.image}
                style={styles.pickerImage}
                resizeMode="contain"
                placeholderStyle={styles.bodyBgImagePlaceholder}
                PlaceholderContent={<ActivityIndicator />}
              />
            )}
          </View>
          <View style={styles.full}>
            <View style={styles.modalTextBlock}>
              <DatePicker
                date={this.state.date}
                mode="date"
                placeholder="select date"
                format="Do MMM, YY"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateInput: styles.textInputDate,
                  dateIcon: styles.dateIcon,
                  placeholderText: styles.dateText,
                  dateText: styles.dateText,
                }}
                iconSource={require('../../../assets/icons/calendar.png')}
                onDateChange={date => this.setState({ date })}
              />
            </View>
            <View style={styles.modalTextBlock}>
              <View style={styles.modalLabel}>
                <Text style={styles.modalTextLabel}>Title:</Text>
              </View>
              <TextInput
                style={styles.textInputLabel}
                value={this.state.label}
                onChangeText={text => this.setState({ label: text })}
                multiline
                numberOfLines={10}
                maxLength={1000}
              />
            </View>
          </View>
          <View style={styles.modalBtnBlock}>
            <TouchableOpacity style={styles.modalBtn} onPress={this._onClosedModal}>
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={this._saveImage}
              disabled={!this.state.image}
            >
              <Text
                style={[
                  styles.modalBtnText,
                  !this.state.image && { color:  'rgba(0, 0, 0, 0.11)' },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );

  _onImagePicker = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true });
        if (!pickerResult.cancelled) await this.setState({ image: pickerResult })
      }
    } else {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true });
      if (!pickerResult.cancelled) await this.setState({ image: pickerResult })
    }
  };

  _saveImage = () => {
    if (this.state.modalType === 'add') {
      this.props.addImage(
        this.state.image.uri,
        moment(this.state.date, 'Do MMM, YY').format('YYYY-MM-DD'),
        this.state.label,
        () => this.setState({ load: true }),
      )
    } else if (this.state.modalType === 'edit') {
      this.props.editImage(
        this.state.imageId,
        moment(this.state.date, 'Do MMM, YY').format('YYYY-MM-DD'),
        this.state.label,
      )
    }

    this._onClosedModal()
  };

  _onClosedModal = () => this.setState({
    isOpenModal: false,
    image: null,
    label: '',
    date: '',
    imageId: '',
    modalType: '',
  });

  _addImage = () => {
    this.setState({
      isOpenModal: true,
      modalType: 'add',
      date: new Date(),
      label: '',
    })
  };

  _editImage = (id, url, date, label) => {
    this.setState({
      isOpenModal: true,
      image: {
        uri: url,
      },
      label,
      date: moment(date).format('Do MMM, YY'),
      imageId: id,
      modalType: 'edit',
    })
  };

  _openImage = (url, date, label, height) => {
    this.setState({
      isOpenModal: true,
      image: {
        uri: url,
        height,
      },
      label,
      date: moment(date).format('Do MMM, YY'),
      modalType: 'show',
    })
  };

  _delImage = (id) => {
    Alert.alert(
      'Are you sure?',
      'This will delete the picture forever.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => this.props.delImage(id),
        },
      ],
    )
  };

  render() {
    const {
      myProfile, data, maxImages, style,
    } = this.props;

    return (
      <View style={styles.full}>
        {(myProfile && data.length < maxImages) && this._renderAddButton()}
        <Grid key="imagesGrid" style={style}>
          {({ state }) => (
            <Row fullHeight>
              {this._renderLayout(state, data)}
            </Row>
          )}
        </Grid>
        {this._renderModal()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  bodyBgImagePlaceholder: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBlock: {
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: totalSize(1),
    borderWidth: 0.5,
    borderColor: '#f7f7f7',
    elevation: 2,
  },
  imageLabelBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: totalSize(1),
    paddingVertical: totalSize(0.5),
    justifyContent: 'center',
  },
  imageLabelDate: {
    fontSize: totalSize(1.4),
    color: '#fff',
    marginBottom: totalSize(0.4),
    textAlign: 'right',
  },
  imageLabelText: {
    fontSize: totalSize(1.6),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  trash: {
    position: 'absolute',
    right: 5,
    top: 5,
    zIndex: 999,
    width: totalSize(3),
    height: totalSize(3),
    alignItems: 'flex-end',
  },
  trashIcon: {
    fontSize: totalSize(2.4),
    color: 'rgba(230, 94, 94, 0.8)',
  },
  addBtnBlock: {
    width: '100%',
    paddingHorizontal: totalSize(4),
    height: totalSize(4.5),
    marginBottom: totalSize(1.3),
  },
  addBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnIcon: {
    fontSize: totalSize(3),
    color: '#4A90E2',
  },
  modal: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlock: {
    width: totalSize(45),
    height: totalSize(70),
    backgroundColor: '#fff',
    borderRadius: totalSize(1),
    justifyContent: 'space-between',
    padding: totalSize(2.2),
  },
  showImageBlock: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  showImage: {
    width: width(100),
  },
  showImageTextBlock: {
    flex: 1,
    paddingHorizontal: totalSize(1.7),
    paddingTop: totalSize(1.7),
  },
  pickerBlock: {
    width: '100%',
    height: totalSize(30),
    marginBottom: totalSize(2.2),
  },
  pickerBtn: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerBtnIcon: {
    fontSize: totalSize(6),
    color: '#4A90E2',
  },
  pickerImage: {
    borderRadius: 5,
    width: '100%',
    height: totalSize(30),
  },
  modalTextBlock: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  textInputDate: {
    borderWidth: 0,
    marginLeft: totalSize(5),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  dateText: {
    color: '#a9a9b0',
    fontSize: totalSize(1.6),
    paddingTop: totalSize(0.5),
  },
  dateIcon: {
    position: 'absolute',
    left: 0,
    top: 4,
    marginLeft: 0,
    width: totalSize(2.5),
    height: totalSize(2.5),
  },
  modalTextLabel: {
    fontSize: totalSize(1.6),
    color: '#3b3b3b',
    fontWeight: 'bold',
    marginRight: totalSize(0.5),
  },
  textInputLabel: {
    fontSize: totalSize(1.6),
    color: '#3b3b3b',
    fontWeight: 'bold',
    width: '80%',
    height: totalSize(20),
    textAlignVertical: 'top',
    paddingTop: totalSize(1),
  },
  modalBtnBlock: {
    width: '100%',
    height: totalSize(4.5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: totalSize(1.2),
  },
  modalBtnText: {
    fontSize: totalSize(1.8),
    color: '#4A90E2',
    fontWeight: '500',
  },
  modalLabel: {
    height: '100%',
    paddingTop: totalSize(1),
    width: totalSize(5),
  },
});
