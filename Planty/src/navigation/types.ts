// RootStack: 앱 최상단
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined; 
  Home: undefined;  
  Result: { image: string; name: string };       
  Register: undefined;  
  PlantDetail: { 
    plantData: { name: string; image?: string; badgeText?: string; startDate?: string; harvestDateEnd?: string; endDate?: string;
    };
    newJournal?: {   // 여기에 추가
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
  journal?: {   // 추가된 읽기용 데이터
    id: string;
    title: string;
    preview: string;
    photos?: string[];
    date: string;
    analysisResult?: { header: string; body: string };
  };
  analysisResult?: { header: string; body: string };
};
  JournalAI: {  // ✅ undefined에서 변경
    plantData: {
      name: string;
      image?: string;
      badgeText?: string;
      startDate?: string;
      harvestDateEnd?: string;
      endDate?: string;
    };
  };
};

// AuthStack
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

// AppStack
export type AppStackParamList = {
  MainTab: undefined;
  Register: undefined; 
  AnalyzeScreen: { image: string };
  ResultScreen: { image: string; name: string };  
  EditregisterScreen: { id?: string; image: string; name: string; startDate?: string; endDate?: string; };
  PlantDetail: { 
    plantData: { id?: string; name: string; image?: string; badgeText?: string; startDate?: string; harvestDateEnd?: string; endDate?: string;
    };
    newJournal?: {   // 여기에 추가
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
  journal?: {   // 추가된 읽기용 데이터
    id: string;
    title: string;
    preview: string;
    photos?: string[];
    date: string;
    analysisResult?: { header: string; body: string };
  };
  analysisResult?: { header: string; body: string };
};
  JournalAI: {  // ✅ undefined에서 변경
    plantData: {
      name: string;
      image?: string;
      badgeText?: string;
      startDate?: string;
      harvestDateEnd?: string;
      endDate?: string;
    };
  };
};

// Bottom Tab
export type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Sell: undefined;
  MyPage: undefined;
};
