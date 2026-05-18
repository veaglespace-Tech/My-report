"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { store } from "@/redux/store";
import { hydrateSession } from "@/redux/slices/authSlice";
import { setThemeMode } from "@/redux/slices/uiSlice";
import { getStoredSession } from "@/lib/session";
import { applyThemeMode, persistThemeMode, resolveThemeMode } from "@/lib/theme";

function SessionHydrator({ children }) {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.ui.themeMode);

  useEffect(() => {
    const session = getStoredSession();
    if (session.token) {
      dispatch(hydrateSession(session));
    }

    dispatch(setThemeMode(resolveThemeMode(session.profile?.preferences?.darkMode)));
  }, [dispatch]);

  useEffect(() => {
    applyThemeMode(themeMode);
    persistThemeMode(themeMode);
  }, [themeMode]);

  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <SessionHydrator>{children}</SessionHydrator>
    </Provider>
  );
}
