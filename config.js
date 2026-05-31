// Replace '192.168.1.X' with the IPv4 address you got from running 'ipconfig'
// Make sure to keep the port (e.g., :1337) that your backend server runs on
export const API_URL = 'http://192.168.254.100:1337';

export let currentUser = null;
export const setCurrentUser = (user) => { currentUser = user; };