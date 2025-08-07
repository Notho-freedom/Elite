// Elite Coin Store - Version simplifiée pour éviter les dépendances
import { useState, useEffect } from 'react';

// Types de transactions
export const TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  EARN: 'earn',
  SPEND: 'spend',
  WITHDRAW: 'withdraw',
  TRANSFER: 'transfer',
  REFUND: 'refund',
  BONUS: 'bonus',
  PENALTY: 'penalty'
};

// Statuts de transaction
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Méthodes de paiement
export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  BANK: 'bank',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  CRYPTO: 'crypto'
};

// État initial
const initialState = {
  wallet: {
    balance: 150,
    pendingBalance: 0,
    totalEarned: 850,
    totalSpent: 700,
    level: 'Gold',
    vipStatus: true,
    lastUpdated: Date.now()
  },
  
  transactions: [
    {
      id: '1',
      type: TRANSACTION_TYPES.PURCHASE,
      amount: 100,
      status: TRANSACTION_STATUS.COMPLETED,
      description: 'Achat de 100 Elite-Coins',
      date: new Date(Date.now() - 86400000).toISOString(),
      method: PAYMENT_METHODS.CARD,
      reference: 'PAY_001',
      metadata: { package: 'starter' }
    },
    {
      id: '2',
      type: TRANSACTION_TYPES.SPEND,
      amount: -25,
      status: TRANSACTION_STATUS.COMPLETED,
      description: 'Accès Instant-Room "Tech Talk"',
      date: new Date(Date.now() - 43200000).toISOString(),
      reference: 'ROOM_001',
      metadata: { roomId: 'tech_talk_room' }
    },
    {
      id: '3',
      type: TRANSACTION_TYPES.EARN,
      amount: 50,
      status: TRANSACTION_STATUS.COMPLETED,
      description: 'Bonus de parrainage',
      date: new Date(Date.now() - 21600000).toISOString(),
      reference: 'REF_001',
      metadata: { referredUser: 'john_doe' }
    },
    {
      id: '4',
      type: TRANSACTION_TYPES.TRANSFER,
      amount: -75,
      status: TRANSACTION_STATUS.COMPLETED,
      description: 'Transfert vers Alice Martin',
      date: new Date(Date.now() - 10800000).toISOString(),
      reference: 'TRF_001',
      metadata: { toUserId: 'alice_martin', toUserName: 'Alice Martin' }
    },
    {
      id: '5',
      type: TRANSACTION_TYPES.PURCHASE,
      amount: 50,
      status: TRANSACTION_STATUS.PENDING,
      description: 'Achat de 50 Elite-Coins',
      date: new Date().toISOString(),
      method: PAYMENT_METHODS.PAYPAL,
      reference: 'PAY_002',
      metadata: { package: 'mini' }
    }
  ],
  
  packages: [
    {
      id: 'mini',
      name: 'Mini Pack',
      coins: 50,
      price: 4.99,
      currency: 'EUR',
      bonus: 0,
      popular: false,
      description: 'Parfait pour commencer'
    },
    {
      id: 'starter',
      name: 'Starter Pack',
      coins: 100,
      price: 9.99,
      currency: 'EUR',
      bonus: 10,
      popular: false,
      description: 'Le plus choisi par nos utilisateurs'
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      coins: 250,
      price: 19.99,
      currency: 'EUR',
      bonus: 50,
      popular: true,
      description: 'Meilleur rapport qualité-prix'
    },
    {
      id: 'elite',
      name: 'Elite Pack',
      coins: 500,
      price: 39.99,
      currency: 'EUR',
      bonus: 150,
      popular: false,
      description: 'Pour les utilisateurs VIP'
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      coins: 1000,
      price: 79.99,
      currency: 'EUR',
      bonus: 400,
      popular: false,
      description: 'Pack exclusif Elite'
    }
  ],
  
  withdrawalSettings: {
    minAmount: 10,
    maxAmount: 1000,
    feePercentage: 5,
    processingTime: '2-5 jours ouvrés',
    methods: [PAYMENT_METHODS.PAYPAL, PAYMENT_METHODS.BANK]
  }
};

