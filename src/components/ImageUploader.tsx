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
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

type ImageUploaderProps = {
  onSelect?: (uri: string) => void;
  initialImage?: string | null; 
};

type PhotoItem = { id: string; localUri: string };

const windowWidth = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const GAP = SP.md;
const ITEM_SIZE = (windowWidth - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function ImageUploader({ onSelect , initialImage = null }: ImageUploaderProps) {
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

  useEffect(() => {
  if (initialImage) {
    setSelected(initialImage);
  }
}, [initialImage]);


  const getLocalFilePath = async (uri: string): Promise<string> => {
    if (!uri.startsWith('ph://')) return uri;
    try {
      const localId = uri.substring(5);
      const assetInfo = await MediaLibrary.getAssetInfoAsync(localId);
      if (assetInfo.localUri) return assetInfo.localUri;

      if (FileSystem.cacheDirectory) {
        const filename = localId.replace(/\//g, '_') + '.jpg';
        const cacheUri = FileSystem.cacheDirectory + filename;
        await FileSystem.copyAsync({ from: uri, to: cacheUri });
        return cacheUri;
      }
      return uri;
    } catch (e) {
      console.warn('ph:// 변환 실패', e);
      return uri;
    }
  };

  const loadPhotos = async () => {
    try {
      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 50,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const list: PhotoItem[] = await Promise.all(
        assets.assets.map(async (asset) => {
          const info = await MediaLibrary.getAssetInfoAsync(asset.id);
          const localUri = info.localUri ? info.localUri : asset.uri.startsWith('ph://') ? await getLocalFilePath(asset.uri) : asset.uri;
          return { id: asset.id, localUri };
        })
      );
      setPhotos(list);
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
      const local = await getLocalFilePath(result.assets[0].uri);
      setSelected(local);
      onSelect?.(local);
      setIsModalVisible(false);
      await loadPhotos();
    }
  };

  const onPhotoSelect = async (uri: string) => {
    const local = await getLocalFilePath(uri);
    setSelected(local);
    onSelect?.(local);
    setIsModalVisible(false);
  };

  const isCameraButton = (item: PhotoItem | { isCameraButton: boolean }): item is { isCameraButton: boolean } =>
    'isCameraButton' in item;

  const renderItem = ({ item }: { item: PhotoItem | { isCameraButton: boolean } }) => {
    if (isCameraButton(item)) {
      return (
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Text style={[txt.B2, { fontSize: 24, lineHeight: 28 }]}>📷</Text>
          <Text style={[txt.B3, { marginTop: 5, color: colors.gray40 }]}>사진 촬영</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => onPhotoSelect(item.localUri)} style={styles.photoWrapper}>
        <Image source={{ uri: item.localUri }} style={styles.photo} />
      </TouchableOpacity>
    );
  };

  if (!hasPermission) return null;

  return (
    <>
      <TouchableOpacity style={styles.uploadBox} onPress={() => setIsModalVisible(true)}>
        {selected ? (
          <Image source={{ uri: selected }} style={styles.imageFull} />
        ) : (
          <Image source={require('../../assets/icon/bxImage.png')} style={styles.placeholderIcon} resizeMode="contain" />
        )}
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <Text style={txt.B2}>닫기 ✕</Text>
          </TouchableOpacity>

          <FlatList
            data={[{ isCameraButton: true }, ...photos]}
            keyExtractor={(item, index) => (isCameraButton(item) ? 'camera_button' : item.id)}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{ padding: GAP / 2 }}
            style={{ flex: 1, width: '100%' }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  uploadBox: {
    width: windowWidth * 0.9, // 화면 90%로 반응형
    height: ((windowWidth * 0.9) * 216) / 358, 
    backgroundColor: colors.gray10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  imageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 40,
  },
  closeButton: {
    paddingHorizontal: SP.lg,
    paddingVertical: SP.sm,
    alignSelf: 'flex-end',
  },
  cameraButton: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: colors.gray20,
    margin: GAP / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  photoWrapper: {
    margin: GAP / 2,
  },
  photo: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: radius.lg,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
  },
});
