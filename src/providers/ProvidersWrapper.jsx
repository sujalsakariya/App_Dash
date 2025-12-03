import { QueryClient, QueryClientProvider } from 'react-query';
import { LayoutProvider, LoadersProvider, MenusProvider, SettingsProvider, TranslationProvider } from '@/providers';
import { HelmetProvider } from 'react-helmet-async';
const queryClient = new QueryClient();
const ProvidersWrapper = ({
  children
}) => {
  return <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <TranslationProvider>
            <HelmetProvider>
              <LayoutProvider>
                <LoadersProvider>
                  <MenusProvider>{children}</MenusProvider>
                </LoadersProvider>
              </LayoutProvider>
            </HelmetProvider>
          </TranslationProvider>
        </SettingsProvider>
    </QueryClientProvider>;
};
export { ProvidersWrapper };