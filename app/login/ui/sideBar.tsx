import { BookOpen, Book, Library, User, ArrowLeft } from "lucide-react";

const MySideBar = () => {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-purple-900 shadow-xl">
      <div className="flex flex-col h-full">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-white">📚 BANK-MEMO</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { name: "Dashboard", path: "./login", icon: <BookOpen className="mr-3" /> },
            { name: "Profile", path: "./profile", icon: <User className="mr-3" /> }
          ].map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </nav>

        <div className="p-6">
          <a
            href="/"
            className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default MySideBar;