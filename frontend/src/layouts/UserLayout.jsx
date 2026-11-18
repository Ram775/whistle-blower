
import { Outlet } from "react-router-dom";
import CustomerHeader from "../components/customer/CustomerHeader";

const UserLayout = () => {
 
 
  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden relative">
    
      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* 2nd code wala Header props */}
        <CustomerHeader/>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
         
          <div className="max-w-full mx-auto w-full overflow-hidden">
            <Outlet />
          </div>
        </main>

        
       
      </div>
    </div>
  );
};

export default UserLayout;