// État global
let globalState = JSON.parse(localStorage.getItem('elite-coin-store')) || initialState;

// Listeners
let listeners = [];

// Notifier les listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener(globalState));
};

// Sauvegarder
const saveState = () => {
  localStorage.setItem('elite-coin-store', JSON.stringify(globalState));
};

// Actions
const eliteCoinActions = {
  updateBalance: (amount, type = TRANSACTION_TYPES.SPEND) => {
    const newBalance = globalState.wallet.balance + amount;
    if (newBalance < 0 && type === TRANSACTION_TYPES.SPEND) {
      return;
    }
    
    globalState.wallet = {
      ...globalState.wallet,
      balance: Math.max(0, newBalance),
      totalEarned: amount > 0 ? globalState.wallet.totalEarned + amount : globalState.wallet.totalEarned,
      totalSpent: amount < 0 ? globalState.wallet.totalSpent + Math.abs(amount) : globalState.wallet.totalSpent,
      lastUpdated: Date.now()
    };
    
    saveState();
    notifyListeners();
  },

  addTransaction: (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString(),
      status: transaction.status || TRANSACTION_STATUS.PENDING
    };
    
    globalState.transactions = [newTransaction, ...globalState.transactions];
    saveState();
    notifyListeners();
    return newTransaction;
  },

  purchaseCoins: async (packageId) => {
    const package_ = globalState.packages.find(p => p.id === packageId);
    
    if (!package_) {
      throw new Error('Package non trouvé');
    }
    
    const transaction = {
      type: TRANSACTION_TYPES.PURCHASE,
      amount: package_.coins + package_.bonus,
      description: `Achat de ${package_.coins} Elite-Coins + ${package_.bonus} bonus`,
      method: PAYMENT_METHODS.CARD,
      reference: `PAY_${Date.now()}`,
      metadata: { 
        package: packageId,
        price: package_.price,
        currency: package_.currency
      }
    };
    
    eliteCoinActions.addTransaction(transaction);
    
    setTimeout(() => {
      const txIndex = globalState.transactions.findIndex(t => t.reference === transaction.reference);
      
      if (txIndex !== -1) {
        globalState.transactions[txIndex] = {
          ...globalState.transactions[txIndex],
          status: TRANSACTION_STATUS.COMPLETED
        };
        
        globalState.wallet = {
          ...globalState.wallet,
          balance: globalState.wallet.balance + (package_.coins + package_.bonus),
          totalEarned: globalState.wallet.totalEarned + (package_.coins + package_.bonus),
          lastUpdated: Date.now()
        };
        
        saveState();
        notifyListeners();
      }
    }, 2000);
    
    return transaction;
  },

  withdrawCoins: async (amount, method = PAYMENT_METHODS.PAYPAL) => {
    if (amount < globalState.withdrawalSettings.minAmount) {
      throw new Error(`Montant minimum: ${globalState.withdrawalSettings.minAmount} coins`);
    }
    
    if (amount > globalState.withdrawalSettings.maxAmount) {
      throw new Error(`Montant maximum: ${globalState.withdrawalSettings.maxAmount} coins`);
    }
    
    if (amount > globalState.wallet.balance) {
      throw new Error('Solde insuffisant');
    }
    
    const fee = Math.round(amount * (globalState.withdrawalSettings.feePercentage / 100));
    const netAmount = amount - fee;
    
    const transaction = {
      type: TRANSACTION_TYPES.WITHDRAW,
      amount: -amount,
      description: `Retrait de ${amount} coins (net: ${netAmount}, frais: ${fee})`,
      method,
      reference: `WTH_${Date.now()}`,
      metadata: { 
        netAmount,
        fee,
        processingTime: globalState.withdrawalSettings.processingTime
      }
    };
    
    eliteCoinActions.addTransaction(transaction);
    eliteCoinActions.updateBalance(-amount, TRANSACTION_TYPES.WITHDRAW);
    
    return transaction;
  },

  transferCoins: async (amount, toUserId, toUserName) => {
    if (amount > globalState.wallet.balance) {
      throw new Error('Solde insuffisant');
    }
    
    if (amount < 1) {
      throw new Error('Montant minimum: 1 coin');
    }
    
    const transaction = {
      type: TRANSACTION_TYPES.TRANSFER,
      amount: -amount,
      description: `Transfert vers ${toUserName}`,
      reference: `TRF_${Date.now()}`,
      metadata: { toUserId, toUserName }
    };
    
    eliteCoinActions.addTransaction(transaction);
    eliteCoinActions.updateBalance(-amount, TRANSACTION_TYPES.TRANSFER);
    
    return transaction;
  },

  spendCoins: async (amount, description, metadata = {}) => {
    if (amount > globalState.wallet.balance) {
      throw new Error('Solde insuffisant');
    }
    
    const transaction = {
      type: TRANSACTION_TYPES.SPEND,
      amount: -amount,
      description,
      reference: `SPD_${Date.now()}`,
      metadata
    };
    
    eliteCoinActions.addTransaction(transaction);
    eliteCoinActions.updateBalance(-amount, TRANSACTION_TYPES.SPEND);
    
    return transaction;
  },

  earnCoins: async (amount, description, metadata = {}) => {
    const transaction = {
      type: TRANSACTION_TYPES.EARN,
      amount,
      description,
      reference: `ERN_${Date.now()}`,
      metadata,
      status: TRANSACTION_STATUS.COMPLETED
    };
    
    eliteCoinActions.addTransaction(transaction);
    eliteCoinActions.updateBalance(amount, TRANSACTION_TYPES.EARN);
    
    return transaction;
  },

  getStats: () => {
    const now = new Date();
    const thisMonth = globalState.transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    });
    
    return {
      balance: globalState.wallet.balance,
      totalEarned: globalState.wallet.totalEarned,
      totalSpent: globalState.wallet.totalSpent,
      monthlyEarned: thisMonth
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      monthlySpent: thisMonth
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactionCount: globalState.transactions.length,
      level: globalState.wallet.level,
      vipStatus: globalState.wallet.vipStatus
    };
  },

  reset: () => {
    globalState = {
      ...initialState,
      wallet: {
        ...initialState.wallet,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        level: 'Bronze',
        vipStatus: false,
        lastUpdated: Date.now()
      },
      transactions: []
    };
    saveState();
    notifyListeners();
  }
};

