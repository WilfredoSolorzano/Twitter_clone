import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PostList from "../components/Posts/PostList";
import { authAPI } from "../services/api";

const Explore = () => {
  const [search, setSearch] = useState("");

  const { isAuthenticated } = useAuth();

  const loadUsers = useCallback(
    async (searchValue = "") => {
      if (!isAuthenticated) return;

      try {
        await authAPI.getUsers(
          searchValue ? { search: searchValue } : undefined,
        );

      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setTimeout(() => {
      loadUsers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, loadUsers, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold">Explorar</h1>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Feed de Posts - Centro */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Pesquisar posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-lg">Posts Recentes</h2>
              </div>
              <PostList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
