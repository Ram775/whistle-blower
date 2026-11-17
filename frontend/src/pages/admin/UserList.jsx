import { useState, useEffect, useMemo } from "react";
import { UserPlus, Edit, Trash2, Loader2, UserX } from "lucide-react";
import { userService } from "../../services/userService";
import toast from "react-hot-toast";
import { Tooltip, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// UI Components (Same as MasterData)
import ListTable from "../../components/ui/ListTable";
import ListHeader from "../../components/ui/ListHeader";
import ListRow from "../../components/ui/ListRow";
import ListPagination from "../../components/ui/ListPagination";
import TableFilters from "../../components/ui/TableFilters";
import TextHighlighter from "../../components/ui/TextHighlighter";

const { confirm } = Modal;

const UserList = () => {
  // Data State
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "", middle_name: "", last_name: "",
    email_id: "", mobile_no: "", password: "", status: "1"
  });

  // Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      if (response.status) {
        setApiData(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Modal Handlers
  const handleOpenModal = async (id = null) => {
    if (id) {
      setEditId(id);
      try {
        setLoading(true);
        const res = await userService.getUserById(id);
        if (res.data) {
          setFormData({
            first_name: res.data.first_name || "",
            middle_name: res.data.middle_name || "",
            last_name: res.data.last_name || "",
            email_id: res.data.email_id || "",
            mobile_no: res.data.mobile_no || "",
            password: "",
            status: String(res.data.status)
          });
        }
      } catch (error) {
        toast.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    } else {
      setEditId(null);
      setFormData({
        first_name: "", middle_name: "", last_name: "",
        email_id: "", mobile_no: "", password: "", status: "1"
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Empty password na bheje
        await userService.updateUser(editId, payload);
        toast.success("User updated successfully!");
      } else {
        await userService.createUser(formData);
        toast.success("User created successfully!");
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  // Status Toggle
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = String(currentStatus) === "1" ? "0" : "1";
    try {
      const response = await userService.changeUserStatus(id, newStatus);
      if (response.status) {
        toast.success("User status updated!");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Delete / Deactivate Handler
  const handleDeleteClick = (id) => {
    confirm({
      title: "Deactivate User?",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to deactivate this user? They won't be able to login.",
      okText: "Yes, Deactivate",
      okType: "danger",
      async onOk() {
        try {
          setLoading(true);
          await userService.changeUserStatus(id, "0");
          toast.success("User deactivated successfully!");
          fetchUsers();
        } catch (error) {
          toast.error("Operation failed");
          setLoading(false);
        }
      },
    });
  };

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    const term = debouncedSearch?.toLowerCase().trim();
    let result = apiData || [];

    if (term) {
      result = result.filter(
        (item) =>
          `${item.full_name} ${item.email_id} ${item.mobile_no}`
            .toLowerCase()
            .includes(term)
      );
    }

    if (selectedFilter) {
      if (selectedFilter === "Active") result = result.filter((item) => String(item.status) === "1");
      else if (selectedFilter === "Inactive") result = result.filter((item) => String(item.status) === "0");
    }

    return result;
  }, [apiData, selectedFilter, debouncedSearch]);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, perPage, selectedFilter]);

  const totalPages = Math.ceil(filteredData.length / perPage) || 1;
  const startIndex = (currentPage - 1) * perPage;

  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + perPage);
  }, [filteredData, startIndex, perPage]);

  const visiblePages = useMemo(() => {
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);
    for (let i = start; i <= end; i++) pages.push(i - 1);
    return pages;
  }, [totalPages, currentPage]);

  // Desktop Table Grid Template
  const gridTemplate = "grid-cols-[50px_60px_1.5fr_1.5fr_1fr_100px_100px]";

  return (
    <div className="app_card overflow-hidden rounded-lg border border-gray-200 shadow-md" role="main">
      {/* Header */}
      <div className="card_header flex items-center justify-between w-full p-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
          Manage Users (Vigilance)
        </h2>
      </div>

      <div className="p-4 md:p-6 space-y-4 bg-slate-50/30">
        
        {/* ✅ FILTERS & ADD BUTTON (Single Line) */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 w-full">
          
          <div className="w-full xl:flex-1">
            <TableFilters
              search={search}
              setSearch={setSearch}
              perPage={perPage}
              setPerPage={setPerPage}
              setCurrentPage={setCurrentPage}
              showRoleFilter={true}
              selectedRole={selectedFilter}
              setSelectedRole={setSelectedFilter}
              roles={["Active", "Inactive"]}
              placeholder="Search Name, Email, Mobile..."
              showExportExcel={false}
              showExportPDF={false}
              loading={loading}
              hasData={filteredData.length > 0}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto">
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 shadow-sm text-sm font-medium hover:bg-blue-700 whitespace-nowrap transition-all"
            >
              <UserPlus size={16} /> Add New User
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-100 rounded-lg relative min-h-[400px]">
          {loading && apiData.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-[1px]">
              <Loader2 className="animate-spin text-[#082164]" size={32} />
            </div>
          )}

          {/* ========== MOBILE CARD VIEW ========== */}
          <div className="block lg:hidden space-y-4 p-1">
            {!loading && paginatedData.length === 0 && (
              <div className="p-10 text-center text-gray-500 font-medium bg-white rounded-xl border border-dashed border-gray-300">
                No users found.
              </div>
            )}
            {paginatedData.map((item, idx) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-gray-800 text-lg">
                    <TextHighlighter text={item.full_name} search={debouncedSearch} />
                  </h4>
                  <button onClick={() => handleStatusToggle(item.id, item.status)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${String(item.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {String(item.status) === '1' ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Email:</span>
                    <span className="text-gray-700 truncate ml-4 text-right">
                      <TextHighlighter text={item.email_id} search={debouncedSearch} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold uppercase tracking-tighter">Mobile:</span>
                    <span className="text-gray-700 truncate ml-4 text-right">
                      <TextHighlighter text={item.mobile_no} search={debouncedSearch} />
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleOpenModal(item.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs uppercase hover:bg-blue-100 transition-colors">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDeleteClick(item.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold text-xs uppercase hover:bg-red-100 transition-colors">
                    <UserX size={14} /> Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ========== DESKTOP TABLE VIEW ========== */}
          <div className="hidden lg:block overflow-hidden">
            <ListTable columns={gridTemplate}>
              {{
                header: (
                  <ListHeader className="uppercase items-center">
                    <div className="text-center">
                      {/* Checkbox space (agar future me bulk action chahiye) */}
                    </div>
                    <div className="text-left">Sr No</div>
                    <div className="text-left">Full Name</div>
                    <div className="text-left">Email</div>
                    <div className="text-left">Mobile</div>
                    <div className="flex justify-center">Status</div>
                    <div className="flex justify-center">Action</div>
                  </ListHeader>
                ),
                rows: paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => (
                    <ListRow key={item.id} columns={gridTemplate} className="hover:bg-blue-50/50 transition-colors items-center">
                      
                      {/* Empty checkbox space for UI match */}
                      <span className="flex justify-center">
                        <div className="w-4 h-4"></div>
                      </span>

                      <span className="text-left font-medium">
                        <TextHighlighter text={String(startIndex + idx + 1)} search={debouncedSearch} />
                      </span>
                      
                      <span className="text-left truncate font-semibold text-gray-800">
                        <Tooltip title={item.full_name}>
                          <span className="cursor-help">
                            <TextHighlighter text={item.full_name} search={debouncedSearch} />
                          </span>
                        </Tooltip>
                      </span>

                      <span className="text-left truncate text-gray-600">
                        <TextHighlighter text={item.email_id} search={debouncedSearch} />
                      </span>

                      <span className="text-left text-gray-600">
                        <TextHighlighter text={item.mobile_no} search={debouncedSearch} />
                      </span>

                      <span className="flex justify-center">
                        <button onClick={() => handleStatusToggle(item.id, item.status)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${String(item.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {String(item.status) === '1' ? 'Active' : 'Inactive'}
                        </button>
                      </span>

                      <span className="flex justify-center gap-3">
                        <Tooltip title="Edit User">
                          <Edit size={16} className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors" onClick={() => handleOpenModal(item.id)} />
                        </Tooltip>
                        <Tooltip title="Deactivate User">
                          <Trash2 size={16} className="text-red-600 hover:text-red-800 cursor-pointer transition-colors" onClick={() => handleDeleteClick(item.id)} />
                        </Tooltip>
                      </span>
                    </ListRow>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-400 italic">
                    No users found.
                  </div>
                ),
              }}
            </ListTable>
          </div>
        </div>

        {/* Pagination */}
        <ListPagination
          currentPage={currentPage - 1}
          totalPages={totalPages}
          visiblePages={visiblePages}
          onPageChange={(p) => setCurrentPage(p + 1)}
        />
      </div>

      {/* Add/Edit User Modal */}
      <Modal 
        open={showModal} 
        onCancel={() => setShowModal(false)} 
        title={editId ? "Edit User" : "Add New User"}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required className="w-full border p-2 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Middle Name</label>
              <input type="text" value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} className="w-full border p-2 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full border p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input type="email" value={formData.email_id} onChange={(e) => setFormData({...formData, email_id: e.target.value})} required className="w-full border p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile (10 digits) *</label>
            <input type="text" value={formData.mobile_no} onChange={(e) => setFormData({...formData, mobile_no: e.target.value})} required className="w-full border p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password {editId && "(Leave blank to keep current)"}</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editId} minLength={8} className="w-full border p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded-lg text-sm">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              {editId ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;