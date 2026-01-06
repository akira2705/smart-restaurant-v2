import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqCzF8nwcK1lCngDO7yq_Si_Mvk67sWV4",
  authDomain: "restaurant-app-24535.firebaseapp.com",
  projectId: "restaurant-app-24535",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
