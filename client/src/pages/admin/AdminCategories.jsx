import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Layers, X } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";
import { getImageUrl } from "@/utils/image";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadCategories = useCallback(() => {
    adminService
      .getCategories()
      .then((data) => {
        setCategories(Array.isArray(data) ? data : data?.data ?? []);
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setImage("");
    setActive(true);
    setModalError("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setImage(cat.image || "");
    setActive(Boolean(cat.active));
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setModalError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const payload = {
        name: name.trim(),
        image: image.trim() || null,
        active: Boolean(active),
      };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, payload);
      } else {
        await adminService.createCategory(payload);
      }

      closeModal();
      loadCategories();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate or remove this category?")) return;
    try {
      await adminService.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Seo title="Categories | Admin | Royal Bridal" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Category Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Organize bridal jewellery collections and catalog navigation.
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-8">
            <EmptyState
              title="Unable to load categories"
              description={error}
              actionText="Retry"
              onAction={loadCategories}
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No categories configured"
              description="Create your first bridal category to organize products."
              actionText="Add Category"
              onAction={openCreateModal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase text-stone-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-stone-100 flex items-center justify-center">
                          {cat.image ? (
                            <img
                              src={getImageUrl(cat.image)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Layers size={18} className="text-stone-400" />
                          )}
                        </div>
                        <span className="font-medium text-stone-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-500">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`rounded px-2.5 py-1 text-[11px] font-bold ${
                          cat.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {cat.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          title="Edit category"
                          className="rounded p-1.5 text-stone-600 hover:bg-stone-100 hover:text-[#7d2034]"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          title="Delete category"
                          className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Category Name *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bridal Chura"
                  className="w-full rounded-md border border-stone-300 p-2.5 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... or /images/..."
                  className="w-full rounded-md border border-stone-300 p-2.5 text-sm outline-none focus:border-[#7d2034]"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-stone-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 accent-[#7d2034] rounded"
                />
                <span>Active</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-stone-300 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <Button type="submit" loading={submitting} className="px-5 py-2 text-xs">
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
