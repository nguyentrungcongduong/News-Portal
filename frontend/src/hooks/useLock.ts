import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LockAcquireParams {
  lockable_type: string;
  lockable_id: number;
}

export const useLock = (params: LockAcquireParams) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockError, setLockError] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    const acquireLock = async () => {
      try {
        const response = await axios.post('/api/content-locks/acquire', params);
        if (response.data.acquired) {
          setIsLocked(true);
          setLockError(null);
        } else {
          setIsLocked(false);
          setLockError(response.data.message);
        }
      } catch (error: any) {
        setLockError(error.response?.data?.message || 'Lỗi khóa nội dung');
      }
    };

    acquireLock();

    // Renew lock every 5 minutes
    const renewInterval = setInterval(async () => {
      if (isLocked) {
        setIsRenewing(true);
        try {
          await axios.post('/api/content-locks/renew', params);
        } catch (error) {
          console.error('Lock renewal failed:', error);
        } finally {
          setIsRenewing(false);
        }
      }
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(renewInterval);
      // Release lock on unmount
      if (isLocked) {
        axios.post('/api/content-locks/release', params).catch(console.error);
      }
    };
  }, [params]);

  return { isLocked, lockError, isRenewing };
};

export const useReleaseLock = (params: LockAcquireParams) => {
  const releaseLock = async () => {
    try {
      await axios.post('/api/content-locks/release', params);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return { releaseLock };
};
