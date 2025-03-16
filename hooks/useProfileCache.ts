import { useStorageState } from '@/hooks/useStorageState';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/profileType';

export default function useSecureProfileCache() {
  const [profileState, setProfileState] = useStorageState('user-profile');
  const [timestampState, setTimestampState] = useStorageState('profile-timestamp');
  const [isLoading, profileData] = profileState;
  const [isTimestampLoading, timestamp] = timestampState;
  const [cacheStatus, setCacheStatus] = useState('loading');
  const [cacheInfo, setCacheInfo] = useState('');
  
  // Cache expiration time (15 minutes)
  const CACHE_EXPIRY = 15 * 60 * 1000;
  
  // Check if cache is expired
  const isCacheExpired = () => {
    if (!timestamp) return true;
    
    const now = Date.now();
    return now - parseInt(timestamp) > CACHE_EXPIRY;
  };
  
  // Save profile to secure storage
  const saveProfileToCache = async (data: UserProfile) => {
    try {
      setProfileState(JSON.stringify(data));
      setTimestampState(Date.now().toString());
      setCacheStatus('fresh');
      setCacheInfo('Data saved to secure cache');
    } catch (error) {
      console.error('Error saving profile to secure cache:', error);
      setCacheStatus('error');
    }
  };
  
  // Load profile from secure storage
  const loadProfileFromCache = async () => {
    // Loading will be handled by useStorageState automatically
    if (isLoading || isTimestampLoading) {
      setCacheStatus('loading');
      setCacheInfo('Loading from secure storage...');
      return null;
    }
    
    if (!profileData) {
      setCacheStatus('empty');
      setCacheInfo('No cached profile data');
      return null;
    }
    
    try {
      const parsedData = JSON.parse(profileData);
      
      if (isCacheExpired()) {
        setCacheStatus('expired');
        setCacheInfo('Cached data expired');
      } else {
        setCacheStatus('valid');
        const cacheAge = Math.round((Date.now() - parseInt(timestamp || '0')) / 60000);
        setCacheInfo(`Using secure cached data (${cacheAge} min old)`);
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error parsing secure profile data:', error);
      setCacheStatus('error');
      setCacheInfo('Error reading secure cache');
      return null;
    }
  };
  
  // Clear cache
  const clearCache = async () => {
    setProfileState(null);
    setTimestampState(null);
    setCacheStatus('empty');
    setCacheInfo('Secure cache cleared');
  };
  
  return {
    profileData: isLoading ? null : (profileData ? JSON.parse(profileData) : null),
    isLoading,
    cacheStatus,
    cacheInfo,
    saveProfileToCache,
    loadProfileFromCache,
    isCacheExpired,
    clearCache
  };
}