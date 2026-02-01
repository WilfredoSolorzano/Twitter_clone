import React from 'react';

const Notifications = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notificações</h1>
      <div className="space-y-4">
        <div className="card p-4">
          <p className="text-gray-600">Você não tem notificações no momento.</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;