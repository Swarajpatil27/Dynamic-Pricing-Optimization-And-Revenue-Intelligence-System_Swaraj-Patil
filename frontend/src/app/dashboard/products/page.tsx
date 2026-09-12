"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  RefreshCw,
  X,
  TrendingUp,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  sku?: string;
  category: string;
  cost_price: number;
  selling_price: number;
  current_price?: number;
  competitor_price: number;
  stock_level: number;
  image_url?: string;
}

interface ProductForm {
  id?: number;
  sku?: string;
  name: string;
  category: string;
  cost_price: number | string;
  selling_price: number | string;
  competitor_price: number | string;
  stock_level: number | string;
  image_url: string;
}

const CATEGORIES = [
  "All",
  "Electronics",
  "Apparel",
  "Fragrances",
  "Beauty",
  "Furniture",
];

const INITIAL_FALLBACK_PRODUCTS: Product[] = [
  // Electronics
  {
    id: 1,
    name: "iPhone 15 Pro",
    category: "Electronics",
    cost_price: 750.0,
    selling_price: 999.99,
    current_price: 999.99,
    competitor_price: 1020.0,
    stock_level: 45,
    image_url:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
  },
  {
    id: 2,
    name: "MacBook Air M3",
    category: "Electronics",
    cost_price: 780.0,
    selling_price: 1099.0,
    current_price: 1099.0,
    competitor_price: 1120.0,
    stock_level: 30,
    image_url:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
  },
  {
    id: 3,
    name: "Apple iPhone Charger",
    category: "Electronics",
    cost_price: 13.59,
    selling_price: 19.99,
    current_price: 19.99,
    competitor_price: 20.39,
    stock_level: 31,
    image_url:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
  },
  {
    id: 4,
    name: "Sony WH-1000XM5",
    category: "Electronics",
    cost_price: 280.0,
    selling_price: 398.0,
    current_price: 398.0,
    competitor_price: 410.0,
    stock_level: 55,
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  },

  // Apparel
  {
    id: 5,
    name: "Blue & Black Check Shirt",
    category: "Apparel",
    cost_price: 18.0,
    selling_price: 29.99,
    current_price: 29.99,
    competitor_price: 32.29,
    stock_level: 38,
    image_url:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80",
  },
  {
    id: 6,
    name: "Gigabyte Aorus Men Tshirt",
    category: "Apparel",
    cost_price: 14.0,
    selling_price: 24.99,
    current_price: 24.99,
    competitor_price: 25.11,
    stock_level: 90,
    image_url:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80",
  },
  {
    id: 7,
    name: "Man Plaid Shirt",
    category: "Apparel",
    cost_price: 21.0,
    selling_price: 34.99,
    current_price: 34.99,
    competitor_price: 38.4,
    stock_level: 82,
    image_url:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80",
  },
  {
    id: 8,
    name: "Man Short Sleeve Shirt",
    category: "Apparel",
    cost_price: 12.0,
    selling_price: 19.99,
    current_price: 19.99,
    competitor_price: 20.67,
    stock_level: 2,
    image_url:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80",
  },

  // Fragrances
  {
    id: 9,
    name: "Calvin Klein CK One",
    category: "Fragrances",
    cost_price: 32.0,
    selling_price: 49.99,
    current_price: 49.99,
    competitor_price: 50.46,
    stock_level: 29,
    image_url:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80",
  },
  {
    id: 10,
    name: "Chanel Coco Noir Eau De",
    category: "Fragrances",
    cost_price: 85.0,
    selling_price: 129.99,
    current_price: 129.99,
    competitor_price: 140.72,
    stock_level: 58,
    image_url:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80",
  },
  {
    id: 11,
    name: "Dior J'adore",
    category: "Fragrances",
    cost_price: 60.0,
    selling_price: 89.99,
    current_price: 89.99,
    competitor_price: 96.61,
    stock_level: 98,
    image_url:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&q=80",
  },
  {
    id: 12,
    name: "Dolce Shine Eau de",
    category: "Fragrances",
    cost_price: 45.0,
    selling_price: 69.99,
    current_price: 69.99,
    competitor_price: 70.21,
    stock_level: 4,
    image_url:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80",
  },

  // Beauty
  {
    id: 13,
    name: "Estée Lauder Advanced Night Repair",
    category: "Beauty",
    cost_price: 55.0,
    selling_price: 115.0,
    current_price: 115.0,
    competitor_price: 120.0,
    stock_level: 60,
    image_url:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80",
  },
  {
    id: 14,
    name: "La Mer Crème de la Mer",
    category: "Beauty",
    cost_price: 190.0,
    selling_price: 380.0,
    current_price: 380.0,
    competitor_price: 395.0,
    stock_level: 25,
    image_url:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80",
  },

  // Furniture
  {
    id: 15,
    name: "Herman Miller Aeron Chair",
    category: "Furniture",
    cost_price: 750.0,
    selling_price: 1295.0,
    current_price: 1295.0,
    competitor_price: 1350.0,
    stock_level: 18,
    image_url:
      "https://images.unsplash.com/photo-1580481077195-722f486d34e2?w=500&q=80",
  },
  {
    id: 16,
    name: "Solid Oak Dining Table",
    category: "Furniture",
    cost_price: 420.0,
    selling_price: 849.0,
    current_price: 849.0,
    competitor_price: 899.0,
    stock_level: 12,
    image_url:
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=500&q=80",
  },
];

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState<Product[]>(
    INITIAL_FALLBACK_PRODUCTS
  );

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // CRUD Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  /*
   * IMPORTANT:
   * Numeric fields are number | string.
   *
   * This allows the input to temporarily contain ""
   * instead of forcing 0 into the field.
   */
  const [currentProduct, setCurrentProduct] =
    useState<ProductForm>({
      name: "",
      category: "Electronics",
      cost_price: "",
      selling_price: "",
      competitor_price: "",
      stock_level: 10,
      image_url: "",
    });

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/products"
      );

      if (res.ok) {
        const data = await res.json();

        const items = Array.isArray(data)
          ? data
          : data.products || [];

        if (items.length > 0) {
          setProducts(items);
        }
      }
    } catch (err) {
      console.warn(
        "Backend API unavailable, displaying active catalog:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /*
   * Open Add Product modal.
   */
  const handleOpenAddModal = () => {
    setModalMode("create");

    setCurrentProduct({
      name: "",
      category:
        selectedCategory === "All"
          ? "Electronics"
          : selectedCategory,

      // Start empty instead of 0
      cost_price: "",
      selling_price: "",
      competitor_price: "",

      stock_level: 10,
      image_url: "",
    });

    setIsModalOpen(true);
  };

  /*
   * Open Edit Product modal.
   */
  const handleOpenEditModal = (prod: Product) => {
    setModalMode("edit");

    setCurrentProduct({
      id: prod.id,
      sku: prod.sku,
      name: prod.name,
      category: prod.category,

      cost_price: prod.cost_price,
      selling_price: prod.selling_price,
      competitor_price: prod.competitor_price,

      stock_level: prod.stock_level,
      image_url: prod.image_url || "",
    });

    setIsModalOpen(true);
  };

  /*
   * Save / Add / Edit Product
   */
  const handleSaveProduct = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!currentProduct.name?.trim()) {
      alert("Please enter a product title.");
      return;
    }

    /*
     * Selling price is required.
     */
    if (
      currentProduct.selling_price === "" ||
      Number(currentProduct.selling_price) <= 0
    ) {
      alert("Please enter a valid selling price.");
      return;
    }

    /*
     * Convert form values to numbers only when submitting.
     *
     * This is the important part:
     * while typing, values remain strings.
     * Conversion happens only here.
     */
    const costPrice =
      currentProduct.cost_price === ""
        ? 0
        : Number(currentProduct.cost_price);

    const sellingPrice = Number(
      currentProduct.selling_price
    );

    const competitorPrice =
      currentProduct.competitor_price === ""
        ? Number((sellingPrice * 1.05).toFixed(2))
        : Number(currentProduct.competitor_price);

    const stockLevel =
      currentProduct.stock_level === ""
        ? 0
        : Number(currentProduct.stock_level);

    /*
     * CREATE PRODUCT
     */
    if (modalMode === "create") {
      /*
       * Generate a SKU for the new product.
       *
       * Existing DummyJSON products use:
       * SKU-1001, SKU-1002, ...
       *
       * We use the next available local ID as a simple
       * SKU generator for newly added products.
       */
      const maxId =
        products.length > 0
          ? Math.max(
              ...products.map((product) =>
                typeof product.id === "number"
                  ? product.id
                  : 0
              )
            )
          : 0;

      const generatedSku = `SKU-${1001 + maxId}`;

      const newProductData = {
        name: currentProduct.name.trim(),
        sku: generatedSku,
        category:
          currentProduct.category || "Electronics",
        cost_price: costPrice,
        selling_price: sellingPrice,
        current_price: sellingPrice,
        competitor_price: competitorPrice,
        stock_level: stockLevel,
        image_url: currentProduct.image_url || "",
      };

      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/products",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newProductData),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();

          throw new Error(
            `Failed to create product: ${res.status} ${errorText}`
          );
        }

        /*
         * Backend returns the actual saved product,
         * including the database ID.
         */
        const createdProduct: Product =
          await res.json();

        setProducts((prev) => [
          createdProduct,
          ...prev,
        ]);

        setIsModalOpen(false);
      } catch (err) {
        console.error(
          "Unable to add product:",
          err
        );

        alert(
          "Unable to add the product. Please make sure the backend is running."
        );
      }
    }

    /*
     * EDIT PRODUCT
     */
    else {
      if (!currentProduct.id) {
        alert("Product ID is missing.");
        return;
      }

      const updatedProductData = {
        name: currentProduct.name.trim(),

        sku:
          currentProduct.sku ||
          `SKU-${1000 + currentProduct.id}`,

        category:
          currentProduct.category || "Electronics",

        cost_price: costPrice,

        selling_price: sellingPrice,

        current_price: sellingPrice,

        competitor_price: competitorPrice,

        stock_level: stockLevel,

        image_url: currentProduct.image_url || "",
      };

      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/products/${currentProduct.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProductData),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();

          throw new Error(
            `Failed to update product: ${res.status} ${errorText}`
          );
        }

        const updatedProduct: Product =
          await res.json();

        setProducts((prev) =>
          prev.map((product) =>
            product.id === updatedProduct.id
              ? updatedProduct
              : product
          )
        );

        setIsModalOpen(false);
      } catch (err) {
        console.error(
          "Unable to update product:",
          err
        );

        alert(
          "Unable to update the product. Please make sure the backend is running."
        );
      }
    }
  };

  /*
   * Delete Product
   */
  const handleDeleteProduct = async (
    id: number,
    name: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/products/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorText = await res.text();

        throw new Error(
          `Failed to delete product: ${res.status} ${errorText}`
        );
      }

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    } catch (err) {
      console.error(
        "Unable to delete product:",
        err
      );

      alert(
        "Unable to delete the product. Please make sure the backend is running."
      );
    }
  };

  /*
   * Normalize categories from DummyJSON.
   */
  const normalizeCat = (rawCat: string) => {
    const c = (rawCat || "")
      .toLowerCase()
      .trim();

    if (
      [
        "smartphones",
        "laptops",
        "tablets",
        "mobile-accessories",
        "electronics",
      ].includes(c)
    ) {
      return "Electronics";
    }

    if (
      [
        "mens-shirts",
        "mens-shoes",
        "mens-watches",
        "womens-dresses",
        "womens-shoes",
        "womens-watches",
        "womens-bags",
        "womens-jewellery",
        "sunglasses",
        "tops",
        "apparel",
        "clothing",
      ].includes(c)
    ) {
      return "Apparel";
    }

    if (
      [
        "fragrances",
        "fragrance",
        "perfume",
        "perfumes",
      ].includes(c)
    ) {
      return "Fragrances";
    }

    if (
      [
        "beauty",
        "skin-care",
        "cosmetics",
      ].includes(c)
    ) {
      return "Beauty";
    }

    if (
      [
        "furniture",
        "home-decoration",
        "kitchen-accessories",
      ].includes(c)
    ) {
      return "Furniture";
    }

    return rawCat;
  };

  /*
   * Filter products by category and search.
   */
  const filteredProducts = products.filter(
    (prod) => {
      const prodCat = normalizeCat(prod.category);

      const matchesCategory =
        selectedCategory === "All" ||
        prodCat.toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === "" ||
        prod.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        prodCat
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      return (
        matchesCategory && matchesSearch
      );
    }
  );

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products & Pricing Catalog
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh Catalog
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />

            Add Product
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(cat)
              }
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />

          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-xl border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />

          <p className="text-slate-600 font-medium text-xs">
            No products found for this
            category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((prod) => {
            const ourPrice = Number(
              prod.selling_price ||
                prod.current_price ||
                0
            );

            const compPrice = Number(
              prod.competitor_price ||
                ourPrice * 1.02
            );

            const optPrice = Number(
              (
                ourPrice * 0.96
              ).toFixed(2)
            );

            const categoryBadge =
              normalizeCat(prod.category);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="h-44 bg-slate-50 rounded-xl relative overflow-hidden flex items-center justify-center p-3 mb-3">
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-slate-300" />
                    )}

                    <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {categoryBadge}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3 className="font-bold text-slate-900 text-xs line-clamp-1">
                    {prod.name}
                  </h3>

                  {/* SKU */}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {prod.sku ||
                      `SKU-${1000 + prod.id}`}
                  </p>

                  {/* Dual Price Row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">
                        OUR PRICE
                      </span>

                      <span className="font-extrabold text-slate-900 mt-0.5 block">
                        ${ourPrice.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">
                        OPTIMAL PRICE
                      </span>

                      <span className="font-extrabold text-emerald-600 mt-0.5 block">
                        ${optPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>
                      Benchmark: $
                      {compPrice.toFixed(2)}
                    </span>

                    <span>
                      Stock: {prod.stock_level}
                    </span>
                  </div>

                  {/* Demand Badge */}
                  <div className="mt-2.5 bg-emerald-50 text-emerald-700 py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 border border-emerald-100">
                    <TrendingUp className="w-3 h-3" />

                    Increasing Demand
                  </div>
                </div>

                {/* Edit & Delete */}
                <div className="flex justify-end gap-3 pt-3 mt-3 border-t border-slate-100 text-xs font-semibold">
                  <button
                    onClick={() =>
                      handleOpenEditModal(
                        prod
                      )
                    }
                    className="text-slate-500 hover:text-blue-600 transition flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" />

                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteProduct(
                        prod.id,
                        prod.name
                      )
                    }
                    className="text-slate-500 hover:text-rose-600 transition flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3 h-3" />

                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95">
            {/* Close */}
            <button
              onClick={() =>
                setIsModalOpen(false)
              }
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {modalMode === "create"
                ? "Add New Product"
                : "Edit Product"}
            </h2>

            <form
              onSubmit={handleSaveProduct}
              className="space-y-3.5 text-xs"
            >
              {/* Product Title */}
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Product Title
                </label>

                <input
                  type="text"
                  required
                  value={
                    currentProduct.name
                  }
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Chanel Coco Noir"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-slate-200 text-xs font-semibold"
                />
              </div>

              {/* Category + Stock */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Category
                  </label>

                  <select
                    value={
                      currentProduct.category ||
                      "Electronics"
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        category:
                          e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Electronics">
                      Electronics
                    </option>

                    <option value="Apparel">
                      Apparel
                    </option>

                    <option value="Fragrances">
                      Fragrances
                    </option>

                    <option value="Beauty">
                      Beauty
                    </option>

                    <option value="Furniture">
                      Furniture
                    </option>
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Stock Units
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      currentProduct.stock_level
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,

                        /*
                         * Keep empty when the user
                         * deletes the value.
                         */
                        stock_level:
                          e.target.value === ""
                            ? ""
                            : Number(
                                e.target.value
                              ),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-3 gap-3">
                {/* Cost */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Cost ($)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      currentProduct.cost_price
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,

                        /*
                         * IMPORTANT:
                         * Do not use parseFloat() || 0 here.
                         *
                         * Keep the input as a string while
                         * the user is typing.
                         */
                        cost_price:
                          e.target.value === ""
                            ? ""
                            : e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Price ($)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={
                      currentProduct.selling_price
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,

                        /*
                         * Keep empty instead of converting
                         * immediately to 0.
                         */
                        selling_price:
                          e.target.value === ""
                            ? ""
                            : e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Competitor Price */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Comp. ($)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      currentProduct.competitor_price
                    }
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,

                        /*
                         * Keep empty while typing.
                         */
                        competitor_price:
                          e.target.value === ""
                            ? ""
                            : e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Image URL (Optional)
                </label>

                <input
                  type="text"
                  value={
                    currentProduct.image_url
                  }
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      image_url:
                        e.target.value,
                    })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-slate-200 text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold shadow-sm"
                >
                  {modalMode === "create"
                    ? "Add Product"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}