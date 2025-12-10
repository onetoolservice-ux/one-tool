'use client';
import React, { createContext, useContext } from 'react';
const UIContext = createContext<any>(null);
export const UIProvider = ({ children }: any) => <UIContext.Provider value={{}}>{children}</UIContext.Provider>;
export const useUI = () => useContext(UIContext);
