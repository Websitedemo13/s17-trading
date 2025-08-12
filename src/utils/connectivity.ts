export const checkConnectivity = async (): Promise<boolean> => {
  try {
    // Check if we can reach a reliable endpoint
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    return true;
  } catch {
    // Check if we can at least reach localhost (development)
    try {
      await fetch(window.location.origin, {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return true;
    } catch {
      return false;
    }
  }
};

export const withConnectivityCheck = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  const isConnected = await checkConnectivity();
  
  if (!isConnected) {
    throw new Error('Không có kết nối mạng. Vui lòng kiểm tra và thử lại.');
  }
  
  try {
    return await operation();
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
};
