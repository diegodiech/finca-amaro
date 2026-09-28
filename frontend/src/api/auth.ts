const CLAVE_TOKEN = 'finca-amaro-token';

export const getToken = () => localStorage.getItem(CLAVE_TOKEN);
export const setToken = (token: string) => localStorage.setItem(CLAVE_TOKEN, token);
export const clearToken = () => localStorage.removeItem(CLAVE_TOKEN);
