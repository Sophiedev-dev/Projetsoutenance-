// import { useState } from "react";

// const AddMemoForm = ()=>{
//     const [newMemoire, setNewMemoire] = useState({
//         libelle: "",
//         annee: "",
//         cycle: "",
//         specialite: "",
//         universite: "",
//         nom_fichier: null
//       });
//       const [memoires, setMemoires] = useState([
//         {
//           id: 1,
//           libelle: "Machine Learning Applications",
//           annee: "2024-01-15",
//           cycle: "Master",
//           specialite: "Computer Science",
//           universite: "MIT",
//           nom_fichier: "ml_thesis.pdf"
//         },
//         {
//           id: 2,
//           libelle: "Renewable Energy Systems",
//           annee: "2023-12-01",
//           cycle: "PhD",
//           specialite: "Engineering",
//           universite: "Stanford",
//           nom_fichier: "energy_thesis.pdf"
//         }
//       ]);
//     const handleChange = (e) => {
//         const { name, value, files } = e.target;
//         setNewMemoire((prev) => ({
//           ...prev,
//           [name]: files ? files[0].name : value
//         }));
//       };
    
//       const handleSubmit = (e) => {
//         e.preventDefault();
//         setMemoires((prev) => [...prev, { ...newMemoire, id: prev.length + 1 }]);
//         setShowForm(false);
//       };
//     return ( <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h3 className="text-xl font-semibold mb-4">Add New Book</h3>
//         <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
//           {["libelle", "annee", "specialite", "universite"].map((field) => (
//             <div key={field}>
//               <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
//                 {field}
//               </label>
//               <input
//                 type={field === "annee" ? "date" : "text"}
//                 name={field}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           ))}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
//             <select
//               name="cycle"
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option>Bachelor</option>
//               <option>Master</option>
//               <option>PhD</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
//             <input
//               type="file"
//               name="nom_fichier"
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div className="col-span-2 flex justify-end space-x-2">
//             <button
//               type="button"
//               onClick={() => setShowForm(false)}
//               className="px-4 py-2 text-gray-600 hover:text-gray-800"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Save Book
//             </button>
//           </div>
//         </form>
//       </div>);
// }