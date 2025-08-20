// src/screens/JournalScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ScrollView,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/types";
import Arrowicon from "../../assets/icon/icon_arrowLeft.svg";
import CameraAddPhoto from "../components/AddPhoto";
import DotMenu from "../../assets/icon/icon_dotMenu.svg";
import Pen from "../../assets/icon/uil_pen.svg";
import TrashCan from "../../assets/icon/trashcan.svg";
import { useJournal, JournalType } from "../context/JournalContext";
import MethodDescription from '../components/MethodDescription';
import BtnToggle from '../components/BtnToggle';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.04;
const BOTTOM_BAR_HEIGHT = 80;
const BOTTOM_OFFSET = 30;

type Props = NativeStackScreenProps<AppStackParamList, "Journal">;

export default function JournalScreen({ navigation, route }: Props) {
  const plantData = route.params?.plantData;
  const journal = route.params?.journal;
  const analysisResult = route.params?.analysisResult; 
  const { deleteJournal, addJournal, updateJournal , journals } = useJournal();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isMethodVisible, setIsMethodVisible] = useState(true); // 기본 켜짐

  const isValid = title.trim().length > 0 && content.trim().length > 0;
  const [isEditing, setIsEditing] = useState(!journal);
  const [savedDate, setSavedDate] = useState<string | null>(null);

  // dot_menu 열림 상태
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (journal) {
      setTitle(journal.title);
      setContent(journal.preview);
      setPhotos(journal.photos || []);
      setSavedDate(journal.date);
    }
  }, [journal]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height - BOTTOM_OFFSET,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleComplete = () => {
    if (!isValid) return;

    setIsEditing(false);

    const today = new Date().toLocaleDateString();
    setSavedDate(today);

    const newJournal: JournalType = {
      id: journal?.id || String(Date.now()),
      plantName: plantData.name,
      title,
      preview: content,
      photos,
      date: today,
      analysisResult: analysisResult ?? journal?.analysisResult,
    };

    if (journal) {
      updateJournal(journal.id, newJournal); // 수정
    } else {
      addJournal(newJournal); // 새 작성
    }
    navigation.goBack();
    
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: HORIZONTAL_PADDING,
            paddingBottom: BOTTOM_BAR_HEIGHT + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Arrowicon width={30} height={30} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
                {isEditing ? "재배일지 작성" : "재배일지"}
            </Text>

            {isEditing ? (
              <TouchableOpacity disabled={!isValid} onPress={handleComplete}>
                <Text
                  style={[
                    styles.headerRightText,
                    { color: isValid ? "#7EB85B" : "#A2A2A2" },
                  ]}
                >
                  완료
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <DotMenu width={30} height={30} />
              </TouchableOpacity>
            )}
          </View>

          {/* 제목 입력 */}
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력해주세요"
            placeholderTextColor="#A2A2A2"
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
          />

          {/* 가로선 */}
          <View style={styles.separator} />

          {/* 내용 입력 */}
          <TextInput
            style={styles.contentInput}
            placeholder="식물 재배 중 기록하고 싶은 내용을 입력해주세요"
            placeholderTextColor="#A2A2A2"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={isEditing}
          />

          {/* 선택한 사진 표시 */}
          {photos.length > 0 && (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              style={{ height: 120, marginTop: 30 }}
              contentContainerStyle={{ alignItems: "flex-start" }}
            >
              {photos.map((uri) => (
                <View key={uri} style={{ marginRight: 8 }}>
                  <Image
                    source={{ uri }}
                    style={{ width: 100, height: 100, borderRadius: 4 }}
                  />
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => setPhotos(photos.filter((p) => p !== uri))}
                    >
                      <Image
                        source={require("../../assets/icon/x.png")}
                        style={styles.deleteIconImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
          
          {(analysisResult || journal?.analysisResult) && (
            <View style={{ marginTop: 30 }}>
                <MethodDescription
                headerText={(analysisResult || journal?.analysisResult)?.header || ''}
                bodyText={(analysisResult || journal?.analysisResult)?.body || ''}
                isVisible={isMethodVisible} 
                headerRight={
                <BtnToggle
                value={isMethodVisible} 
                onValueChange={(val) => setIsMethodVisible(val)} 
                />
            }
            />
            </View>
        )}
          {!isEditing && savedDate && (
            <Text style={{ color: "#A2A2A2", fontSize: 14 }}>{savedDate}</Text>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(34,34,34,0.4)', 
            justifyContent: 'center', 
            alignItems: 'flex-end',   
        }}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View
            style={{
              position: "absolute",
              top: 100,
              right: 30,
              backgroundColor: "white",
              borderRadius: 4,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 5,
              width: 180,
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={() => {
                setMenuVisible(false);
                setIsEditing(true);
              }}
            >
              <Text style={{ fontSize: 16 }}>수정</Text>
              <Pen width={24} height={24} />
            </TouchableOpacity>
            
            <View style={{ height: 1, backgroundColor: "#eee" }} />

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}
              onPress={() => {
                setMenuVisible(false);
                if (!journal) return; 
                Alert.alert(
                    "삭제하시겠습니까?",
                    "",
                    [
                        { text: "취소" },
                        { text: "확인", onPress: () => { deleteJournal(journal.id); 
                            navigation.navigate("PlantDetail", { plantData }); }
                        },
                    ]
                );
            }}>
              <Text style={{ fontSize: 16 }}>삭제</Text>
              <TrashCan width={24} height={24} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 하단바 + 키보드 아래 흰색 덮개 */}
      {isEditing && (
        <>
          <Animated.View
            style={[
              styles.bottomBar,
              { position: "absolute", left: 0, right: 0, bottom: keyboardHeight },
            ]}
          >
            <CameraAddPhoto onSelect={setPhotos} selected={photos} />
          </Animated.View>

          {/* 키보드 아래 공간 덮기 */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: keyboardHeight,
              backgroundColor: "#fff",
            }}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "500",
  },
  headerRightText: {
    fontSize: 20,
    fontWeight: "700",
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 10,
    color: "#444",
    paddingTop: 40,
  },
  separator: {
    height: 1,
    backgroundColor: "#D6D6D6",
    marginVertical: 12,
  },
  contentInput: {
    fontSize: 16,
    fontWeight: "500",
    paddingTop: 10,
    paddingBottom: 2,
    color: "#444",
    minHeight: 100,
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  deleteIconImage: {
    width: 16,
    height: 16,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 12,
    paddingLeft: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
});
