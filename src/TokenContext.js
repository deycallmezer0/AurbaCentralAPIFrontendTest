import React, { createContext, useContext, useState } from 'react';

const TokenContext = createContext(null);

export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState({ access_token: '', refresh_token: '' });

  const updateTokens = (newTokens) => {
    setTokens(newTokens);
  };

  return (
    <TokenContext.Provider value={{ ...tokens, updateTokens }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => useContext(TokenContext);
