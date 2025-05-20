import { useState } from "react";
import { FiEdit, FiTrash, FiChevronDown, FiChevronRight, FiFolder } from "react-icons/fi";

type Category = {
  id: number;
  name: string;
  description: string;
  parent_category_id: number | null;
};

type CategoryListProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

const CategoryList = ({ categories, onEdit, onDelete }: CategoryListProps) => {
  // Organize categories into a hierarchy
  const rootCategories = categories.filter(cat => cat.parent_category_id === null);
  const childCategoriesMap = new Map<number, Category[]>();
  
  categories.forEach(cat => {
    if (cat.parent_category_id !== null) {
      if (!childCategoriesMap.has(cat.parent_category_id)) {
        childCategoriesMap.set(cat.parent_category_id, []);
      }
      childCategoriesMap.get(cat.parent_category_id)!.push(cat);
    }
  });

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Nama Kategori
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Deskripsi
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Sub Kategori
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
          {rootCategories.map((category) => (
            <CategoryRow 
              key={category.id} 
              category={category} 
              subCategories={childCategoriesMap.get(category.id) || []}
              onEdit={onEdit} 
              onDelete={onDelete}
              depth={0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CategoryRow = ({
  category,
  subCategories,
  onEdit,
  onDelete,
  depth = 0
}: {
  category: Category;
  subCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  depth: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasChildren = subCategories.length > 0;
  
  return (
    <>
      <tr className={`${depth > 0 ? 'bg-neutral-50 dark:bg-neutral-800/50' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {hasChildren ? (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            ) : (
              <span className="mr-2 w-4"></span>
            )}
            <span className={`ml-${depth * 4} flex items-center`}>
              <FiFolder className="mr-2 text-primary-400" />
              {category.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {category.description || '-'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {subCategories.length > 0 ? subCategories.length : 'Tidak ada'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => onEdit(category)}
            className="mr-3 text-primary-400 hover:text-primary-500"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="text-red-400 hover:text-red-500"
          >
            <FiTrash />
          </button>
        </td>
      </tr>
      
      {/* Render subcategories if expanded */}
      {isExpanded && subCategories.map(subCategory => (
        <tr 
          key={subCategory.id} 
          className="bg-neutral-50 dark:bg-neutral-800/30"
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <span className={`ml-${(depth + 1) * 4} flex items-center`}>
                <FiFolder className="mr-2 text-primary-400" />
                {subCategory.name}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {subCategory.description || '-'}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              -
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={() => onEdit(subCategory)}
              className="mr-3 text-primary-400 hover:text-primary-500"
            >
              <FiEdit />
            </button>
            <button
              onClick={() => onDelete(subCategory)}
              className="text-red-400 hover:text-red-500"
            >
              <FiTrash />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};

export default CategoryList;