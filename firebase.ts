
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCboCtD5xJpcW2yeCmctIYAktsqZ5SlwiE",
  authDomain: "lol-duo-e1474.firebaseapp.com",
  databaseURL: "https://lol-duo-e1474-default-rtdb.firebaseio.com",
  projectId: "lol-duo-e1474",
  storageBucket: "lol-duo-e1474.firebasestorage.app",
  messagingSenderId: "1003672904155",
  appId: "1:1003672904155:web:73c8983d0bbb9ace3bc7fe",
  measurementId: "G-LE96KMLS5V"
};

// 실제 제공된 프로젝트 ID인지 확인
export const isFirebaseConfigured = firebaseConfig.projectId !== "your-project-id";

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    // 이미 초기화된 앱이 있으면 사용, 없으면 새로 초기화
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app);
    console.log("Firebase & Firestore가 성공적으로 연결되었습니다.");
  } catch (error) {
    console.error("Firebase/Firestore 초기화 실패:", error);
    dbInstance = null;
  }
}

export const db = dbInstance;
