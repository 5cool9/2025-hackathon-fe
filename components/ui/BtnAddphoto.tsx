import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const numColumns = 3;
const spacing = 10;
const itemSize = (windowWidth - spacing * (numColumns + 1)) / numColumns;

type BtnAddPhotoProps = {
  onSelect: (photos: string[]) => void;
};

// iOS ph:// 스킴 변환 함수
async function getLocalFileUri(uri: string): Promise<string> {
  if (!uri.startsWith('ph://')) return uri;
  try {
    const localId = uri.substring(5);
    const assetInfo = await MediaLibrary.getAssetInfoAsync(localId);

    if (assetInfo.localUri) {
      return assetInfo.localUri;
    } else if (FileSystem.cacheDirectory) {
      const filename = localId.replace(/\//g, '_') + '.jpg';
      const cacheUri = FileSystem.cacheDirectory + filename;
      await FileSystem.copyAsync({ from: uri, to: cacheUri });
      return cacheUri;
    } else {
      return uri;
    }
  } catch (e) {
    console.warn('ph:// URI 변환 실패', e);
    return uri;
  }
}

export default function BtnAddPhoto({ onSelect }: BtnAddPhotoProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; uri: string }[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState(false);


  useEffect(() => {
    onSelect(selectedPhotos);
  }, [selectedPhotos]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        await loadPhotos();
      } else {
        Alert.alert('권한 필요', '사진 접근 권한을 허용해주세요.');
      }
    })();
  }, []);


  const loadPhotos = async () => {
    try {
      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
        sortBy: ['creationTime'],
      });

      const photosWithLocalUri = await Promise.all(
        assets.assets.map(async (a) => {
          const localUri = await getLocalFileUri(a.uri);
          return { id: a.id, uri: localUri };
        })
      );

      setPhotos(photosWithLocalUri);
    } catch (e) {
      console.warn('사진 불러오기 실패', e);
    }
  };

  const openCamera = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('권한 필요', '카메라 권한을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      toggleSelect(uri);
      await loadPhotos(); 
    }
  };

  const toggleSelect = (uri: string) => {
    let updatedPhotos;
    if (selectedPhotos.includes(uri)) {
      updatedPhotos = selectedPhotos.filter(u => u !== uri);
    } else if (selectedPhotos.length < 9) {
      updatedPhotos = [...selectedPhotos, uri];
    } else {
      Alert.alert('최대 9장까지 선택할 수 있습니다.');
      updatedPhotos = selectedPhotos;
    }
    setSelectedPhotos(updatedPhotos);
  };

  const renderItem = ({ item, index }: { item: { id?: string; uri?: string }; index: number }) => {
    if (index === 0) {
      return (
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Text style={{ fontSize: 32 }}>📷</Text>
          <Text style={{ marginTop: 5, fontSize: 14, color: '#555' }}>사진 촬영</Text>
        </TouchableOpacity>
      );
    }
    const uri = item.uri!;
    const isSelected = selectedPhotos.includes(uri);
    return (
      <TouchableOpacity style={styles.photoWrapper} onPress={() => toggleSelect(uri)}>
        <Image source={{ uri }} style={[styles.photo, isSelected && { opacity: 0.5 }]} />
        {isSelected && (
          <View style={styles.checkOverlay}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const openModal = async () => {
    if (!hasPermission) {
      Alert.alert('권한 필요', '사진 접근 권한을 허용해주세요.');
      return;
    }
    await loadPhotos();
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <View style={styles.containerRow}>
        <TouchableOpacity style={styles.box} onPress={openModal}>
        <Image
            source={require('@/assets/icon/CameraGray.png')}
            style={styles.icon}
        />
          <Text style={styles.photoCountText}>
            <Text style={{ color: selectedPhotos.length === 0 ? '#A2A2A2' : 'green' }}>
                {selectedPhotos.length}
            </Text>
            <Text style={{ color: '#A2A2A2' }}>{`/9`}</Text>
          </Text>
          
        </TouchableOpacity>

        {/* 선택된 사진들 썸네일 스크롤 영역 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedPhotosScroll}
        >
          {selectedPhotos.map(uri => (
            <View key={uri} style={styles.selectedPhotoWrapper}>
              <Image source={{ uri }} style={styles.selectedPhoto} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setSelectedPhotos(selectedPhotos.filter(u => u !== uri))}
              >
                <Image
                  source={require('@/assets/icon/x.png')}
                  style={styles.deleteIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 사진 선택 모달 */}
      <Modal visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={{ fontSize: 18, color: '#007AFF' }}>선택 완료</Text>
          </TouchableOpacity>

          <FlatList
            data={[{ id: 'camera' }, ...photos]}
            keyExtractor={(item, index) => item.id ?? `camera-${index}`}
            renderItem={renderItem}
            numColumns={numColumns}
            contentContainerStyle={{ padding: spacing / 2 }}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 70,
    height: 70,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A2A2A2',
    backgroundColor: '#FFF',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    aspectRatio: 1 / 1,
  },
  photoCountText: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    color: '#A2A2A2',
  },
  photoCountSelected: {
    color: 'green',
  },
  icon: {
    width: 24,
    height: 24,
    marginTop: 6,
  },
  selectedPhotosScroll: {
    paddingLeft: 8,
    alignItems: 'center',
  },
  selectedPhotoWrapper: {
    marginRight: 8,
    width: 70,
    height: 70,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    aspectRatio: 1,
    zIndex: 10,
  },
  deleteIconImage: {
    width: 16,
    height: 16,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'flex-end',
  },
  cameraButton: {
    width: itemSize,
    height: itemSize,
    backgroundColor: '#ddd',
    margin: spacing / 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoWrapper: {
    margin: spacing / 2,
  },
  photo: {
    width: itemSize,
    height: itemSize,
    borderRadius: 8,
  },
  checkOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
});
