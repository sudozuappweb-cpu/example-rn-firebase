import { browserLocalPersistence, type Persistence } from 'firebase/auth';

export const authPersistence: Persistence = browserLocalPersistence;
