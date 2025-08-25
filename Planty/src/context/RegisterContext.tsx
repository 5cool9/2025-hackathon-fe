// src/context/RegisterContext.tsx
import React, { useContext, createContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getAccessToken } from '../utils/token'; // accessToken 가져오기


export type UserRegisterData = {
  id: string; 
  name: string;
  startDate: string;
  endDate: string;
  image: string;
  analysisResult?: string;
  badgeText?: string;
};

export type RegisterContextType = {
  userData: UserRegisterData[];
  setUserData: React.Dispatch<React.SetStateAction<UserRegisterData[]>>;
  tempData: Partial<UserRegisterData>;
  saveTempData: (data: Partial<UserRegisterData>) => void;
  finalizeData: (data?: Partial<UserRegisterData>) => void;
  addUserData: (data: UserRegisterData) => void;
  deleteUserData: (name: string) => void;
};

export const RegisterContext = createContext<RegisterContextType | null>(null);

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserRegisterData[]>([]);
  const [tempData, setTempData] = useState<Partial<UserRegisterData>>({});

  // 앱 시작 시 서버에서 데이터 fetch
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;

        const response = await axios.get('http://43.200.244.250/api/crop/register', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          // 서버 데이터 포맷에 맞춰 변환
          const crops: UserRegisterData[] = response.data.data.map((c: any) => ({
            id: c.id.toString(),
            name: c.name,
            startAt: c.startAt,
            endAt: c.endAt,
            image: c.image ?? '',
            analysisResult: c.analysisResult ?? '',
          }));
          setUserData(crops);
        }
      } catch (error) {
        console.log('Fetch UserData Error:', error);
      }
    };

    fetchUserData();
  }, []);

  const saveTempData = (data: Partial<UserRegisterData>) => {
    setTempData(prev => ({ ...prev, ...data }));
  };

  const finalizeData = (data?: Partial<UserRegisterData>) => {
    const finalData = data ?? tempData;
    if (!finalData.name || !finalData.image) return;

    setUserData(prev => {
      if (finalData.id) {
        return prev.map(item => (item.id === finalData.id ? { ...item, ...finalData } as UserRegisterData : item));
      }
      return [...prev, { ...finalData, id: uuidv4() } as UserRegisterData];
    });

    setTempData({});
  };

  const addUserData = (data: UserRegisterData) => {
    setUserData(prev => [...prev, { ...data, id: uuidv4() }]);
  };

  const deleteUserData = (id: string) => {
  setUserData(prev => prev.filter(item => item.id !== id));
};


  return (
    <RegisterContext.Provider
      value={{ userData, setUserData, tempData, saveTempData, finalizeData, addUserData, deleteUserData }}
    >
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (!context) throw new Error('useRegister must be used within RegisterProvider');
  return context;
};
