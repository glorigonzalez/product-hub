import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDUTNLDknRDee7z8CS4ZR-nt3Xsos14OPc',
  authDomain: 'product-hub-be8a0.firebaseapp.com',
  projectId: 'product-hub-be8a0',
  storageBucket: 'product-hub-be8a0.firebasestorage.app',
  messagingSenderId: '1078280510851',
  appId: '1:1078280510851:web:2ca82ab8888c0e05f12ab6',
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const stateRef = doc(db, 'hub', 'state');

export async function loadFromFirestore(seedProjects) {
  const snap = await getDoc(stateRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  const savedIds = new Set((data.projects || []).map(p => p.id));
  const newSeeds = seedProjects.filter(p => !savedIds.has(p.id));
  return {
    projects:      [...(data.projects || []), ...newSeeds],
    feedbackItems: data.feedbackItems  || [],
    clients:       data.clients        || [],
    features:      data.features       || [],
    nextId:        data.nextId         || 6,
    nextFbId:      data.nextFbId       || 1,
    nextAlcanceId: data.nextAlcanceId  || 1,
  };
}

export async function saveToFirestore(payload) {
  await setDoc(stateRef, payload);
}

export async function resetFirestore() {
  await deleteDoc(stateRef);
}
