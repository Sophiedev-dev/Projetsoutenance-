import { BookOpen, Book, Library, User, ArrowLeft } from "lucide-react";

const MySideBar = () => {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-blue-900 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">📚 BANK-MEMO</h1>
        </div>

               <nav className="flex-1 px-4 space-y-2">
                 {[
                   { name: "Dashboard", path: "./login", icon: <BookOpen className="mr-3" /> },
                   { name: "My Books", path: "./mybook", icon: <Book className="mr-3" /> },
                   { name: "Collections", path: "/collections", icon: <Library className="mr-3" /> },
                   { name: "Profile", path: "./profile", icon: <User className="mr-3" /> }
                 ].map((item, index) => (
                   <a
                     key={index}
                     href={item.path}
                     className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
                   >
                     {item.icon}
                     {item.name}
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
