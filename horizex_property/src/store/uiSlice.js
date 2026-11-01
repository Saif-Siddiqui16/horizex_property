import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTabs: ['dashboard'],
  activeTab: 'dashboard',
  isSplitView: false,
  selectedPropertyId: 'ALL',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      if (!state.activeTabs.includes(action.payload)) {
        state.activeTabs.push(action.payload);
      }
    },
    closeTab: (state, action) => {
      state.activeTabs = state.activeTabs.filter((tab) => tab !== action.payload);
      if (state.activeTab === action.payload) {
        state.activeTab = state.activeTabs[state.activeTabs.length - 1] || 'dashboard';
      }
    },
    toggleSplitView: (state) => {
      state.isSplitView = !state.isSplitView;
    },
    setSelectedProperty: (state, action) => {
      state.selectedPropertyId = action.payload;
    },
  },
});

export const { setActiveTab, closeTab, toggleSplitView, setSelectedProperty } = uiSlice.actions;

export default uiSlice.reducer;

