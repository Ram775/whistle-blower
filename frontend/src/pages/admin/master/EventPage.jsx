import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Tooltip, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { notify } from "../../../utils/notify";

import ListTable from "../../../components/ui/ListTable";
import ListHeader from "../../../components/ui/ListHeader";
import ListRow from "../../../components/ui/ListRow";
import ListPagination from "../../../components/ui/ListPagination";
import TableFilters from "../../../components/ui/TableFilters";
import TextHighlighter from "../../../components/ui/TextHighlighter";
import { masterService } from "../../../services/masterService";

const { confirm } = Modal;

const EventPage = () => {
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", sort_order: 0, status: "1" });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getVigilanceAngles();
      if (res.data) setApiData(res.data);
    } catch {
      notify.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedIds([]);
  }, []);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({
        name: row.name || "",
        sort_order: row.sort_order ?? 0,
        status: String(row.status),
      });
    } else {
      setEditId(null);
      setFormData({ name: "", sort_order: 0, status: "1" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      sort_order: formData.sort_order,
      status: formData.status,
    };
    try {
      if (editId) {
        await masterService.updateVigilanceAngle(editId, payload);
        notify.success("Event updated successfully!");
      } else {
        await masterService.createVigilanceAngle(payload);
        notify.success("Event created successfully!");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      notify.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteClick = (id) => {
    confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this event?",
      okText: "Yes, Delete",
      okType: "danger",
      async onOk() {
        try {
          setLoading(true);
          await masterService.deleteVigilanceAngles([id]);
          notify.success("Event deleted successfully!");
          fetchData();
        } catch {
          notify.error("Delete failed");
          setLoading(false);
        }
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return notify.warning("Please select at least one record.");
    confirm({
      title: "Delete Confirmation",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${selectedIds.length} records?`,
      okText: "Yes, Delete",
      okType: "danger",
      async onOk() {
        try {
          setLoading(true);
          await masterService.deleteVigilanceAngles(selectedIds);
          notify.success("Records deleted successfully!");
          setSelectedIds([]);
          fetchData();
        } catch {
          notify.error("Delete failed");
          setLoading(false);
        }
      },
    });
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = String(currentStatus) === "1" ? "0" : "1";
    try {
      await masterService.changeVigilanceAngleStatus(id, newStatus);
      notify.success("Status updated!");
      fetchData();
    } catch {
      notify.error("Failed to update status");
    }
  };

  const filteredData = useMemo(() => {
    const term = debouncedSearch?.toLowerCase().trim();
    let result = apiData || [];
    if (term) {
      result = result.filter((item) => `${item.name || ""}`.toLowerCase().includes(term));
    }
    if (selectedFilter) {
      result = result.filter(
        (item) => String(item.status) === (selectedFilter === "Active" ? "1" : "0")
      );
    }
    return result.map((item, index) => ({ ...item, sr: index + 1 }));
  }, [apiData, selectedFilter, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, perPage, selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const paginatedData = useMemo(
    () => filteredData.slice(startIndex, startIndex + perPage),
    [filteredData, startIndex, perPage]
  );

  const visiblePages = useMemo(() => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);
    start = Math.max(1, start);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i - 1);
    return pages;
  }, [totalPages, currentPage]);

  const gridTemplate = "grid-cols-[50px_60px_1fr_1fr_100px_100px]";

  return (
    <div className="bg-white app_card rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-[#1b2a5e]">Event Management</h2>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <a href="/admin/dashboard" className="text-[#1b2a5e] hover:underline font-medium">
              Home
            </a>
            <span className="mx-1.5">›</span>
            <span className="font-medium">Event</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-5 flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          <div className="w-full md:w-auto flex-1">
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
              placeholder="Search Event..."
              showExportExcel={false}
              showExportPDF={false}
              loading={loading}
              hasData={filteredData.length > 0}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={handleBulkDelete}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 rounded px-4 py-2 shadow-sm text-sm font-semibold text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 whitespace-nowrap transition-all"
            >
              <Trash2 size={16} /> Delete
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1b2a5e] text-white rounded px-4 py-2 shadow-sm text-sm font-semibold hover:bg-blue-800 whitespace-nowrap transition-all"
            >
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <Loader2 className="animate-spin text-[#1b2a5e]" size={32} />
            </div>
          )}

          {/* Mobile */}
          <div className="block lg:hidden space-y-4 p-1">
            {paginatedData.length === 0 && !loading && (
              <div className="p-10 text-center text-gray-500 font-medium bg-white rounded-xl border border-dashed border-gray-300">
                No records found
              </div>
            )}
            {paginatedData.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-blue-900"
                    checked={selectedIds.includes(item.id)}
                    onChange={() =>
                      setSelectedIds((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      )
                    }
                  />
                  <h4 className="font-bold text-gray-800 truncate flex-1">{item.name}</h4>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Sort Order:</span>
                  <span className="text-gray-800 font-semibold">{item.sort_order}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <button
                    onClick={() => handleStatusToggle(item.id, item.status)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      String(item.status) === "1"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {String(item.status) === "1" ? "Active" : "Inactive"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block w-full">
            <ListTable columns={gridTemplate}>
              {{
                header: (
                  <ListHeader className="bg-[#d2dfff] text-[#1b2a5e] rounded-none border-none py-2 uppercase text-[12px] font-bold">
                    <div className="text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-blue-900"
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked ? paginatedData.map((i) => i.id) : []
                          )
                        }
                        checked={
                          selectedIds.length === paginatedData.length &&
                          paginatedData.length > 0
                        }
                      />
                    </div>
                    <div className="text-left">SR NO</div>
                    <div className="text-left pl-2">Name</div>
                    <div className="text-left pl-2">Sort Order</div>
                    <div className="text-center">Status</div>
                    <div className="text-center">Action</div>
                  </ListHeader>
                ),
                rows:
                  paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <ListRow
                        key={item.id}
                        columns={gridTemplate}
                        className={`bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-none py-2 items-center ${
                          selectedIds.includes(item.id) ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <span className="flex justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded accent-blue-900"
                            checked={selectedIds.includes(item.id)}
                            onChange={() =>
                              setSelectedIds((prev) =>
                                prev.includes(item.id)
                                  ? prev.filter((id) => id !== item.id)
                                  : [...prev, item.id]
                              )
                            }
                          />
                        </span>
                        <span className="text-left font-medium text-gray-700 text-[13px]">
                          {item.sr}
                        </span>
                        <span className="text-left pl-2 truncate text-gray-700 text-[13px]">
                          <TextHighlighter text={item.name} search={debouncedSearch} />
                        </span>
                        <span className="text-left pl-2 text-gray-700 text-[13px]">
                          {item.sort_order}
                        </span>
                        <span className="flex justify-center">
                          <button
                            onClick={() => handleStatusToggle(item.id, item.status)}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              String(item.status) === "1"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {String(item.status) === "1" ? "Active" : "Inactive"}
                          </button>
                        </span>
                        <span className="flex justify-center gap-3">
                          <Tooltip title="Edit">
                            <Edit
                              size={16}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                              onClick={() => handleOpenModal(item)}
                            />
                          </Tooltip>
                          <Tooltip title="Delete">
                            <Trash2
                              size={16}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                              onClick={() => handleDeleteClick(item.id)}
                            />
                          </Tooltip>
                        </span>
                      </ListRow>
                    ))
                  ) : (
                    !loading && (
                      <div className="py-10 text-center text-gray-400 italic w-full">
                        No records found
                      </div>
                    )
                  ),
              }}
            </ListTable>
          </div>
        </div>

        <ListPagination
          currentPage={currentPage - 1}
          totalPages={totalPages}
          visiblePages={visiblePages}
          onPageChange={(p) => setCurrentPage(p + 1)}
        />
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        title={editId ? "Edit Event" : "Add Event"}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sort Order</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1b2a5e] text-white rounded text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventPage;