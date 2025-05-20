"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import EmptyState from "@/components/ui/EmptyState";
import { useApi } from "@/hooks/api/useApi";
import { FiPlus, FiFolder, FiAlertCircle } from "react-icons/fi";
import CategoryList from "../../../components/category/CategoryList";
import CategoryForm from "../../../components/category/CategoryForm";
import DeleteConfirmation from "../../../components/DeleteConfirmation";

type Category = {
  id: number;
  name: string;
  description: string;
  parent_category_id: number | null;
};

export default function CategoriesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { fetchData, mutateData, isLoading, error } = useApi();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const result = await fetchData("/categories");
    
    if (result?.success) {
      setCategories(result.data);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const handleSaveCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      if (formMode === "create") {
        const result = await mutateData("/categories", "POST", categoryData);
        
        if (result?.success) {
          showToast("Kategori berhasil dibuat", "success");
          fetchCategories();
          setIsFormOpen(false);
        }
      } else if (formMode === "edit" && selectedCategory) {
        const result = await mutateData(`/categories/${selectedCategory.id}`, "PUT", categoryData);
        
        if (result?.success) {
          showToast("Kategori berhasil diupdate", "success");
          fetchCategories();
          setIsFormOpen(false);
        }
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const result = await mutateData(`/categories/${selectedCategory.id}`, "DELETE");
      
      if (result?.success) {
        showToast("Kategori berhasil dihapus", "success");
        fetchCategories();
        setIsDeleteConfirmOpen(false);
        setSelectedCategory(null);
      }
    } catch (error) {
      showToast("Terjadi kesalahan saat menghapus kategori", "error");
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <LoadingIndicator size="md" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Kategori</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Kelola kategori kursus pada platform
            </p>
          </div>

          <Button onClick={handleCreateCategory} className="flex items-center gap-2">
            <FiPlus />
            Tambah Kategori
          </Button>
        </div>

        {error && (
          <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-500 dark:bg-red-900/20">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {categories.length === 0 ? (
          <EmptyState
            icon={<FiFolder size={40} />}
            title="Belum ada kategori"
            description="Tambahkan kategori pertama untuk mengorganisir kursus pada platform"
            actionLabel="Tambah Kategori"
            onAction={handleCreateCategory}
          />
        ) : (
          <CategoryList
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <CategoryForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveCategory}
          mode={formMode}
          categories={categories}
          initialData={selectedCategory || undefined}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && selectedCategory && (
        <DeleteConfirmation
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteCategory}
          title="Hapus Kategori"
          message={`Apakah Anda yakin ingin menghapus kategori "${selectedCategory.name}"? Tindakan ini tidak dapat dibatalkan.`}
        />
      )}
    </DashboardLayout>
  );
}