const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cyber-one-virid.vercel.app';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

class ApiService {
  private static getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async login(payload: { username?: string; email?: string; password: string }): Promise<ApiResponse<any>> {
    try {
      console.log('Tentando login com payload:', payload);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (!response.ok) {
        console.error('Erro na resposta do login:', data);
        return { success: false, error: data.error || 'Erro ao fazer login' };
      }

      console.log('Login bem sucedido:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  }

  static async getAdminStats(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/estatisticas`, {
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          return { error: 'Acesso negado. Verifique suas permissões.' };
        }
        return { error: data.error || 'Erro ao buscar estatísticas' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async getAdminProducts(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/produtos`, {
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          return { error: 'Acesso negado. Verifique suas permissões.' };
        }
        return { error: data.error || 'Erro ao buscar produtos' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async getAdminUsers(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/usuarios`, {
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          return { error: 'Acesso negado. Verifique suas permissões.' };
        }
        return { error: data.error || 'Erro ao buscar usuários' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async getAdminCategories(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/categorias`, {
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          return { error: 'Acesso negado. Verifique suas permissões.' };
        }
        return { error: data.error || 'Erro ao buscar categorias' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async createCategory(token: string, nome: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/categorias`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ nome }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao criar categoria' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async createProduct(token: string, formData: FormData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/produtos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao criar produto' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async deleteProduct(token: string, productId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/produtos/${productId}`, {
        method: 'DELETE',
        headers: this.getHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao excluir produto' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async toggleUserAdmin(token: string, userId: string, isAdmin: boolean): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/usuarios/${userId}`, {
        method: 'PATCH',
        headers: this.getHeaders(token),
        body: JSON.stringify({ isAdmin }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao atualizar usuário' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  static async sendEmail(token: string, emailData: { to: string; subject: string; text: string }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/api/admin/email`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao enviar e-mail' };
      }

      return { data };
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }
}

export default ApiService; 
