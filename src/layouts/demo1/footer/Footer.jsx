import { Link } from 'react-router-dom';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="footer">
    <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5 pr-20 pl-20">
      <div className="flex order-2 md:order-1  gap-2 font-normal text-2sm">
        <span className="text-gray-500">{currentYear} &copy;</span>
        <Link to="/" className="text-gray-600 hover:text-primary ">
          LeadDesk Inc.
        </Link>
      </div>
      <div></div>
      {/* <div className="flex w-100 gap-3 font-bold text-2sm">
        <Link to="/Leads" className="text-gray-600 hover:text-primary">
          LMLeads
        </Link>
        <Link to="/AllLeads" className="text-gray-600 hover:text-primary">
          Leads
        </Link>
        <Link to="/Dispositions" className="text-gray-600 hover:text-primary">
          Dispositions
        </Link>
        <Link to="/Sales" className="text-gray-600 hover:text-primary">
          Sales
        </Link>
      </div> */}
    </div>
  </footer>;
};
export { Footer };