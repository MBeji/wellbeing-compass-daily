import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Cloud, CloudOff, User, UserPlus } from 'lucide-react';

interface AuthComponentProps {
  onClose?: () => void;
}

const AuthComponent = ({ onClose }: AuthComponentProps) => {
  const { user, loading, error, signInAnonymous, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'anonymous'>('anonymous');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (loading) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connexion en cours...</span>
        </div>
      </Card>
    );
  }

  if (user) {
    return (
      <Card className="p-6 max-w-md mx-auto bg-green-50 border-green-200">
        <div className="text-center">
          <Cloud className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-green-800 mb-2">Connecté au Cloud</h3>
          <p className="text-sm text-green-700 mb-4">
            Vos données sont synchronisées automatiquement
          </p>
          <p className="text-xs text-green-600 mb-4">
            {user.email || `Utilisateur anonyme: ${user.uid.slice(0, 8)}`}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={signOut}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Se déconnecter
            </Button>
            {onClose && (
              <Button 
                onClick={onClose}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
              >
                Fermer
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'anonymous') {
        await signInAnonymous();
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password);
      }
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <CloudOff className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-800 mb-2">Synchronisation Cloud</h3>
        <p className="text-sm text-gray-600">
          Connectez-vous pour synchroniser vos données sur tous vos appareils
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode !== 'anonymous' && (
          <>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          {mode === 'anonymous' && (
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <User className="w-4 h-4 mr-2" />
              Connexion anonyme (recommandé)
            </Button>
          )}
          
          {mode === 'signin' && (
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
              Se connecter
            </Button>
          )}
          
          {mode === 'signup' && (
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Créer un compte
            </Button>
          )}
        </div>
      </form>

      <div className="mt-4 space-y-2 text-center">
        {mode === 'anonymous' && (
          <>
            <Button 
              type="button" 
              onClick={() => setMode('signin')}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              J'ai déjà un compte
            </Button>
            <Button 
              type="button" 
              onClick={() => setMode('signup')}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Créer un compte email
            </Button>
          </>
        )}
        
        {(mode === 'signin' || mode === 'signup') && (
          <Button 
            type="button" 
            onClick={() => setMode('anonymous')}
            className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Connexion anonyme
          </Button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Vos données restent privées et chiffrées</p>
        <p>☁️ Synchronisation automatique entre appareils</p>
      </div>
    </Card>
  );
};

export default AuthComponent;