// Hook React pour s'abonner aux changements
export const useEliteCoinStore = () => {
  const [state, setState] = useState(globalState);
  
  useEffect(() => {
    const unsubscribe = (newState) => {
      setState({ ...newState });
    };
    
    listeners.push(unsubscribe);
    
    return () => {
      listeners = listeners.filter(l => l !== unsubscribe);
    };
  }, []);
  
  return state;
};

// Hook personnalisé pour les actions de coins
export const useEliteCoins = () => {
  const store = useEliteCoinStore();
  
  return {
    // État
    wallet: store.wallet,
    transactions: store.transactions,
    packages: store.packages,
    withdrawalSettings: store.withdrawalSettings,
    
    // Actions
    purchaseCoins: eliteCoinActions.purchaseCoins,
    withdrawCoins: eliteCoinActions.withdrawCoins,
    transferCoins: eliteCoinActions.transferCoins,
    spendCoins: eliteCoinActions.spendCoins,
    earnCoins: eliteCoinActions.earnCoins,
    updateBalance: eliteCoinActions.updateBalance,
    addTransaction: eliteCoinActions.addTransaction,
    
    // Utilitaires
    getStats: eliteCoinActions.getStats,
    reset: eliteCoinActions.reset,
    
    // Vérifications
    canAfford: (amount) => store.wallet.balance >= amount,
    hasMinimumForWithdrawal: () => store.wallet.balance >= store.withdrawalSettings.minAmount,
  };
};

export default useEliteCoinStore;