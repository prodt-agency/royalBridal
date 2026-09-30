import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UploadCloud, X, Plus, Trash2, AlertCircle } from "lucide-react";
import Button from "@/components/common/Button/Button";
import Loader from "@/components/common/Loader/Loader";
import Seo from "@/components/Seo";
import {
  adminCardClass,
  adminErrorClass,
  adminFieldLabel,
  adminInputClass,
  adminSecondaryActionClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/adminUi";
import { adminService } from "@/services/admin.service";
import { getErrorMessage } from "@/utils/apiError";
import { getImageUrl } from "@/utils/image";

const initialSizes = [
  { size: "2.4", stock: 5 },
  { size: "2.6", stock: 5 },
  { size: "2.8", stock: 5 },
];

function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("10");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [images, setImages] = useState([]);
  const [sizes, setSizes] = useState(initialSizes);
  const uploadedPublicIds = useRef(new Set());

  useEffect(() => {
    adminService
      .getCategories()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setCategories(list);
        if (!isEdit && list.length > 0) {
          setCategoryId(String(list[0].id));
        }
      })
      .catch(() => {});

    if (isEdit) {
      // Find product by id from products list or direct endpoint
      adminService
        .getProducts({ limit: 100 })
        .then((res) => {
          const list = res.data ?? [];
          const found = list.find((p) => p.id === Number(id));
          if (found) {
            setName(found.name || "");
            setSku(found.sku || "");
            setCategoryId(String(found.categoryId || ""));
            setPrice(String(found.price || ""));
            setSalePrice(found.salePrice ? String(found.salePrice) : "");
            setStock(String(found.stock || 0));
            setDescription(found.description || "");
            setFeatured(Boolean(found.featured));
            setActive(Boolean(found.active));
            setImages(
              found.images?.map((img, i) => ({ ...img, sortOrder: i, isNew: false })) ||
                [],
            );
            setSizes(
              found.sizes?.length > 0
                ? found.sizes.map((s) => ({ size: s.size, stock: s.stock }))
                : initialSizes,
            );
          } else {
            setError("Product not found");
          }
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");
    try {
      const res = await adminService.uploadImages(files);
      const uploadedFiles = res.files || [];
      const newImages = uploadedFiles.map((file, idx) => ({
        imageUrl: file.url,
        cloudinaryPublicId: file.publicId,
        sortOrder: images.length + idx,
        isNew: true,
      }));
      newImages.forEach((image) =>
        uploadedPublicIds.current.add(image.cloudinaryPublicId),
      );
      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      setError(
        getErrorMessage(err) ||
          "Failed to upload image. Allowed formats: JPEG, PNG, WebP (Max 5MB).",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = async (index) => {
    const image = images[index];
    if (image?.isNew && image.cloudinaryPublicId) {
      try {
        await adminService.deleteImage(image.cloudinaryPublicId);
        uploadedPublicIds.current.delete(image.cloudinaryPublicId);
      } catch (err) {
        setError(
          getErrorMessage(err) ||
            "Failed to delete the uploaded image. Please try again.",
        );
        return;
      }
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSizeRow = () => {
    setSizes((prev) => [...prev, { size: "", stock: 5 }]);
  };

  const updateSizeRow = (index, field, value) => {
    setSizes((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: field === "stock" ? Number(value) : value } : row,
      ),
    );
  };

  const removeSizeRow = (index) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (salePrice && Number(salePrice) > Number(price)) {
      setError("Sale price cannot be greater than the regular price.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        categoryId: Number(categoryId),
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        stock: Number(stock) || 0,
        description: description.trim() || null,
        featured: Boolean(featured),
        active: Boolean(active),
        images: images.map((img, i) => ({
          imageUrl: img.imageUrl,
          cloudinaryPublicId: img.cloudinaryPublicId || null,
          sortOrder: i,
        })),
        sizes: sizes
          .filter((s) => s.size.trim() !== "")
          .map((s) => ({
            size: s.size.trim(),
            stock: Number(s.stock) || 0,
          })),
      };

      if (isEdit) {
        await adminService.updateProduct(id, payload);
      } else {
        await adminService.createProduct(payload);
      }

      uploadedPublicIds.current.clear();
      navigate("/admin/products");
    } catch (err) {
      // A definite API rejection means these newly uploaded assets cannot have been
      // attached to a product. Do not clean up after network errors, where the save
      // result is unknown.
      if (err.response) {
        await Promise.allSettled(
          [...uploadedPublicIds.current].map((publicId) =>
            adminService.deleteImage(publicId),
          ),
        );
        uploadedPublicIds.current.clear();
      }
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Seo title={`${isEdit ? "Edit Product" : "Add Product"} | Admin | Royal Bridal`} />

      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          aria-label="Back to products"
          className="shrink-0 rounded-full border border-stone-300 p-3 text-stone-600 hover:bg-stone-100"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold break-words text-stone-900 sm:text-3xl">
            {isEdit ? "Edit Product Listing" : "Create New Product"}
          </h1>
          <p className="text-xs break-words text-stone-500">
            Fill in product specs, pricing, sizes, and upload high-res imagery.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className={`${adminErrorClass} flex items-start gap-2 text-sm`}>
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className={`${adminCardClass} space-y-4`}>
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Basic Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="product-name" className={adminFieldLabel}>
                Product Name *
              </label>
              <input
                id="product-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Emerald Bridal Chura"
                className={adminInputClass}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="product-sku" className={adminFieldLabel}>
                SKU (Stock Keeping Unit) *
              </label>
              <input
                id="product-sku"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. RB-CHURA-001"
                className={`${adminInputClass} font-mono`}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="product-category" className={adminFieldLabel}>
                Category *
              </label>
              <select
                id="product-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={adminSelectClass}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label htmlFor="product-stock" className={adminFieldLabel}>
                Overall Total Stock
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={adminInputClass}
              />
            </div>

            <div className="min-w-0 sm:col-span-2">
              <label htmlFor="product-description" className={adminFieldLabel}>
                Description
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the craft, material, and story of this piece..."
                className={adminTextareaClass}
              />
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className={`${adminCardClass} space-y-4`}>
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Pricing &amp; Offers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="product-price" className={adminFieldLabel}>
                Regular Price (₹) *
              </label>
              <input
                id="product-price"
                required
                type="number"
                step="0.01"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 5499"
                className={adminInputClass}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="product-sale-price" className={adminFieldLabel}>
                Sale Price (₹) (Optional)
              </label>
              <input
                id="product-sale-price"
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="e.g. 4999"
                className={adminInputClass}
              />
            </div>
          </div>
        </div>

        {/* Sizes Card */}
        <div className={`${adminCardClass} space-y-4`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Size Variants
              </h2>
              <p className="text-xs break-words text-stone-500">
                Configure size options (e.g. 2.4, 2.6, 2.8) and inventory.
              </p>
            </div>
            <button
              type="button"
              onClick={addSizeRow}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-md border border-[#7d2034] px-4 text-xs font-semibold text-[#7d2034] sm:min-h-0 sm:border-0 sm:px-0"
            >
              <Plus size={14} className="shrink-0" /> Add Size
            </button>
          </div>

          <div className="space-y-2">
            {sizes.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(0,1fr)_5.5rem_auto] items-center gap-2 sm:gap-3"
              >
                <input
                  value={row.size}
                  onChange={(e) => updateSizeRow(index, "size", e.target.value)}
                  placeholder="Size (e.g. 2.6)"
                  aria-label={`Size row ${index + 1} size`}
                  className={adminInputClass}
                />
                <input
                  type="number"
                  min="0"
                  value={row.stock}
                  onChange={(e) => updateSizeRow(index, "stock", e.target.value)}
                  placeholder="Stock"
                  aria-label={`Size row ${index + 1} stock`}
                  className={adminInputClass}
                />
                <button
                  type="button"
                  onClick={() => removeSizeRow(index)}
                  className="rounded-md p-3 text-stone-400 hover:bg-red-50 hover:text-red-700"
                  aria-label="Remove size"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Images Upload Card */}
        <div className={`${adminCardClass} space-y-4`}>
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Product Images
            </h2>
            <p className="text-xs break-words text-stone-500">
              Upload high-resolution photography. JPEG, PNG, WebP supported.
            </p>
          </div>

          {/* Upload Dropzone */}
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 p-6 text-center transition hover:border-[#7d2034] hover:bg-stone-50">
            <UploadCloud size={32} className="shrink-0 text-[#7d2034]" />
            <span className="mt-2 text-sm font-medium break-words text-stone-800">
              {uploading
                ? "Uploading images..."
                : "Tap to select images from your device"}
            </span>
            <span className="mt-0.5 text-xs text-stone-400">
              Max 5MB per image
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              {images.map((img, index) => (
                <div
                  key={img.imageUrl + index}
                  className="group relative aspect-4/5 overflow-hidden rounded-lg border border-stone-200 bg-stone-100"
                >
                  <img
                    src={getImageUrl(img.imageUrl)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white opacity-100 transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status & Options */}
        <div className={`${adminCardClass} flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6`}>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-800">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded accent-[#7d2034]"
            />
            <span>Mark as Featured Product</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-800">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded accent-[#7d2034]"
            />
            <span>Active &amp; Visible in Store</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
          <Link
            to="/admin/products"
            className={`${adminSecondaryActionClass} sm:px-5`}
          >
            Cancel
          </Link>
          <Button type="submit" loading={submitting} className="w-full sm:w-auto">
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductForm;