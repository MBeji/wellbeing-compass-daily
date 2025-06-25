import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, Loader2, Settings, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseWellness } from '@/hooks/useFirebaseWellness';
import AuthComponent from './AuthComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const SyncStatus = () => {
  const { user } = useAuth();
  const { syncing, isOnline } = useFirebaseWellness();
  const [showAuth, setShowAuth] = useState(false);

  const getStatusInfo = () => {
    if (syncing) {
      return {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: "Synchronisation...",
        color: "text-blue-600 bg-blue-50 border-blue-200"
      };
    }
    
    if (user) {
      return {
        icon: <Cloud className="w-4 h-4" />,
        text: "Synchronisé",
        color: "text-green-600 bg-green-50 border-green-200"
      };
    }
    
    return {
      icon: <CloudOff className="w-4 h-4" />,
      text: "Local uniquement",
      color: "text-gray-600 bg-gray-50 border-gray-200"
    };
  };

  const status = getStatusInfo();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogTrigger asChild>
          <Button 
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium
              border shadow-sm hover:shadow-md transition-all
              ${status.color}
            `}
          >
            {status.icon}
            {status.text}
            {!user && <Settings className="w-3 h-3" />}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {user ? "Gestion du compte" : "Synchronisation Cloud"}
            </DialogTitle>
          </DialogHeader>
          <AuthComponent onClose={() => setShowAuth(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Indicateur de connectivité */}
      <div className="absolute -bottom-1 -right-1">
        {navigator.onLine ? (
          <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm" title="En ligne" />
        ) : (
          <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm" title="Hors ligne" />
        )}
      </div>
    </div>
  );
};

export default SyncStatus;
