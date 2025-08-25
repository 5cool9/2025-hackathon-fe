// src/context/JournalContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

// 일지 타입 정의
export type JournalType = {
  id: string;  
  plantName: string;   // 식물 이름
  title: string;       // 일지 제목
  preview: string;     // 내용 미리보기
  photos?: string[];   // 사진 배열 (선택)
  date?: string;
  analysisResult?: { header: string; body: string; type?: string;   
  } | null;       
};

// Context 타입 정의
type JournalContextType = {
  journals: JournalType[];
  addJournal: (journal: JournalType) => void;
  updateJournal: (id: string, updated: JournalType) => void;
  deleteJournal: (id: string) => void; 
};

// Context 생성
const JournalContext = createContext<JournalContextType | undefined>(undefined);

// Provider
export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [journals, setJournals] = useState<JournalType[]>([]);

  const addJournal = (journal: JournalType) => {
    setJournals(prev => [journal, ...prev]);
  };

  const updateJournal = (id: string, updated: JournalType) => {
    setJournals(prev =>
      prev.map(j => (j.id === id ? { ...j, ...updated } : j))
    );
  };

  const deleteJournal = (id: string) => {
    setJournals(prev => prev.filter(j => j.id !== id)); // ✅ 삭제 처리
  };

  return (
    <JournalContext.Provider value={{ journals, addJournal, updateJournal, deleteJournal }}>
      {children}
    </JournalContext.Provider>
  );
};

// 커스텀 훅
export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error("useJournal must be used within a JournalProvider");
  return context;
};
