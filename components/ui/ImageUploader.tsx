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
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ImageUploaderProps = {
  onSelect?: (uri: string) => void;
};

type PhotoItem = {
  id: string;
  localUri: string;
};

const windowWidth = Dimensions.get('window').width;
const numColumns = 3;
const spacing = 10; // 아이템 간 간격
const itemSize = (windowWidth - spacing * (numColumns + 1)) / numColumns;

export default function ImageUploader({ onSelect }: ImageUploaderProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

      if (status === 'granted' && cameraStatus.status === 'granted') {
        setHasPermission(true);
        await loadPhotos();
      } else {
        Alert.alert('권한 필요', '사진과 카메라 권한을 허용해주세요.');
      }
    })();
  }, []);

  const getLocalFilePath = async (uri: string): Promise<string> => {
    if (!uri.startsWith('ph://')) {
      return uri;
    }
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
      console.warn('ph:// 변환 실패', e);
      return uri;
    }
  };

  const loadPhotos = async () => {
    try {
      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
        sortBy: ['creationTime'],
      });

      const assetsWithLocalUri: PhotoItem[] = await Promise.all(
        assets.assets.map(async (asset) => {
          try {
            const info = await MediaLibrary.getAssetInfoAsync(asset.id);
            const localUri = info.localUri
              ? info.localUri
              : asset.uri.startsWith('ph://')
              ? await getLocalFilePath(asset.uri)
              : asset.uri;
            return {
              id: asset.id,
              localUri,
            };
          } catch {
            return {
              id: asset.id,
              localUri: asset.uri,
            };
          }
        })
      );

      setPhotos(assetsWithLocalUri);
    } catch (e) {
      console.warn('사진 불러오기 실패', e);
    }
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      let uri = result.assets[0].uri;
      uri = await getLocalFilePath(uri);
      setSelected(uri);
      onSelect?.(uri);
      setIsModalVisible(false);
      await loadPhotos();
    }
  };

  const onPhotoSelect = async (uri: string) => {
    const localUri = await getLocalFilePath(uri);
    setSelected(localUri);
    onSelect?.(localUri);
    setIsModalVisible(false);
  };

  const isCameraButton = (
    item: PhotoItem | { isCameraButton: boolean }
  ): item is { isCameraButton: boolean } =>
    'isCameraButton' in item && item.isCameraButton;

  const renderItem = ({
    item,
  }: {
    item: PhotoItem | { isCameraButton: boolean };
  }) => {
    if (isCameraButton(item)) {
      return (
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Text style={{ fontSize: 24 }}>📷</Text>
          <Text style={{ fontSize: 14, marginTop: 5, color: '#555' }}>
            사진 촬영
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => onPhotoSelect(item.localUri)}
        style={styles.photoWrapper}
      >
        <Image source={{ uri: item.localUri }} style={styles.photo} />
      </TouchableOpacity>
    );
  };

  if (!hasPermission) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={() => setIsModalVisible(true)}
      >
        {selected ? (
          <Image source={{ uri: selected }} style={styles.imageFull} />
        ) : (
          <Image source={require('@/assets/icon/bxImage.png')}  style={styles.placeholderIcon} resizeMode="contain"/>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={{ fontSize: 18 }}>닫기 ✕</Text>
          </TouchableOpacity>

          <FlatList
            data={[{ isCameraButton: true }, ...photos]}
            keyExtractor={(item, index) =>
              isCameraButton(item) ? 'camera_button' : item.id
            }
            renderItem={renderItem}
            numColumns={numColumns}
            contentContainerStyle={{ padding: spacing / 2 }}
            style={{ flex: 1, width: '100%' }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  uploadBox: {
    width: 358,
    height: 216,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  imageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  photoWrapper: {
    margin: spacing / 2,
  },
  photo: {
    width: itemSize,
    height: itemSize,
    borderRadius: 8,
  },
  placeholderIcon: {
  width: 44,   
  height: 44,
  },

});
