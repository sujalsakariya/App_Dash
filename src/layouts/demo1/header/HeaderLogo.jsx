import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';
import { useDemo1Layout } from '../';
const HeaderLogo = () => {
  const {
    setMobileSidebarOpen
  } = useDemo1Layout();
  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };
  return <div className="flex gap-1 lg:hidden items-center -ms-1">
    <Link to="/" className="shrink-0">
      <img src={toAbsoluteUrl('/media/app/mini-logo.png')} className="max-h-[25px]" alt="mini-logo" />
    </Link>

    <button type="button" className="btn btn-icon btn-light btn-clear btn-sm" onClick={handleSidebarOpen}>
      <KeenIcon icon="menu" />
    </button>
  </div>;
};
export { HeaderLogo };