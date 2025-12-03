import { Link, Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { Card, CardContent } from '@/components/ui/card';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';
const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses('dark:bg-coal-500');
  return <Fragment>
      <style>
        {`
          .page-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-10-dark.png')}');
          }
          .dark .page-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1200/bg-10-dark.png')}');
          }
        `}
      </style>

      <div className="flex flex-col items-center justify-center grow bg-center bg-no-repeat page-bg">
        <Card className="w-3/4 max-w-[400px] backColor">
          <CardContent className="p-9">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </Fragment>;
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>;
export { AuthBrandedLayout };