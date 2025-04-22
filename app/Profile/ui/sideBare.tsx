import { BookOpen, User, ArrowLeft, Menu } from "lucide-react";
import { useState } from "react";
import Link from 'next/link';

const MySideBar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-900 p-2 rounded-lg"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      <div className={`
        fixed inset-y-0 left-0 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        transition-transform duration-300 ease-in-out
        w-64 bg-gradient-to-b from-blue-900 to-purple-900 shadow-xl
        z-40
        ${isOpen ? 'block' : 'hidden md:block'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-white">📚 BANK-MEMO</h1>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {[
              { name: "Dashboard", path: "/login", icon: <BookOpen className="mr-3" /> },
              { name: "Profile", path: "/Profile", icon: <User className="mr-3" /> }
            ].map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-6">
            <Link
              href="/"
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default MySideBar;