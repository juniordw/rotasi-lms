import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeState = {
  darkMode: boolean;
};

// Initial state that works on both server and client
const initialState: ThemeState = {
  darkMode: false, // Default value, will be updated on client-side
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.darkMode = !state.darkMode;
      
      // Only modify DOM if in browser environment
      if (typeof window !== 'undefined') {
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', state.darkMode.toString());
      }
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      
      // Only modify DOM if in browser environment
      if (typeof window !== 'undefined') {
        if (action.payload) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', action.payload.toString());
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;