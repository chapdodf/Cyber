"use client";
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState, useRef } from 'react';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaBox, FaEnvelope, FaChartLine, FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import ApiService from '@/lib/api';
import ProtectedRoute from "@/components/ProtectedRoute";

interface Statistics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  nome: string;
  preco: number;
  status: string;
  createdAt: string;
  destaque?: boolean;
}

interface Categoria {
  id: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateFormData {
  nome: string;
  descricao: string;
  preco: number;
  preco1d: number;
  preco7d: number;
  preco30d: number;
  precoLifetime: number;
  tipoUso: string;
  status: string;
  imagem: File | null;
  categoriaId: string;
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emailMsg, setEmailMsg] = useState('');
  const nomeRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', text: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>({
    nome: '',
    descricao: '',
    preco: 0,
    preco1d: 0,
    preco7d: 0,
    preco30d: 0,
    precoLifetime: 0,
    tipoUso: 'lifetime',
    status: 'ativo',
    imagem: null,
    categoriaId: ''
  });
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryMsg, setCategoryMsg] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user?.token) {
      fetchData();
    }
  }, [isAuthenticated, user?.token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, usersResponse, productsResponse] = await Promise.all([
        ApiService.getAdminStats(user!.token),
        ApiService.getAdminUsers(user!.token),
        ApiService.getAdminProducts(user!.token),
      ]);

      if (statsResponse.error) {
        setError(statsResponse.error);
        return;
      }

      if (usersResponse.error) {
        setError(usersResponse.error);
        return;
      }

      if (productsResponse.error) {
        setError(productsResponse.error);
        return;
      }

      setStatistics(statsResponse.data);
      setUsers(usersResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    if (!user?.token) return;
    
    try {
      const response = await ApiService.getAdminCategories(user.token);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      setCategorias(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar categorias');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl mb-4">Erro</h1>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Envio de e-mail
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    try {
      const response = await ApiService.sendEmail(user.token, emailForm);

      if (response.error) {
        setEmailMsg(response.error);
        return;
      }

      setEmailMsg('E-mail enviado com sucesso!');
      setEmailForm({ to: '', subject: '', text: '' });
    } catch (error) {
      console.error('Erro:', error);
      setEmailMsg(error instanceof Error ? error.message : 'Erro ao enviar e-mail');
    }
  };

  // Toggle admin status
  const toggleAdmin = async (userId: string) => {
    if (!user?.token) return;

    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const response = await ApiService.toggleUserAdmin(user.token, userId, !userToUpdate.isAdmin);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Atualizar lista de usuários
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
      ));
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      // Validar campos obrigatórios
      const camposObrigatorios = ['nome', 'preco', 'tipoUso'] as const;
      const camposFaltando = camposObrigatorios.filter(campo => !createForm[campo]);
      
      if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
      }

      // Validar imagem
      if (!createForm.imagem) {
        throw new Error('Por favor, selecione uma imagem para o produto');
      }

      const formData = new FormData();
      formData.append('nome', createForm.nome);
      formData.append('preco', createForm.preco.toString());
      formData.append('tipoUso', createForm.tipoUso);
      formData.append('file', createForm.imagem);

      // Adicionar todos os campos de preço, mesmo que vazios
      formData.append('preco1d', createForm.preco1d.toString());
      formData.append('preco7d', createForm.preco7d.toString());
      formData.append('preco30d', createForm.preco30d.toString());
      formData.append('precoLifetime', createForm.precoLifetime.toString());

      // Adicionar campos opcionais
      if (createForm.descricao) formData.append('descricao', createForm.descricao);
      if (createForm.categoriaId) formData.append('categoriaId', createForm.categoriaId);
      if (createForm.status) formData.append('status', createForm.status);

      const response = await ApiService.createProduct(user.token, formData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Limpar formulário
      setCreateForm({
        nome: '',
        descricao: '',
        preco: 0,
        preco1d: 0,
        preco7d: 0,
        preco30d: 0,
        precoLifetime: 0,
        tipoUso: 'lifetime',
        status: 'ativo',
        imagem: null,
        categoriaId: ''
      });

      // Fechar modal
      setShowCreateModal(false);

      // Atualizar lista de produtos
      fetchData();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao criar produto');
      }
    }
  };

  // Atualizar os handlers de input para converter strings em números
  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreateForm(prev => ({
      ...prev,
      preco: value ? parseFloat(value) : 0
    }));
  };

  const handlePreco1dChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreateForm(prev => ({
      ...prev,
      preco1d: value ? parseFloat(value) : 0
    }));
  };

  const handlePreco7dChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreateForm(prev => ({
      ...prev,
      preco7d: value ? parseFloat(value) : 0
    }));
  };

  const handlePreco30dChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreateForm(prev => ({
      ...prev,
      preco30d: value ? parseFloat(value) : 0
    }));
  };

  const handlePrecoLifetimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCreateForm(prev => ({
      ...prev,
      precoLifetime: value ? parseFloat(value) : 0
    }));
  };

  // Função para excluir produto
  async function handleDeleteProduct(productId: number) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    
    if (!user?.token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      const response = await ApiService.deleteProduct(user.token, productId);

      if (response.error) {
        throw new Error(response.error);
      }

      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir produto');
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryMsg('');
    setCategoryLoading(true);
    
    if (!user?.token) {
      setCategoryMsg('Usuário não autenticado');
      setCategoryLoading(false);
      return;
    }

    try {
      const response = await ApiService.createCategory(user.token, categoryName);

      if (response.error) {
        throw new Error(response.error);
      }

      setCategoryMsg('Categoria criada com sucesso!');
      setCategoryName('');
      fetchCategorias();
    } catch (err) {
      setCategoryMsg(err instanceof Error ? err.message : 'Erro ao criar categoria');
    } finally {
      setCategoryLoading(false);
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-[#0a0a1a] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl cyber-glow mb-8 text-center">Painel de Administração</h1>
          
          {/* Tabs */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'bg-[#39ff14] text-black' : 'bg-[#181828]'
              }`}
            >
              <FaChartLine /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'users' ? 'bg-[#39ff14] text-black' : 'bg-[#181828]'
              }`}
            >
              <FaUsers /> Usuários
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'products' ? 'bg-[#39ff14] text-black' : 'bg-[#181828]'
              }`}
            >
              <FaBox /> Produtos
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'email' ? 'bg-[#39ff14] text-black' : 'bg-[#181828]'
              }`}
            >
              <FaEnvelope /> E-mail
            </button>
          </div>

          {/* Conteúdo */}
          <div className="space-y-8">
            {/* Dashboard */}
            {activeTab === 'dashboard' && statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#181828] p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-4">
                    <FaUsers className="text-3xl text-[#39ff14]" />
                    <div>
                      <h3 className="text-lg font-semibold">Total de Usuários</h3>
                      <p className="text-2xl">{statistics.totalUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#181828] p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-4">
                    <FaShoppingCart className="text-3xl text-[#39ff14]" />
                    <div>
                      <h3 className="text-lg font-semibold">Total de Pedidos</h3>
                      <p className="text-2xl">{statistics.totalOrders}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#181828] p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-4">
                    <FaMoneyBillWave className="text-3xl text-[#39ff14]" />
                    <div>
                      <h3 className="text-lg font-semibold">Receita Total</h3>
                      <p className="text-2xl">R$ {statistics.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#181828] p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-4">
                    <FaBox className="text-3xl text-[#39ff14]" />
                    <div>
                      <h3 className="text-lg font-semibold">Total de Produtos</h3>
                      <p className="text-2xl">{statistics.totalProducts}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Usuários */}
            {activeTab === 'users' && (
              <div className="bg-[#181828] rounded-lg shadow-lg p-6">
                <h2 className="text-2xl mb-4">Gerenciar Usuários</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#39ff14]/30">
                        <th className="text-left p-4">ID</th>
                        <th className="text-left p-4">Username</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Admin</th>
                        <th className="text-left p-4">Data de Registro</th>
                        <th className="text-left p-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-[#39ff14]/10">
                          <td className="p-4">{u.id}</td>
                          <td className="p-4">{u.username}</td>
                          <td className="p-4">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded ${
                              u.isAdmin ? 'bg-[#39ff14] text-black' : 'bg-gray-600'
                            }`}>
                              {u.isAdmin ? 'Sim' : 'Não'}
                            </span>
                          </td>
                          <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleAdmin(u.id)}
                              className={`px-3 py-1 rounded ${
                                u.isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-[#39ff14] hover:bg-[#39ff14]/80 text-black'
                              }`}
                            >
                              {u.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Produtos */}
            {activeTab === 'products' && (
              <div className="space-y-8">
                <div className="bg-[#181828] rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl">Lista de Produtos</h2>
                    <div className="flex gap-2">
                      <button
                        className="cyber-btn flex items-center gap-2 bg-[#39ff14] text-black hover:bg-[#8f00ff] hover:text-white transition-all duration-200"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <FaPlus /> Criar Produto
                      </button>
                      <button
                        className="cyber-btn flex items-center gap-2 bg-[#00eaff] text-black hover:bg-[#8f00ff] hover:text-white transition-all duration-200"
                        onClick={() => setShowCreateCategoryModal(true)}
                      >
                        + Criar Categoria
                      </button>
                    </div>
                  </div>
                  {/* Modal de criação de produto */}
                  {showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                      <div className="bg-[#181828] rounded-lg shadow-2xl p-8 border border-[#39ff14]/40 w-full max-w-md relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-2 right-2 text-[#39ff14] text-xl">×</button>
                        <h3 className="text-2xl cyber-glow mb-4 text-center">Novo Produto</h3>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                          <div>
                            <label className="block text-sm mb-1">Nome</label>
                            <input type="text" required className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono" value={createForm.nome} onChange={e => setCreateForm(f => ({ ...f, nome: e.target.value }))} />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Preço Base</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={createForm.preco}
                              onChange={handlePrecoChange}
                              className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Tipo de Uso</label>
                            <select 
                              className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono" 
                              value={createForm.tipoUso} 
                              onChange={e => setCreateForm(f => ({ ...f, tipoUso: e.target.value }))} 
                              required
                            >
                              <option value="1d">1 Dia</option>
                              <option value="7d">7 Dias</option>
                              <option value="30d">30 Dias</option>
                              <option value="lifetime">Lifetime</option>
                            </select>
                          </div>
                          {createForm.tipoUso !== 'lifetime' && (
                            <>
                              <div>
                                <label className="block text-sm mb-1">Preço 1 Dia</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={createForm.preco1d}
                                  onChange={handlePreco1dChange}
                                  className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">Preço 7 Dias</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={createForm.preco7d}
                                  onChange={handlePreco7dChange}
                                  className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">Preço 30 Dias</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={createForm.preco30d}
                                  onChange={handlePreco30dChange}
                                  className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono"
                                />
                              </div>
                            </>
                          )}
                          <div>
                            <label className="block text-sm mb-1">Preço Lifetime</label>
                            <input
                              type="number"
                              step="0.01"
                              value={createForm.precoLifetime}
                              onChange={handlePrecoLifetimeChange}
                              className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Status</label>
                            <select className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono" value={createForm.status} onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))} required>
                              <option value="ATIVO">ATIVO</option>
                              <option value="INATIVO">INATIVO</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Descrição</label>
                            <textarea className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono" value={createForm.descricao} onChange={e => setCreateForm(f => ({ ...f, descricao: e.target.value }))} />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Imagem do Produto
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              required
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setCreateForm(prev => ({ ...prev, imagem: file }));
                                }
                              }}
                              className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Categoria</label>
                            <select
                              className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono"
                              value={createForm.categoriaId || ''}
                              onChange={e => setCreateForm(f => ({ ...f, categoriaId: e.target.value }))}
                            >
                              <option value="">Selecione uma categoria</option>
                              {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button type="submit" className="cyber-btn w-full mt-2">Salvar</button>
                        </form>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                      <div key={p.id} className="bg-[#0a0a1a] rounded-lg p-4 border border-[#39ff14]/30 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{p.nome}</h3>
                          <p className="text-gray-400 mb-2">Preço: R$ {p.preco.toFixed(2)}</p>
                          <p className="text-gray-400 mb-2">
                            Status:
                            <span className={`ml-2 px-2 py-1 rounded ${p.status === 'ATIVO' ? 'bg-green-500' : 'bg-red-500'}`}>{p.status}</span>
                          </p>
                          <p className="text-gray-400 mb-4">Criado em: {new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Link
                            href={`/admin/produtos/${p.id}`}
                            className="cyber-btn bg-[#39ff14] text-black hover:bg-[#8f00ff] hover:text-white px-4 py-1 rounded flex items-center justify-center"
                          >
                            Editar
                          </Link>
                          <button
                            className="cyber-btn bg-red-500 text-white hover:bg-red-600 px-4 py-1 rounded"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Modal de criação de categoria */}
                  {showCreateCategoryModal && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                      <div className="bg-[#181828] rounded-lg shadow-2xl p-8 border border-[#39ff14]/40 w-full max-w-md relative">
                        <button onClick={() => setShowCreateCategoryModal(false)} className="absolute top-2 right-2 text-[#39ff14] text-xl">×</button>
                        <h3 className="text-2xl cyber-glow mb-4 text-center">Nova Categoria</h3>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                          <input
                            type="text"
                            placeholder="Nome da categoria"
                            value={categoryName}
                            onChange={e => setCategoryName(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-black/80 border border-[#39ff14] text-[#39ff14] font-mono"
                          />
                          <button type="submit" className="cyber-btn w-full" disabled={categoryLoading}>
                            {categoryLoading ? 'Salvando...' : 'Salvar'}
                          </button>
                          {categoryMsg && <div className={categoryMsg.includes('sucesso') ? 'text-green-500' : 'text-red-500'}>{categoryMsg}</div>}
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            {activeTab === 'email' && (
              <div className="bg-[#181828] rounded-lg shadow-lg p-6">
                <h2 className="text-2xl mb-4">Enviar E-mail</h2>
                <form onSubmit={handleEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Para</label>
                    <input
                      type="email"
                      placeholder="Digite o e-mail do destinatário"
                      required
                      value={emailForm.to}
                      onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))}
                      className="w-full bg-[#0a0a1a] border border-[#39ff14] rounded px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Assunto</label>
                    <input
                      type="text"
                      placeholder="Digite o assunto do e-mail"
                      required
                      value={emailForm.subject}
                      onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full bg-[#0a0a1a] border border-[#39ff14] rounded px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mensagem</label>
                    <textarea
                      placeholder="Digite a mensagem"
                      required
                      value={emailForm.text}
                      onChange={e => setEmailForm(f => ({ ...f, text: e.target.value }))}
                      className="w-full bg-[#0a0a1a] border border-[#39ff14] rounded px-4 py-2 text-white h-32"
                    />
                  </div>
                  <button type="submit" className="cyber-btn w-full">
                    Enviar E-mail
                  </button>
                </form>
                {emailMsg && (
                  <p className={`mt-4 text-center ${emailMsg.includes('enviado') ? 'text-[#39ff14]' : 'text-red-500'}`}>
                    {emailMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
