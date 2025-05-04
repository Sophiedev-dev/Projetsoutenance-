// import React from 'react';
// import { ChevronLeft, ChevronRight, Search, ShoppingCart, User, Truck, CreditCard, Tag, Shield } from 'lucide-react';

// const books = [
//   {
//     id: 1,
//     title: "The Crown",
//     author: "Kiera Cass",
//     price: 15.99,
//     image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='100%' height='100%' fill='%23784584'/></svg>"
//   },
//   {
//     id: 2,
//     title: "Trials of Apollo",
//     author: "Rick Riordan",
//     price: 14.99,
//     image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='100%' height='100%' fill='%23d4a017'/></svg>"
//   },
//   {
//     id: 3,
//     title: "Big Magic",
//     author: "Elizabeth Gilbert",
//     price: 12.99,
//     image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='100%' height='100%' fill='%23ff69b4'/></svg>"
//   },
//   {
//     id: 4,
//     title: "Frost Arch",
//     author: "Kate Bloomfield",
//     price: 9.99,
//     image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='100%' height='100%' fill='%23333333'/></svg>"
//   },
//   {
//     id: 5,
//     title: "Lonely City",
//     author: "Sample Author",
//     price: 19.99,
//     image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='100%' height='100%' fill='%234a4a4a'/></svg>"
//   },
//   {
//     id: 6,
//     title: "The Martial",
//     author: "Andy Weir",
//     price: 22.99,
//     image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'><rect width='100%' height='100%' fill='%23ff6b35'/></svg>"
//   },
// ];

// const homepage = () => {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex items-center justify-between py-4">
//             <div className="text-2xl font-bold text-gray-800">📚 BOOKSHOP</div>
            
//             {/* Search Bar */}
//             <div className="flex-1 max-w-xl mx-8">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search over 30 million book titles"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <ShoppingCart className="text-gray-600" size={24} />
//               <User className="text-gray-600" size={24} />
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex space-x-8 py-4">
//             {['Home', 'Books', 'Magazines', 'Textbooks', 'Audiobooks', 'Recommended', 'Sale'].map((item) => (
//               <a key={item} href="#" className="text-gray-600 hover:text-blue-500">
//                 {item}
//               </a>
//             ))}
//           </nav>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-gray-100 to-gray-200">
//         <div className="max-w-7xl mx-auto px-4 py-12">
//           <div className="flex items-center justify-between">
//             <div className="flex-1 pr-8">
//               <h2 className="text-4xl font-bold mb-4">
//                 BACK TO SCHOOL
//                 <br />
//                 <span className="text-gray-800">SPECIAL </span>
//                 <span className="text-blue-500">50% OFF</span>
//               </h2>
//               <p className="text-lg text-gray-600 mb-6">FOR OUR STUDENT COMMUNITY</p>
//               <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
//                 GET THE DEAL
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Features */}
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-4 gap-8">
//           <div className="flex items-center space-x-4">
//             <Truck className="text-blue-500" size={24} />
//             <div>
//               <h3 className="font-semibold">Quick Delivery</h3>
//               <p className="text-sm text-gray-500">Fast and reliable shipping</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <CreditCard className="text-blue-500" size={24} />
//             <div>
//               <h3 className="font-semibold">Pay with Easy</h3>
//               <p className="text-sm text-gray-500">Secure payment options</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <Tag className="text-blue-500" size={24} />
//             <div>
//               <h3 className="font-semibold">Best Deal</h3>
//               <p className="text-sm text-gray-500">Competitive prices</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <Shield className="text-blue-500" size={24} />
//             <div>
//               <h3 className="font-semibold">Secured Payment</h3>
//               <p className="text-sm text-gray-500">Safe transactions</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bestsellers */}
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold">Current Bestsellers</h2>
//           <a href="#" className="text-blue-500 hover:underline">View All</a>
//         </div>

//         <div className="relative">
//           <div className="flex space-x-6 overflow-x-auto pb-4">
//             {books.map((book) => (
//               <div key={book.id} className="flex-none w-48">
//                 <img
//                   src={book.image}
//                   alt={book.title}
//                   className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
//                 />
//                 <h3 className="font-semibold">{book.title}</h3>
//                 <p className="text-sm text-gray-500">{book.author}</p>
//                 <p className="text-blue-500 font-semibold mt-2">${book.price.toFixed(2)}</p>
//               </div>
//             ))}
//           </div>
//           <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
//             <ChevronLeft size={24} />
//           </button>
//           <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md">
//             <ChevronRight size={24} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default homepage;