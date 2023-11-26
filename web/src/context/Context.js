import React, { createContext, useReducer } from "react";
import { reducer } from './Reducer';
export const GlobalContext = createContext("Initial Value");


let data = {
  user: {},  // firstName: "asif", lastName: "ahmed", email: "xxxxxxxxxxx"
  role: null, // null || "user" || "admin"
  isLogin: null, // null || true || false
  darkTheme: true
}


export default function ContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, data)
  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  )
}