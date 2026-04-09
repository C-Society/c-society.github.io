import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // User Profile & Preferences
      skillLevel: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
      language: 'Python', // Current language they are learning
      weaknesses: [],
      completedLessons: [],
      hasCompletedOnboarding: false,
      isAdvancedMode: false,
      
      // Current Session State
      currentLesson: null,
      chatHistory: [],
      codeContent: '',
      onboardingStep: 0,
      
      // Actions
      setLanguage: (lang) => set({ language: lang }),
      setCodeContent: (code) => set({ codeContent: code }),
      addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
      clearChat: () => set({ chatHistory: [] }),
      
      setCurrentLesson: (lesson) => set({ 
        currentLesson: lesson, 
        codeContent: lesson.initialCode || '' 
      }),
      markLessonCompleted: (lessonId) => set((state) => ({ 
        completedLessons: [...new Set([...state.completedLessons, lessonId])] 
      })),
      
      updateProfile: (profileUpdates) => set((state) => ({ ...state, ...profileUpdates })),
      setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),
      setAdvancedMode: (advanced) => set({ isAdvancedMode: advanced }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
    }),
    {
      name: 'ate-user-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        skillLevel: state.skillLevel,
        language: state.language,
        weaknesses: state.weaknesses,
        completedLessons: state.completedLessons,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isAdvancedMode: state.isAdvancedMode
      }),
    }
  )
);
