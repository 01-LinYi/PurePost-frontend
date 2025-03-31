import { Alert } from 'react-native';

type OptimisticUpdateConfig<T> = {
  updateUI: () => void;
  apiCall: () => Promise<T>;
  rollbackUI: () => void;
  successMessage?: string;
  errorMessagePrefix?: string;
};

export const performOptimisticUpdate = async <T,>({
  updateUI,
  apiCall,
  rollbackUI,
  successMessage,
  errorMessagePrefix = 'Operation failed: '
}: OptimisticUpdateConfig<T>): Promise<T | null> => {
  updateUI();
  
  try {
    const result = await apiCall();
    
    if (successMessage) {
      Alert.alert('Success', successMessage);
    }
    
    return result;
  } catch (error) {
    rollbackUI();
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Alert.alert('Error', `${errorMessagePrefix}${errorMessage}`);
    
    return null;
  }
};