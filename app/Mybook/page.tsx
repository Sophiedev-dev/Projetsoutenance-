'use client';


import React, { useState } from 'react';
import { ArrowLeft, Book, BookOpen, Library, User, Search, Edit, Trash2, MessageSquare, Palette, Eye, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';


const MyBooks = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "Machine Learning Applications",
      author: "John Doe",
      preview: "Lorem ipsum dolor sit amet...",
      notes: [],
      annotations: [],
      theme: {
        color: "blue",
        font: "serif"
      }
    },
    {
      id: 2,
      title: "Renewable Energy Systems",
      author: "Jane Smith",
      preview: "Consectetur adipiscing elit...",
      notes: [],
      annotations: [],
      theme: {
        color: "green",
        font: "sans"
      }
    }
  ]);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [themeSettings, setThemeSettings] = useState({ show: false, bookId: null });

  const addNote = (bookId) => {
    if (newNote.trim()) {
      setBooks(books.map(book => {
        if (book.id === bookId) {
          return {
            ...book,
            notes: [...book.notes, { id: Date.now(), content: newNote }]
          };
        }
        return book;
      }));
      setNewNote("");
      setShowNoteForm(false);
    }
  };

  const updateTheme = (bookId, theme) => {
    setBooks(books.map(book => {
      if (book.id === bookId) {
        return { ...book, theme };
      }
      return book;
    }));
    setThemeSettings({ show: false, bookId: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Same as Dashboard */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">📚 BANK-MEMO</h1>
          </div>

          <Link href="./Profile">
            Profile
          </Link>

          <nav className="flex-1 px-4 space-y-2">
                      {[
                        { name: "Dashboard", path: "./login", icon: <BookOpen className="mr-3" /> },
                        { name: "My Books", path: "./Mybook", icon: <Book className="mr-3" /> },
                        { name: "Collections", path: "/collections", icon: <Library className="mr-3" /> },
                        { name: "Profile", path: "./Profile", icon: <User className="mr-3" /> }
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
            <a href="/" className="flex items-center text-gray-600 hover:text-blue-600">
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Books</h2>
            <p className="text-gray-600">Manage and organize your books</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-4 py-2 rounded-lg ${activeTab === "grid" ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-lg ${activeTab === "list" ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search books..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Books Grid/List View */}
        <div className={`grid ${activeTab === "grid" ? 'grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {books.map(book => (
            <motion.div
              key={book.id}
              layout
              className={`bg-white rounded-lg shadow-md p-6 ${
                book.theme.color === "blue" ? "border-blue-500" :
                book.theme.color === "green" ? "border-green-500" : ""
              } border-t-4`}
              style={{
                fontFamily: book.theme.font === "serif" ? "serif" : "sans-serif"
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{book.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => setThemeSettings({ show: true, bookId: book.id })}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <Palette size={20} />
                  </button>
                  <button
                    onClick={() => setShowNoteForm(book.id)}
                    className="p-2 text-gray-500 hover:text-blue-600"
                  >
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{book.preview}</p>

              {/* Notes Section */}
              {book.notes.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  <ul className="space-y-2">
                    {book.notes.map(note => (
                      <li key={note.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {note.content}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Note Form */}
              {showNoteForm === book.id && (
                <div className="mt-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Add a note..."
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setShowNoteForm(false)}
                      className="px-3 py-1 text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => addNote(book.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}

              {/* Theme Settings */}
              {themeSettings.show && themeSettings.bookId === book.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Theme Settings</h4>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      {["blue", "green", "purple"].map(color => (
                        <button
                          key={color}
                          onClick={() => updateTheme(book.id, { ...book.theme, color })}
                          className={`w-6 h-6 rounded-full bg-${color}-500`}
                        />
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateTheme(book.id, { ...book.theme, font: "serif" })}
                        className="px-3 py-1 border rounded"
                      >
                        Serif
                      </button>
                      <button
                        onClick={() => updateTheme(book.id, { ...book.theme, font: "sans" })}
                        className="px-3 py-1 border rounded"
                      >
                        Sans
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Book Preview Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="prose max-w-none">
              {selectedBook.preview}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooks;