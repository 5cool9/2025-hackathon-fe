import React, { useContext, createContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Register 데이터 타입 정의
export type UserRegisterData = {
  id: string; 
  name: string;
  startDate: string;
  endDate: string;
  image: string;
  analysisResult?: string; // Analyze 결과
  badgeText?: string;
};

// Context 타입
type RegisterContextType = {
  userData: UserRegisterData[];
  tempData: Partial<UserRegisterData>;      // 임시 저장용
  saveTempData: (data: Partial<UserRegisterData>) => void;
  finalizeData: (data?: Partial<UserRegisterData>) => void; // 최종 저장
  addUserData: (data: UserRegisterData) => void; 
  deleteUserData: (name: string) => void;
};

// Context 생성
export const RegisterContext = createContext<RegisterContextType | null>(null);

// Provider 컴포넌트
export const RegisterProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserRegisterData[]>([]);
  const [tempData, setTempData] = useState<Partial<UserRegisterData>>({});

  // 임시 저장
  const saveTempData = (data: Partial<UserRegisterData>) => {
    setTempData(prev => ({ ...prev, ...data }));
  };

  // 최종 저장: data가 있으면 업데이트/추가, 없으면 tempData 사용
  const finalizeData = (data?: Partial<UserRegisterData>) => {
    const finalData = data ?? tempData;

    if (!finalData.name || !finalData.image) return;

    setUserData((prev: UserRegisterData[]) => {
      if (finalData.id) {
        // 수정
        return prev.map((item: UserRegisterData) =>
          item.id === finalData.id ? { ...item, ...finalData } as UserRegisterData : item
        );
      }
      // 새 등록
      return [...prev, { ...finalData, id: uuidv4() } as UserRegisterData];
    });

    setTempData({});
  };

  const addUserData = (data: UserRegisterData) => {
    setUserData(prev => [...prev, { ...data, id: uuidv4() }]);
  };

  const deleteUserData = (name: string) => {
    setUserData(prev => prev.filter(item => item.name !== name));
  };

  return (
    <RegisterContext.Provider
      value={{ userData, tempData, saveTempData, finalizeData, addUserData, deleteUserData }}
    >
      {children}
    </RegisterContext.Provider>
  );
};

// 훅
export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (!context) throw new Error('useRegister must be used within RegisterProvider');
  return context;
};
