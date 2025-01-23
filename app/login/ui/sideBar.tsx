import { BookOpen, Book, Library, User, ArrowLeft } from "lucide-react";

const MySideBar = () => {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-blue-900 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">📚 BANK-MEMO</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {["Dashboard", "My Books", "Collections", "Profile"].map((item, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center px-4 py-2 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
            >
              {index === 0 && <BookOpen className="mr-3" />}
              {index === 1 && <Book className="mr-3" />}
              {index === 2 && <Library className="mr-3" />}
              {index === 3 && <User className="mr-3" />}
              {item}
            </a>
          ))}
        </nav>

        <div className="p-4">
          <a
            href="/"
            className="flex items-center text-gray-300 hover:text-white"
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
