import { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async (userId, userType) => {
    setLoading(true);
    try {
      const query = supabase
        .from('payments')
        .select('*, payment_milestones(*), proyectos(*)')
        .order('created_at', { ascending: false });

      if (userType === 'cliente') {
        query.eq('cliente_id', userId);
      } else if (userType === 'instalador') {
        query.eq('instalador_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPayments(data);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPaymentUpdates = (paymentId) => {
    const subscription = supabase
      .channel(`payment-${paymentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payments',
        filter: `id=eq.${paymentId}`
      }, (payload) => {
        setPayments(prev => prev.map(p =>
          p.id === payload.new.id ? { ...p, ...payload.new } : p
        ));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'payment_milestones',
        filter: `payment_id=eq.${paymentId}`
      }, (payload) => {
        setPayments(prev => prev.map(p => {
          if (p.id === paymentId) {
            return {
              ...p,
              payment_milestones: p.payment_milestones.map(m =>
                m.id === payload.new.id ? payload.new : m
              )
            };
          }
          return p;
        }));
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  return (
    <PaymentContext.Provider value={{
      payments,
      loading,
      fetchPayments,
      subscribeToPaymentUpdates
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);