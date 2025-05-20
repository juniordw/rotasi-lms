import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";

type Category = {
  id: number;
  name: string;
  description: string;
  parent_category_id: number | null;
};

type CategoryFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id'>) => void;
  mode: "create" | "edit";
  categories: Category[];
  initialData?: Category;
};

const CategoryForm = ({
  isOpen,
  onClose,
  onSave,
  mode,
  categories,
  initialData,
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: "",
    description: "",
    parent_category_id: null,
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        parent_category_id: initialData.parent_category_id,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "parent_category_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      description?: string;
    } = {};

    if (!formData.name.trim()) {
      errors.name = "Nama kategori wajib diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  // Filter out the current category and its children in the parent dropdown
  const availableParentCategories = mode === "edit" && initialData 
    ? categories.filter(cat => cat.id !== initialData.id) 
    : categories;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {mode === "create" ? "Tambah Kategori Baru" : "Edit Kategori"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-lg border ${
                formErrors.name
                  ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/10"
                  : "border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
              } p-2.5 dark:text-white`}
              placeholder="Masukkan nama kategori"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 p-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              placeholder="Deskripsi singkat tentang kategori ini"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="parent_category_id"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Kategori Induk
            </label>
            <select
              id="parent_category_id"
              name="parent_category_id"
              value={formData.parent_category_id === null ? "" : formData.parent_category_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 p-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="">Tidak ada (Kategori Utama)</option>
              {availableParentCategories.filter(cat => cat.parent_category_id === null).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {mode === "create" ? "Tambah Kategori" : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;