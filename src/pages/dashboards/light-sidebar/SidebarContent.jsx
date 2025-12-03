import { ChannelStats } from './blocks';

const Demo1LightSidebarContent = ({ dateRange, loading, onLoadingChange, selectedCompany, setSelectedCompany }) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="grid lg:grid-cols-1 gap-y-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-1">
          <div className="grid-cols-1 sm:grid-cols md:grid-cols-2 lg:grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
            <ChannelStats 
              dateRange={dateRange} 
              loading={loading}
              onLoadingChange={onLoadingChange}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Demo1LightSidebarContent };