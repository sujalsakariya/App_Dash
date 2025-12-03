import { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { toAbsoluteUrl } from '@/utils';
import { useSettings } from '@/providers/SettingsProvider';
import { KeenIcon } from '@/components';
import axios from 'axios';
import CookieUtils from '@/utils/CookieUtils'; 
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuIcon
} from '@/components/menu';

const DropdownUser = () => {
  const { settings, storeSettings } = useSettings();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleThemeMode = (event) => {
    const newThemeMode = event.target.checked ? 'dark' : 'light';
    storeSettings({ themeMode: newThemeMode });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    
    delete axios.defaults.headers.common['Authorization'];
    
    navigate('/auth/login', { replace: true });
  };

  const buildHeader = () => {
    return (
      <div className="flex items-center justify-between px-5 py-1.5 gap-1.5">
        <div className="flex items-center gap-2">
          <img
            className="size-9 rounded-full border-2 border-success"
            src={toAbsoluteUrl('/media/avatars/300-2.png')}
            alt=""
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-gray-800 hover:text-primary font-semibold leading-none">
              {userName}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          <MenuItem>
            <MenuLink path="/auth/reset-password">
              <MenuIcon className="menu-icon">
                <KeenIcon icon="lock" />
              </MenuIcon>
              <MenuTitle>
                <p>Reset Password</p>
              </MenuTitle>
            </MenuLink>
          </MenuItem>
          <MenuSeparator />
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        <div className="menu-item mb-0.5">
          <div className="menu-link">
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title">
              <FormattedMessage id="USER.MENU.DARK_MODE" />
            </span>
            <label className="switch switch-sm">
              <input
                name="theme"
                type="checkbox"
                checked={settings.themeMode === 'dark'}
                onChange={handleThemeMode}
                value="1"
              />
            </label>
          </div>
        </div>

        <div className="menu-item px-4 py-1.5">
          <Link to='/auth/login'
            onClick={handleLogout}
            className="btn btn-sm btn-light justify-center w-full"
          >
            Logout
          </Link>
        </div>
      </div>
    );
  };

  return (
    <MenuSub className="menu-default light:border-gray-300 w-[200px] md:w-[250px]" rootClassName="p-0">
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };