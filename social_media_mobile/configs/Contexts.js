import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { authApi, endpoints } from "./APIs";
import { formatUrl } from "../dao";

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();

export const LikeTypeContext = createContext();

const ReactionContext = createContext();

export const ReactionProvider = ({ children }) => {
  const [reactions, setReactions] = useState([]);

  const fetchReactions = async () => {  
    try {
      const access_token = await AsyncStorage.getItem('token')
      const res = await authApi(access_token).get(endpoints['get_like_type']) 
      let reacts = []
      for (r of res.data) {
        let url = formatUrl(r.image)
        let newR = {
          source: {
            uri: url
          },
          title: r.name
        } 
        reacts = [...reacts, newR]
        // console.log(reacts)
      }
      setReactions(reacts);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }; 

  useEffect(() => { 
    fetchReactions();
  }, []);

  return (
    <ReactionContext.Provider value={{ reactions }}>
      {children}
    </ReactionContext.Provider>
  );
}; 

export const useReactions = () => useContext(ReactionContext);

export const AuthenticatedUserContext = createContext({});
export const AuthenticatedUserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
  
    return (
      <AuthenticatedUserContext.Provider value={{ user, setUser }}>
        {children}
      </AuthenticatedUserContext.Provider>
    );
  };