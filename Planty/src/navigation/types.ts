// src/navigation/types.ts

// ============ RootStack: 앱 최상단 ============
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;

  // (팀 파일에 존재) 루트에서 직접 접근하는 화면들
  Home: undefined;
  Result: { image: string; name: string };
  Register: undefined;

  PlantDetail: {
    plantData: {
      id?: string | number;
    name: string;
    image?: string;        // 로컬 이미지
    cropImg?: string;      // 서버 이미지 파일명
    badgeText?: string;
    startDate?: string;    // 로컬 fallback
    endDate?: string;      // 로컬 fallback
    startAt?: string;      // 서버 startAt
    endAt?: string;        // 서버 endAt
    harvestDateEnd?: string;
    };
    newJournal?: {
      title: string;
      preview: string;
      photos?: string[];
      date: string;
    };
  };

  Journal: {
    plantData: {
      name: string;
      image?: string;
      badgeText?: string;
      startDate?: string;
      harvestDateEnd?: string;
    };
    journal?: {
      id: string;
      title: string;
      preview: string;
      photos?: string[];
      date: string;
      analysisResult?: { header: string; body: string };
    };
    analysisResult?: { header: string; body: string };
  };

  JournalAI: {
    plantData: {
      id: string;    
      name: string;
      image?: string;
      badgeText?: string;
      startDate?: string;
      harvestDateEnd?: string;
      endDate?: string;
    };
  };
};

// ============ AuthStack ============
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

// ============ AppStack ============
export type AppStackParamList = {
  MainTab: undefined;

  Register: undefined;
  AnalyzeScreen: {
    image: string;
    name: string; 
    tempCropId?: number;
    analysisResult?: any; // 분석 결과 타입에 맞게 수정 가능
    startDate?: string;  // 추가
    endDate?: string;    // 추가
    cropData?: any;
  };
  ResultScreen: {
    image: string;
    name: string;
    startDate: string;
    endDate: string;
    tempCropId: number;
    analysisResult?: any; // 필요한 타입으로 수정 가능
  };
  EditregisterScreen: {
    tempCropId: number;
  id?: string | number;
  image: string;
  name: string;
  startDate?: string; 
  endDate?: string;
  cropImg?: string;      // 서버 이미지 사용 가능
  analysisResult?: any; 
  };

  PlantDetail: {
    plantData: {
      id?: string | number;
    name: string;
    image?: string;        // 로컬 이미지
    cropImg?: string;      // 서버 이미지 파일명
    badgeText?: string;
    startDate?: string;    // 로컬 fallback
    endDate?: string;      // 로컬 fallback
    startAt?: string;      // 서버 startAt
    endAt?: string;        // 서버 endAt
    harvestDateEnd?: string;
    };
    newJournal?: {
      title: string;
      preview: string;
      photos?: string[];
      date: string;
    };
  };

  Journal: {
    plantData: {
      name: string;
      image?: string;
      badgeText?: string;
      startDate?: string;
      harvestDateEnd?: string;
    };
    journal?: {
      id: string;
      title: string;
      preview: string;
      photos?: string[];
      date: string;
      analysisResult?: { header: string; body: string };
    };
    analysisResult?: { header: string; body: string };
  };

  JournalAI: {
    plantData: {
      id: string;    
      name: string;
      image?: string;
      badgeText?: string;
      startDate?: string;
      harvestDateEnd?: string;
      endDate?: string;
    };
  };
};

// ============ ChatStack ============
export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { conversationId: string };
};

// ============ HomeStack ============
export type HomeStackParamList = {
  HomeMain: undefined;
  Notifications: undefined;
};
