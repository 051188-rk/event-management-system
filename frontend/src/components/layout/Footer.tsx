import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
              About
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">
              Privacy
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">
              Terms
            </Link>
          </div>
        </nav>
        <p className="mt-4 text-center text-base text-gray-500">
          &copy; {currentYear} EventManager. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
