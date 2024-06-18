import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import APIs, { authApi, endpoints } from "./APIs";
import { formatUrl } from "../dao"; 
import React from "react";
import { MyUserReducer } from "./Reducers";

export const LikeTypeContext = createContext();

const ReactionContext = createContext();

export const ReactionProvider = ({ children }) => {
  const [reactions, setReactions] = useState([]); 

  const fetchReactions = async () => {  
    try { 
      const res = await APIs.get(endpoints['get_like_type'])  
      let reacts = []
      for (r of res.data) { 
        let newR = {
          source: {
            uri: formatUrl(r.image)
          },
          title: r.name
        } 
        reacts = [...reacts, newR]
        console.log(reacts)
      } 
      setReactions(reacts);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }; 

  useEffect(() => { 
    fetchReactions()
  }, []);

  return (
    <ReactionContext.Provider value={{ reactions }}>
      {children}
    </ReactionContext.Provider>
  );
}; 

export const useReactions = () => useContext(ReactionContext);

// export const AuthenticatedUserContext = createContext({});
// export const AuthenticatedUserProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
  
//     return (
//       <AuthenticatedUserContext.Provider value={{ user, setUser }}>
//         {children}
//       </AuthenticatedUserContext.Provider>
//     );
//   };

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, dispatch] = useReducer(MyUserReducer, null); 
  
    const login = async (userData) => {
      dispatch({ type: 'login', payload: userData });
      // await AsyncStorage.setItem('user', JSON.stringify(userData));
    }; 
    
    const update = async (userData) => {
      dispatch({ type: 'update', payload: userData });
      // await AsyncStorage.setItem('user', JSON.stringify(userData));
    };
  
    const logout = async () => {
      dispatch({ type: 'logout' });
      console.log('logged out');
      await AsyncStorage.removeItem('token');
    };
  
    return (
      <AuthContext.Provider value={{ user, login, logout, dispatch, update }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => React.useContext(AuthContext);