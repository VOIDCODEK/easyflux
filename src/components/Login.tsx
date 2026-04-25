import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Building2, Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const login = useStore(state => state.login);
  const addCompany = useStore(state => state.addCompany);
  const setCurrentCompany = useStore(state => state.setCurrentCompany);
  const companies = useStore(state => state.companies);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    const mockUser = {
      id: Math.random().toString(36).substring(7),
      email,
      name: isRegistering ? name : email.split('@')[0],
    };

    if (isRegistering) {
      addCompany({
        id: Math.random().toString(36).substring(7),
        name: companyName,
        primaryColor: '#3b82f6',
        businessType: 'Serviços',
      });
    }

    login(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-2 shadow-blue-200 shadow-lg">
            <Building2 size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isRegistering ? 'Criar sua conta' : 'Acessar o sistema'}
          </CardTitle>
          <CardDescription>
            {isRegistering 
              ? 'Preencha os dados abaixo para começar' 
              : 'Entre com suas credenciais para continuar'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input 
                      id="name" 
                      placeholder="Seu nome" 
                      className="pl-10" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Nome da Empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input 
                      id="company" 
                      placeholder="Ex: Lava Jato Express" 
                      className="pl-10" 
                      required 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  className="pl-10" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {!isRegistering && (
                  <Button variant="link" className="p-0 h-auto text-xs text-blue-600">
                    Esqueceu a senha?
                  </Button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold" type="submit">
              {isRegistering ? 'Cadastrar agora' : 'Entrar no sistema'}
            </Button>
            <div className="text-center text-sm text-slate-500">
              {isRegistering ? 'Já possui uma conta?' : 'Ainda não tem conta?'}
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-1 text-blue-600 font-semibold hover:underline"
              >
                {isRegistering ? 'Entrar' : 'Cadastre-se'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
