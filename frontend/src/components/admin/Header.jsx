import { Menu, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
            <button onClick={toggleSidebar} className="md:hidden text-gray-600 focus:outline-none">
                <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
                <Link to="/admin/profile" className="flex items-center space-x-2 hover:bg-gray-100 p-1 rounded-lg transition">
                    <span className="text-sm font-medium text-gray-700">
                        Welcome, <span className="font-bold">{user?.first_name || 'Admin'}</span>
                    </span>
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserCircle className="w-6 h-6" />
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Header;








// import React, { useState, useContext } from "react";
// import { Facebook, Twitter, AlignJustify } from "lucide-react";
// import { IoAccessibilityOutline } from "react-icons/io5";

// import AccessibilityPanel from "./AccessibilityPanel";
// import { LanguageContext } from "../context/LanguageContext";
// import { text } from "../language/Header";

// const Header = ({ collapsed, setCollapsed }) => {
//   // State for accessibility panel visibility
//   const [accessOpen, setAccessOpen] = useState(false);
//   // Get current language from context
//   const { lang, changeLang } = useContext(LanguageContext);

//   // Check current language for styling active states
//   const isEnglish = lang === "en";
//   const isHindi = lang === "hi";

//   // Toggle language and update HTML lang attribute
//   const toggleLanguage = (newLang) => {
//     changeLang(newLang);
//     document.documentElement.lang = newLang;
//   };

//   // Get translated text based on current language
//   const t = text[lang];

//   return (
//     <>
     
//       <header className="h-12 lg:h-10 bg-[var(--color-primary-dark)] flex items-center justify-between px-3 md:px-6 shadow-md relative z-40 border-b border-white/10">
//         <div className="flex items-center gap-2 md:gap-4">
//           {/* Mobile sidebar toggle button - visible only on small screens */}
//           <button
//             onClick={() => setCollapsed(!collapsed)}
//             className="block lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center shrink-0"
//             title="Toggle Sidebar"
//           >
//             <AlignJustify size={24} />
//           </button>

//           {/* Logo or page title area - hidden on very small screens */}
//           <div className="hidden sm:block">
//             <h1 className="text-white font-semibold text-sm md:text-base truncate max-w-[150px] md:max-w-none">
//               {/* Your logo or title goes here */}
//             </h1>
//           </div>
//         </div>

//         {/* Right section: Language switcher and accessibility button */}
//         <div className="flex items-center gap-2 md:gap-6">
//           {/* Language Switcher - Toggle between English and Hindi */}
//           <div className="flex items-center gap-1 text-[11px] md:text-sm font-medium text-white">
//             <button
//               onClick={() => toggleLanguage("en")}
//               className={`px-2 py-1 rounded transition-all ${isEnglish ? "bg-white text-blue-800 shadow-sm" : "opacity-70 hover:bg-white/10"}`}
//             >
//               EN
//             </button>
//             <span className="opacity-40">|</span>
//             <button
//               onClick={() => toggleLanguage("hi")}
//               className={`px-2 py-1 rounded transition-all ${isHindi ? "bg-white text-blue-800 shadow-sm" : "opacity-70 hover:bg-white/10"}`}
//             >
//               हिन्दी
//             </button>
//           </div>

//           {/* Accessibility icon button to open settings panel */}
//           <div className="pl-2 md:pl-4 border-l border-white/20">
//             <button
//               onClick={() => setAccessOpen(true)}
//               className="p-2 text-white hover:bg-white/10 rounded-full transition-all active:scale-90"
//               aria-label="Accessibility Settings"
//             >
//               <IoAccessibilityOutline size={22} />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Accessibility drawer panel - shown when accessOpen is true */}
//       {accessOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] transition-opacity"
//             onClick={() => setAccessOpen(false)}
//           />
//           <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-[999] shadow-2xl transition-transform duration-300 ease-in-out border-l border-gray-200 overflow-y-auto">
//             <AccessibilityPanel onClose={() => setAccessOpen(false)} />
//           </div>
//         </>
//       )}
//     </>
//   );
// };

// export default Header;