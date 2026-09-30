import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Loader from "@/components/common/Loader/Loader";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import Seo from "@/components/Seo";
import AdminModal from "@/components/admin/AdminModal";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminStatusBadge from "@/components/admin/AdminStatusBadge";
import {
  adminErrorClass,
  adminFieldLabel,
  adminInputClass,
  adminSecondaryActionClass,
} from "@/components/admin/adminUi";
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

      <AdminPageHeader
        title="Category Management"
        subtitle="Organize bridal jewellery collections and catalog navigation."
        actions={
          <Button
            onClick={openCreateModal}
            className="w-full gap-2 sm:w-auto"
          >
            <Plus size={16} className="shrink-0" /> Add Category
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="Unable to load categories"
              description={error}
              actionText="Retry"
              onAction={loadCategories}
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-4 sm:p-8">
            <EmptyState
              title="No categories configured"
              description="Create your first bridal category to organize products."
              actionText="Add Category"
              onAction={openCreateModal}
            />
          </div>
        ) : (
          <>
            {/* Mobile / small-screen card list */}
            <ul className="divide-y divide-stone-100 lg:hidden">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-stone-100">
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
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-words text-stone-900">
                      {cat.name}
                    </p>
                    <p className="truncate font-mono text-xs text-stone-500">
                      {cat.slug}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <AdminStatusBadge
                      status={cat.active ? "ACTIVE" : "INACTIVE"}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="min-h-11 rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-[#7d2034]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="min-h-11 rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold tracking-wider text-stone-500 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Slug</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="transition hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-stone-100">
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
                          <span className="font-medium break-words text-stone-900">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap text-stone-500">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <AdminStatusBadge
                          status={cat.active ? "ACTIVE" : "INACTIVE"}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            title="Edit category"
                            className="rounded p-2 text-stone-600 hover:bg-stone-100 hover:text-[#7d2034]"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id)}
                            title="Delete category"
                            className="rounded p-2 text-stone-400 hover:bg-red-50 hover:text-red-700"
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
          </>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        labelledBy="category-modal-title"
        title={editingCategory ? "Edit Category" : "New Category"}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className={adminSecondaryActionClass}
            >
              Cancel
            </button>
            <Button
              type="submit"
              form="category-form"
              loading={submitting}
              className="w-full sm:w-auto"
            >
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        }
      >
        {modalError && (
          <div role="alert" className={`${adminErrorClass} mb-4`}>
            {modalError}
          </div>
        )}

        <form id="category-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="category-name" className={adminFieldLabel}>
              Category Name *
            </label>
            <input
              id="category-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bridal Chura"
              className={adminInputClass}
            />
          </div>

          <div>
            <label htmlFor="category-image" className={adminFieldLabel}>
              Cover Image URL (Optional)
            </label>
            <input
              id="category-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... or /images/..."
              className={adminInputClass}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm font-medium text-stone-800">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded accent-[#7d2034]"
            />
            <span>Active</span>
          </label>
        </form>
      </AdminModal>
    </div>
  );
}

export default AdminCategories;