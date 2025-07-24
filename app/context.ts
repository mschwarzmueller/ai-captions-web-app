import { unstable_createContext } from 'react-router';

export const userContext = unstable_createContext<{ uid: string } | null>(null);
