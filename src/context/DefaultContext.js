import React, { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [mediaDefined, setMediaDefined] = useState({
    isDesktopOrLaptop: true,
    isTablet: false,
    isMobile: false,
    isRetinal: false,
  });

  return (
    <GlobalContext.Provider value={{ mediaDefined, setMediaDefined }}>
      {children}
    </GlobalContext.Provider>
  );
};
