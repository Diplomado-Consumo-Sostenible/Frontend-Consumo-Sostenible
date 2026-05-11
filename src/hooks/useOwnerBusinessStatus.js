import { useEffect, useState } from 'react';
import { getMyBusinesses } from '../services/business/busienss.service';
import { decodeToken } from '../utils/jwt.utils';
import { getToken } from '../utils/storage';

export default function useOwnerBusinessStatus() {
  const token   = getToken();
  const decoded = decodeToken(token);
  const isOwner = decoded?.rol?.toLowerCase() === 'owner';

  const [status, setStatus]               = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [loading, setLoading]             = useState(isOwner);

  useEffect(() => {
    if (!isOwner) { setLoading(false); return; }
    getMyBusinesses()
      .then((data) => {
        const biz = Array.isArray(data) ? data[0] : null;
        if (biz) {
          setStatus(biz.status ?? null);
          setRejectionReason(biz.rejectionReason ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOwner]);

  return {
    status,
    rejectionReason,
    loading,
    isRejected: status === 'Rejected',
    isPending:  status === 'Pending',
    isActive:   status === 'Active',
  };
}
