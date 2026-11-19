import { jwtDecode } from "jwt-decode";

export const getUserInfo = () => {
  const token = localStorage.getItem("token");
  if (!token) return { username: "System", id: null, role: null };

  try {
    const decoded = jwtDecode(token);

    // 1. .NET APIs ke liye ID nikalna
    const id = 
      decoded.nameid || 
      decoded.sub || 
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
      null;

    // 2. Username nikalna
    const username = 
      decoded.unique_name || 
      decoded.name || 
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 
      "System";

    // 3. Role nikalna (Standard JWT aur .NET Claims dono handle kiye hain)
    const role = 
      decoded.role || 
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
      null;

    return { id, username, role, ...decoded }; // Baaki claims bhi return kar diye
  } catch (error) {
    console.error("Invalid token:", error);
    return { username: "System", id: null, role: null };
  }
};


export const getUsernameFromToken = () => getUserInfo().username;
export const getUserIdFromToken = () => getUserInfo().id;
export const getRoleFromToken = () => getUserInfo().role;

// ========== NEW FUNCTIONS ADDED ==========

// Token validity check karo
export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < currentTime) {
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

let cachedSecurityStatus = null;
let cachedToken = null;

export const getCachedSecurityStatus = () => {
  const currentToken = localStorage.getItem("token");
  if (cachedToken && cachedToken === currentToken) {
    return cachedSecurityStatus;
  }
  cachedSecurityStatus = null;
  cachedToken = currentToken;
  return null;
};

export const setCachedSecurityStatus = (status) => {
  cachedSecurityStatus = status;
  cachedToken = localStorage.getItem("token");
};

export const clearCachedSecurityStatus = () => {
  cachedSecurityStatus = null;
  cachedToken = null;
};

// Clear all auth data from storage
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("pending_user");
  clearCachedSecurityStatus();
};

// Get token expiry time
export const getTokenExpiry = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    console.error("Error getting token expiry:", error);
    return null;
  }
};

// Check if token is about to expire (within next 5 minutes)
export const isTokenExpiringSoon = (minutes = 5) => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    const minutesUntilExpiry = timeUntilExpiry / 60;
    
    return minutesUntilExpiry <= minutes;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return false;
  }
};

// Get specific claim from token
export const getClaimFromToken = (claimName) => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded[claimName] || null;
  } catch (error) {
    console.error(`Error getting claim ${claimName}:`, error);
    return null;
  }
};

// Check if user has specific role
export const hasRole = (roleName) => {
  const userRole = getRoleFromToken();
  return userRole === roleName;
};

// Check if user has any of the given roles
export const hasAnyRole = (roleNames) => {
  const userRole = getRoleFromToken();
  return roleNames.includes(userRole);
};

// Get token info for debugging
export const getTokenInfo = () => {
  const token = localStorage.getItem("token");
  if (!token) return { exists: false, valid: false };
  
  const isValid = isTokenValid();
  const expiry = getTokenExpiry();
  const role = getRoleFromToken();
  const username = getUsernameFromToken();
  
  return {
    exists: true,
    valid: isValid,
    expired: !isValid,
    expiry: expiry,
    role: role,
    username: username,
    tokenPreview: token.substring(0, 20) + "..."
  };
};