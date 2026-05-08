"use client";

import React, { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useCollection, useCollectionActions } from "@/hooks/use-collection";
import CollectionTable from "./CollectionTable";
import CollectionModal from "./CollectionModal";

export function CollectionListModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: collections, isLoading, mutate } = useCollection({ search: searchQuery });
  const { deleteCollection } = useCollectionActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);

  const handleCreate = () => {
    setSelectedCollection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (collection: any) => {
    setSelectedCollection(collection);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ sưu tập này?")) {
      await deleteCollection(id);
    }
  };

  const filteredCollections = Array.isArray(collections)
    ? collections.filter((c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Bộ sưu tập</h1>
          <p className="text-slate-500 font-medium text-sm">Quản lý các nhóm sản phẩm theo chủ đề hoặc mùa</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Tạo bộ sưu tập
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ sưu tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CollectionTable
          collections={filteredCollections}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collection={selectedCollection}
        onSuccess={mutate}
      />
    </div>
  );
}
