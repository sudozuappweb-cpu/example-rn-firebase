import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, type Persistence } from 'firebase/auth';

export const authPersistence: Persistence = getReactNativePersistence(AsyncStorage);
