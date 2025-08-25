// src/navigation/types.ts

// ============ RootStack: 앱 최상단 ============
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;

  // 루트에서 직접 접근하는 화면들
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
      id?: string | number;  // ✅ 첫 번째 파일에는 필수, 두 번째에는 없음 → 옵셔널 처리
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
      analysisResult?: { header: string; body: string; type?: string } | null; // ✅ type optional
      images?: { diaryImg: string; thumbnail: boolean }[]; // ✅ 첫 번째 파일에만 있었음
      thumbnailImage?: string;                             // ✅ 첫 번째 파일에만 있었음
    };
    analysisResult?: { header: string; body: string; type?: string } | null;   // ✅ 확장 버전으로
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
    analysisResult?: any; 
    startDate?: string;
    endDate?: string;
    cropData?: any;
  };
  ResultScreen: {
    image: string;
    name: string;
    startDate: string;
    endDate: string;
    tempCropId: number;
    analysisResult?: any;
  };
  EditregisterScreen: {
    tempCropId: number;
    id?: string | number;
    image: string;
    name: string;
    startDate?: string; 
    endDate?: string;
    cropImg?: string;
    analysisResult?: any; 
  };

  PlantDetail: {
    plantData: {
      id?: string | number;
      name: string;
      image?: string;
      cropImg?: string;
      badgeText?: string;
      startDate?: string;
      endDate?: string;
      startAt?: string;
      endAt?: string;
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
      id?: string | number;
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
      analysisResult?: { header: string; body: string; type?: string } | null;
      images?: { diaryImg: string; thumbnail: boolean }[];
      thumbnailImage?: string;
    };
    analysisResult?: { header: string; body: string; type?: string } | null;
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
  ChatRoom: { conversationId: string; senderId?: number }; // ✅ senderId 합침
};

// ============ HomeStack ============
export type HomeStackParamList = {
  HomeMain: {
    updatedPlant?: {
      id: string | number;
      name: string;
      cropImg?: string;
      image?: string;
      badgeText?: string;
      startDate?: string;
      endDate?: string;
      startAt?: string;
      endAt?: string;
      harvestDateEnd?: string;
      [key: string]: any;
    };
  } | undefined; // ✅ 두 번째 파일은 그냥 undefined → 확장 버전으로 통일
  Notifications: undefined;
};
