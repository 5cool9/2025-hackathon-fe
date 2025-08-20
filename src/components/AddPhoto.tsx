// src/components/CameraAddPhoto.tsx
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

const windowWidth = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const GAP = SP.md;
const ITEM_SIZE = (windowWidth - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

type CameraAddPhotoProps = {
  onSelect: (photos: string[]) => void;
  selected?: string[];
  
};

async function getLocalFileUri(uri: string): Promise<string> {
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
    console.warn('ph:// URI 변환 실패', e);
    return uri;
  }
}

export default function AddPhoto({ onSelect, selected = [] }: CameraAddPhotoProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; uri: string }[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    setSelectedPhotos(selected);
  }, [selected]);

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
        mediaType: MediaLibrary.MediaType.photo,
        first: 50,
        sortBy: [MediaLibrary.SortBy.creationTime],
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
    let updated;
    if (selectedPhotos.includes(uri)) {
      updated = selectedPhotos.filter(u => u !== uri);
    } else if (selectedPhotos.length < 9) {
      updated = [...selectedPhotos, uri];
    } else {
      Alert.alert('최대 9장까지 선택할 수 있습니다.');
      updated = selectedPhotos;
    }
    setSelectedPhotos(updated);
    onSelect(updated); 
  };

  const renderItem = ({ item, index }: { item: { id?: string; uri?: string }; index: number }) => {
    if (index === 0) {
      return (
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Text style={[txt.B3, { fontSize: 32, lineHeight: 36 }]}>📷</Text>
          <Text style={[txt.B3, { marginTop: 5, color: colors.gray40 }]}>사진 촬영</Text>
        </TouchableOpacity>
      );
    }
    const uri = item.uri!;
    const isSelected = selectedPhotos.includes(uri);
    return (
      <TouchableOpacity style={styles.photoWrapper} onPress={() => toggleSelect(uri)}>
        <Image source={{ uri }} style={[styles.photo, isSelected && { opacity: 0.5 }]} />
        {isSelected && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => toggleSelect(uri)}>
            <Text style={[txt.B4, { color: colors.gray0 }]}>✕</Text>
          </TouchableOpacity>
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

  const closeModal = () => setIsModalVisible(false);

  return (
    <>
      {/* 화면에서는 오직 아이콘만 */}
      <TouchableOpacity onPress={openModal}>
        <Image source={require('../../assets/icon/cameraBlack.png')} style={styles.icon} />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 40 }}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={[txt.B2, { color: '#007AFF' }]}>선택 완료</Text>
          </TouchableOpacity>

          <FlatList
            data={[{ id: 'camera' }, ...photos]}
            keyExtractor={(item, index) => item.id ?? `camera-${index}`}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{ padding: GAP / 2 }}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 28,
    height: 28,
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
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoWrapper: {
    margin: GAP / 2,
  },
  photo: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: radius.lg,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.gray90_70,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
});
