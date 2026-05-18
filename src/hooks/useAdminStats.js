import { useCallback, useEffect, useState } from 'react';
import { getBusinessesForAdmin } from '../services/business/business.admin.service';
import { getAllProfiles, getMyProfile } from '../services/user/profile.service';
import { getAllUsers } from '../services/user/user.service';

const BIZ_PALETTE = ['#1F3D2B', '#3A6647', '#5B8A66', '#C76E4A', '#8B6420'];

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
}

function getTimePoints(period) {
  const now = new Date();
  const points = [];

  if (period === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(23, 59, 59, 999);
      points.push(d);
    }
  } else if (period === '30d') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(23, 59, 59, 999);
      points.push(d);
    }
  } else if (period === '90d') {
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      d.setHours(23, 59, 59, 999);
      points.push(d);
    }
  } else {
    // '1a' → 12 monthly points
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      points.push(d);
    }
  }

  return points;
}

/**
 * Builds a cumulative count series from items with a `createdAt` field.
 * Items can be filtered with an optional predicate.
 */
export function buildCumulativeSeries(items, period, filterFn) {
  const filtered = filterFn ? items.filter(filterFn) : items;
  if (!filtered.length) return [];

  const points = getTimePoints(period);
  return points.map(
    cutoff => filtered.filter(item => item.createdAt && new Date(item.createdAt) <= cutoff).length
  );
}

export function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [users, allBizRes, pendingBizRes, profile, profilesRes] = await Promise.all([
        getAllUsers(),
        getBusinessesForAdmin({ page: 1, limit: 500 }),
        getBusinessesForAdmin({ status: 'Pending', page: 1, limit: 50 }),
        getMyProfile(),
        // GET /perfil devuelve createdAt real por usuario — GET /user no lo incluye
        getAllProfiles({ page: 1, limit: 1000 }),
      ]);

      // /perfil devuelve { data: [...], total, page, limit, totalPages }
      const allProfiles = Array.isArray(profilesRes) ? profilesRes : (profilesRes?.data ?? []);

      const allBizList = Array.isArray(allBizRes) ? allBizRes : (allBizRes?.data ?? []);
      const pendingList = Array.isArray(pendingBizRes)
        ? pendingBizRes
        : (pendingBizRes?.data ?? []);
      const totalBiz = Array.isArray(allBizRes)
        ? allBizRes.length
        : (allBizRes?.total ?? allBizList.length);
      const pendingCount = Array.isArray(pendingBizRes)
        ? pendingBizRes.length
        : (pendingBizRes?.total ?? pendingList.length);

      // Category breakdown
      const catMap = {};
      allBizList.forEach(b => {
        const cat = b.category?.category || 'Sin categoría';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const bizByCategory = Object.entries(catMap)
        .map(([label, count], i) => ({
          label,
          count,
          color: BIZ_PALETTE[i % BIZ_PALETTE.length],
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Pending moderation queue
      const pendingQueue = pendingList.slice(0, 5).map(b => ({
        id: b.id_business,
        name: b.businessName,
        category: b.category?.category || '',
        when: formatRelativeTime(b.createdAt),
        initials: b.businessName
          .split(' ')
          .slice(0, 2)
          .map(w => w[0])
          .join('')
          .toUpperCase(),
        color: BIZ_PALETTE[b.id_business % BIZ_PALETTE.length],
      }));

      // ── Activity feed: merge user registrations + approved + pending businesses
      const activityItems = [];

      // New user registrations
      users.forEach(u => {
        if (!u.createdAt) return;
        activityItems.push({
          id: `u-${u.id_usuario}`,
          type: 'user-register',
          text: u.perfil?.nombre || u.email,
          meta: u.rol?.nombre || 'Usuario',
          sortDate: new Date(u.createdAt),
          time: formatRelativeTime(u.createdAt),
        });
      });

      // Approved businesses
      allBizList
        .filter(b => b.status === 'Active')
        .forEach(b => {
          activityItems.push({
            id: `ba-${b.id_business}`,
            type: 'biz-approved',
            text: b.businessName,
            meta: b.category?.category || '',
            sortDate: new Date(b.createdAt),
            time: formatRelativeTime(b.createdAt),
          });
        });

      // Pending businesses submitted
      pendingList.forEach(b => {
        activityItems.push({
          id: `bp-${b.id_business}`,
          type: 'biz-pending',
          text: b.businessName,
          meta: b.category?.category || '',
          sortDate: new Date(b.createdAt),
          time: formatRelativeTime(b.createdAt),
        });
      });

      // Sort by most recent and take top 7
      activityItems.sort((a, b) => b.sortDate - a.sortDate);
      const activity = activityItems.slice(0, 7);

      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive).length;

      setStats({
        totalUsers,
        activeUsers,
        activePct: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
        totalBiz,
        totalBizActive: allBizList.filter(b => b.status === 'Active').length,
        pendingCount,
        bizByCategory,
        pendingQueue,
        activity,
        adminName: profile?.nombre?.split(' ')[0] || 'Administrador',
        allUsers: users,
        allProfiles,
        allBizList,
      });
    } catch {
      // stats remains null, components handle empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, reload: load };
}
