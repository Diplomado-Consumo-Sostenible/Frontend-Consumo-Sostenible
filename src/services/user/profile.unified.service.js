import { decodeToken } from '../../utils/jwt.utils';
import { getToken } from '../../utils/storage';
import { getMyProfile } from './profile.service';
import { getAllUsers } from './user.service';

export const getFullUserProfile = async () => {
  const decoded = decodeToken(getToken());
  const isAdmin = decoded?.rol?.toLowerCase() === 'admin';

  if (isAdmin) {
    const [usersResult, profileResult] = await Promise.allSettled([
      getAllUsers(),
      getMyProfile(),
    ]);

    if (profileResult.status === 'rejected') throw profileResult.reason;

    const profileData = profileResult.value;
    let userData = {};

    if (usersResult.status === 'fulfilled') {
      const raw = usersResult.value;
      if (Array.isArray(raw)) {
        userData = raw.find((u) => u.email === decoded?.email) ?? raw[0] ?? {};
      } else {
        userData = raw ?? {};
      }
    } else {
      userData = {
        email: decoded?.email,
        rol: decoded?.rol,
        createdAt:
          profileData?.usuario?.createdAt ??
          profileData?.user?.createdAt ??
          profileData?.createdAt ??
          null,
      };
    }

    return { ...userData, ...profileData, _user: userData, _profile: profileData };
  }

  const profileData = await getMyProfile();
  const userData = {
    email: decoded?.email,
    rol: decoded?.rol,
    createdAt:
      profileData?.usuario?.createdAt ??
      profileData?.user?.createdAt ??
      profileData?.createdAt ??
      null,
  };

  return { ...userData, ...profileData, _user: userData, _profile: profileData };
};
