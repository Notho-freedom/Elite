import EnhancedProfile from '../Profile/EnhancedProfile';
import DesktopProfile from '../Profile/DesktopProfile';
import useScreenSize from '../../hooks/useScreenSize';

const Profile = () => {
  const screenSize = useScreenSize();
  
  // Utiliser la version desktop pour les écrans larges, mobile pour les petits
  if (screenSize.isDesktop || screenSize.isLargeDesktop || screenSize.isUltraWide) {
    return <DesktopProfile />;
  }
  
  return <EnhancedProfile />;
};

export default Profile;