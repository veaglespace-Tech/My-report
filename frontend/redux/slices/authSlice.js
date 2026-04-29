import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  role: null,
  profile: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token ?? null;
      state.role = action.payload.role ?? null;
      state.profile = action.payload.profile ?? null;
      state.isAuthenticated = Boolean(action.payload.token);
    },
    hydrateSession: (state, action) => {
      state.token = action.payload.token ?? null;
      state.role = action.payload.role ?? null;
      state.profile = action.payload.profile ?? null;
      state.isAuthenticated = Boolean(action.payload.token);
    },
    updateProfile: (state, action) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };
    },
    clearAuth: () => initialState,
  },
});

export const { setCredentials, hydrateSession, updateProfile, clearAuth } = authSlice.actions;
export default authSlice.reducer;
