// src/components/BtnAddphoto.tsx
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useMemo, useState } from 'react';
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
import { colors, spacing as SP, radius, txt } from '../theme/tokens';

const windowWidth = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const GAP = SP.md;
const ITEM_SIZE = (windowWidth - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

type BtnAddPhotoProps = {
  onSelect: (photos: string[]) => void;
  /** 초기 선택값(수정 모드 등) */
  initialSelected?: string[];
  /** 선택 최대 개수(기본 9) */
  max?: number;
  /** 표시 방식: full = 카운터/프리뷰, icon = 아이콘만 */
  variant?: 'full' | 'icon';
  /** 하위호환: true면 icon 모드 */
  useIconOnly?: boolean;
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

export default function BtnAddPhoto({
  onSelect,
  initialSelected,
  max = 9,
  variant,
  useIconOnly,
}: BtnAddPhotoProps) {
  const finalVariant: 'full' | 'icon' = useMemo(
    () => variant ?? (useIconOnly ? 'icon' : 'full'),
    [variant, useIconOnly]
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; uri: string }[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
    initialSelected ? initialSelected.slice(0, max) : []
  );
  const [hasPermission, setHasPermission] = useState(false);

  // 외부 초기값이 바뀌면 반영
  useEffect(() => {
    if (!initialSelected) return;
    setSelectedPhotos(initialSelected.slice(0, max));
  }, [initialSelected && initialSelected.join('|'), max]);

  // 부모에 선택 결과 전달
  useEffect(() => {
    onSelect(selectedPhotos);
  }, [selectedPhotos, onSelect]);

  // 권한 및 초기 로드
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
    setSelectedPhotos((curr) => {
      if (curr.includes(uri)) return curr.filter((u) => u !== uri);
      if (curr.length >= max) {
        Alert.alert(`최대 ${max}장까지 선택할 수 있습니다.`);
        return curr;
      }
      return Array.from(new Set([...curr, uri]));
    });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: { id?: string; uri?: string };
    index: number;
  }) => {
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
          <View style={styles.checkOverlay}>
            <Text style={[txt.B4, { color: colors.gray0 }]}>✓</Text>
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
  const closeModal = () => setIsModalVisible(false);

  return (
    <>
      {/* 트리거 영역 */}
      {finalVariant === 'full' ? (
        <View style={styles.containerRow}>
          <TouchableOpacity style={styles.box} onPress={openModal}>
            <Image source={require('../../assets/icon/CameraGray.png')} style={styles.icon} />
            <Text style={styles.photoCountText}>
              <Text style={{ color: selectedPhotos.length === 0 ? colors.gray25 : colors.primary }}>
                {selectedPhotos.length}
              </Text>
              <Text style={{ color: colors.gray25 }}>{`/${max}`}</Text>
            </Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedPhotosScroll}
          >
            {selectedPhotos.map((uri) => (
              <View key={uri} style={styles.selectedPhotoWrapper}>
                <Image source={{ uri }} style={styles.selectedPhoto} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setSelectedPhotos((curr) => curr.filter((u) => u !== uri))}
                >
                  <Image
                    source={require('../../assets/icon/x.png')}
                    style={styles.deleteIconImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        // icon 모드: 작은 아이콘만
        <TouchableOpacity onPress={openModal}>
          <Image source={require('../../assets/icon/cameraBlack.png')} style={{ width: 28, height: 28 }} />
        </TouchableOpacity>
      )}

      {/* 선택 모달 */}
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
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 70,
    height: 70,
    padding: SP.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    aspectRatio: 1,
  },
  photoCountText: {
    ...txt.B4,
    color: colors.subText,
  },
  icon: { width: 24, height: 24, marginTop: SP.xs },
  selectedPhotosScroll: {
    paddingLeft: SP.sm,
    alignItems: 'center',
  },
  selectedPhotoWrapper: {
    marginRight: SP.sm,
    width: 70,
    height: 70,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
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
  deleteIconImage: { width: 16, height: 16 },
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
  photoWrapper: { margin: GAP / 2 },
  photo: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: radius.lg,
  },
  checkOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.gray90_70,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
});
