import {getFirestore} from 'firebase/firestore';

import { FirebaseApp } from 'firebase/app';
import app from './firebaseConfig';


const db = getFirestore(app);

export default db;

