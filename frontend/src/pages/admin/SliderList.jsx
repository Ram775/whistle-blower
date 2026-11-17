import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { settingsService } from "../../services/settingsService";
import toast from "react-hot-toast";
import { Tooltip, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// UI Components (Same as UserList/MasterData)
import ListTable from "../../components/ui/ListTable";
import ListHeader from "../../components/ui/ListHeader";
import ListRow from "../../components/ui/ListRow";
import ListPagination from "../../components/ui/ListPagination";
import TableFilters from "../../components/ui/TableFilters";
import TextHighlighter from "../../components/ui/TextHighlighter";

const { confirm } = Modal;

const SliderList = () => {
  // Data State
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("");

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ image: null, alt_tag: "", sort_order: 0, status: "1" });
  const [isUploading, setIsUploading] = useState(false);

  // Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Data
  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSliders();
      if (response.data) setApiData(response.data);
    } catch (error) {
      toast.error("Failed to fetch sliders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("save_folder", "slider");
    try {
      const response = await settingsService.uploadSingleImage(uploadData);
      if (response.status) {
        setFormData({ ...formData, image: response.filename });
        toast.success("Image uploaded!");
      }
    } catch (error) {
      toast.error("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await settingsService.createSlider(formData);
      toast.success("Slider added successfully!");
      setShowModal(false);
      setFormData({ image: null, alt_tag: "", sort_order: 0, status: "1" });
      fetchSliders();
    } catch (error) {
      toast.error("Failed to save slider");
    }
  };

  // Status Toggle
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = String(currentStatus) === "1" ? "0" : "1";
    try {
      await settingsService.changeSliderStatus(id, newStatus);
      toast.success("Status updated!");
      fetchSliders();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Delete Handler
  const handleDeleteClick = (id) => {
    confirm({
      title: "Delete Slider?",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to permanently delete this slider?",
      okText: "Yes, Delete",
      okType: "danger",
      async onOk() {
        try {
          setLoading(true);
          await settingsService.deleteSliders([id]);
          toast.success("Slider deleted!");
          fetchSliders();
        } catch (error) {
          toast.error("Delete failed");
          setLoading(false);
        }
      },
    });
  };

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    const term = debouncedSearch?.toLowerCase().trim();
    let result = apiData || [];

    if (term) {
      result = result.filter((item) =>
        `${item.alt_tag || ""} ${item.sort_order || ""}`.toLowerCase().includes(term)
      );
    }

    if (selectedFilter) {
      if (selectedFilter === "Active") result = result.filter((item) => String(item.status) === "1");
      else if (selectedFilter === "Inactive") result = result.filter((item) => String(item.status) === "0");
    }

    return result;
  }, [apiData, selectedFilter, debouncedSearch]);

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
  const gridTemplate = "grid-cols-[50px_60px_150px_1fr_100px_100px_100px]";

  return (
    <div className="app_card overflow-hidden rounded-lg border border-gray-200 shadow-md" role="main">
      {/* Header */}
      <div className="card_header flex items-center justify-between w-full p-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
          Manage Sliders
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
              placeholder="Search Alt Tag..."
              showExportExcel={false}
              showExportPDF={false}
              loading={loading}
              hasData={filteredData.length > 0}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 shadow-sm text-sm font-medium hover:bg-blue-700 whitespace-nowrap transition-all"
            >
              <Plus size={16} /> Add New Slider
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
                No sliders found.
              </div>
            )}
            {paginatedData.map((item, idx) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                
                {/* Image Preview */}
                <div className="w-full h-40 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${item.image}`} 
                      alt="slider" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <ImageIcon size={40} className="text-gray-300" />
                  )}
                </div>

                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-gray-800 text-sm truncate pr-2">
                    <TextHighlighter text={item.alt_tag || "No Alt Tag"} search={debouncedSearch} />
                  </h4>
                  <button onClick={() => handleStatusToggle(item.id, item.status)} className={`px-3 py-1 shrink-0 rounded-full text-[10px] font-black uppercase ${String(item.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {String(item.status) === '1' ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Sort Order:</span>
                  <span className="text-gray-700">{item.sort_order}</span>
                </div>

                <div className="flex justify-end pt-3 border-t border-gray-100">
                  <button onClick={() => handleDeleteClick(item.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold text-xs uppercase hover:bg-red-100 transition-colors">
                    <Trash2 size={14} /> Delete
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
                    <div className="text-center"></div>
                    <div className="text-left">Sr No</div>
                    <div className="text-left">Image</div>
                    <div className="text-left">Alt Tag</div>
                    <div className="flex justify-center">Sort Order</div>
                    <div className="flex justify-center">Status</div>
                    <div className="flex justify-center">Action</div>
                  </ListHeader>
                ),
                rows: paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => (
                    <ListRow key={item.id} columns={gridTemplate} className="hover:bg-blue-50/50 transition-colors items-center">
                      
                      <span className="flex justify-center">
                        <div className="w-4 h-4"></div>
                      </span>

                      <span className="text-left font-medium">
                        <TextHighlighter text={String(startIndex + idx + 1)} search={debouncedSearch} />
                      </span>
                      
                      {/* Image Thumbnail */}
                      <span className="text-left">
                        {item.image ? (
                          <div className="h-10 w-16 rounded overflow-hidden border border-gray-200">
                            <img 
                              src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${item.image}`} 
                              alt="slider" 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No image</span>
                        )}
                      </span>

                      {/* Alt Tag */}
                      <span className="text-left truncate text-gray-700">
                        <Tooltip title={item.alt_tag || "No Alt Tag"}>
                          <span className="cursor-help">
                            <TextHighlighter text={item.alt_tag || "-"} search={debouncedSearch} />
                          </span>
                        </Tooltip>
                      </span>

                      {/* Sort Order */}
                      <span className="flex justify-center text-gray-600">
                        <TextHighlighter text={String(item.sort_order)} search={debouncedSearch} />
                      </span>

                      {/* Status */}
                      <span className="flex justify-center">
                        <button onClick={() => handleStatusToggle(item.id, item.status)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${String(item.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {String(item.status) === '1' ? 'Active' : 'Inactive'}
                        </button>
                      </span>

                      {/* Action */}
                      <span className="flex justify-center">
                        <Tooltip title="Delete Slider">
                          <Trash2 size={16} className="text-red-600 hover:text-red-800 cursor-pointer transition-colors" onClick={() => handleDeleteClick(item.id)} />
                        </Tooltip>
                      </span>
                    </ListRow>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-400 italic">
                    No sliders found.
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

      {/* Add Slider Modal */}
      <Modal 
        open={showModal} 
        onCancel={() => setShowModal(false)} 
        title="Add New Slider"
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* Image Upload Box */}
          <div>
            <label className="block text-sm font-medium mb-2">Slider Image *</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                {formData.image ? (
                  <img 
                    src={`${import.meta.env.VITE_UPLOAD_BASE_URL}/${formData.image}`} 
                    alt="preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                {isUploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
                {formData.image && !isUploading && <p className="text-xs text-green-600 mt-1">Image ready!</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alt Tag (Optional)</label>
            <input 
              type="text" 
              value={formData.alt_tag} 
              onChange={(e) => setFormData({...formData, alt_tag: e.target.value})} 
              className="w-full border p-2 rounded-lg text-sm" 
              placeholder="Image description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input 
              type="number" 
              value={formData.sort_order} 
              onChange={(e) => setFormData({...formData, sort_order: e.target.value})} 
              className="w-full border p-2 rounded-lg text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value})} 
              className="w-full border p-2 rounded-lg text-sm"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button 
              type="submit" 
              disabled={isUploading || !formData.image} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Slider
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SliderList;