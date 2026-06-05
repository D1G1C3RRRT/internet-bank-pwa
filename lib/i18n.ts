// lib/i18n.ts

export type Language = 'en' | 'sk'

export const dictionaries = {
  en: {
    // Auth & Navigation
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    languages: 'Languages',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signInTitle: 'Sign In to your account',
    signUpTitle: 'Create a new account',
    
    // Dashboard
    totalBalance: 'Total Balance',
    yourAccounts: 'Your Accounts',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No transactions yet',
    noAccounts: "You haven't created any accounts yet",
    checkingAccount: 'Checking Account',
    savingsAccount: 'Savings Account',
    active: 'Active',
    inactive: 'Inactive',
    balance: 'Balance',
    
    // Actions
    addMoney: 'Add Money',
    sendMoney: 'Send Money',
    cancel: 'Cancel',
    deposit: 'Deposit',
    transfer: 'Transfer',
    
    // Forms & Modals
    addMoneyTitle: 'Add Money to Account',
    selectDestination: 'Select Destination Account',
    amount: 'Amount',
    descriptionOpt: 'Description (optional)',
    processing: 'Processing...',
    depositSuccess: 'Deposit Successful',
    depositSuccessDesc: 'added successfully.',
    currentBalance: 'Current Balance',
    backToDashboard: 'Back to Dashboard',
    accountTransactions: 'Account Transactions',
    noAccountTransactions: 'No transactions for this account yet',
    transferMoney: 'Transfer Money',
    depositFunds: 'Deposit Funds',
    sendTo: 'Send to',
    selectRecipient: 'Select a recipient account',
    transferSuccess: 'Transfer completed successfully!',
    depositSuccessMessage: 'Deposit completed successfully!',
    needMultipleAccounts: 'You need at least 2 accounts to make transfers',
    
    // Types
    withdrawal: 'Withdrawal',
    landingDescription: 'Your secure and simple online banking solution',
    getStarted: 'Get Started',
    secure: 'Secure',
    secureDesc: 'Your accounts are protected with industry-standard encryption',
    fast: 'Fast',
    fastDesc: 'Transfer funds instantly with just a few clicks',
    simple: 'Simple',
    simpleDesc: 'Intuitive interface makes managing your money easy',
  },
  sk: {
    // Auth & Navigation
    signIn: 'Prihlásiť sa',
    signUp: 'Registrovať sa',
    signOut: 'Odhlásiť sa',
    dashboard: 'Nástenka',
    languages: 'Jazyk',
    email: 'E-mail',
    password: 'Heslo',
    fullName: 'Celé meno',
    dontHaveAccount: 'Nemáte ešte účet?',
    alreadyHaveAccount: 'Už máte vytvorený účet?',
    signInTitle: 'Prihlásiť sa do účtu',
    signUpTitle: 'Vytvoriť nový účet',
    
    // Dashboard
    totalBalance: 'Celkový zostatok',
    yourAccounts: 'Vaše účty',
    recentTransactions: 'Nedávne transakcie',
    noTransactions: 'Žiadne nedávne transakcie',
    noAccounts: 'Ešte ste si nevytvorili žiadne účty',
    checkingAccount: 'Bežný účet',
    savingsAccount: 'Sporiaci účet',
    active: 'Aktívny',
    inactive: 'Neaktívny',
    balance: 'Zostatok',
    
    // Actions
    addMoney: 'Vložiť peniaze',
    sendMoney: 'Poslať peniaze',
    cancel: 'Zrušiť',
    deposit: 'Vklad',
    transfer: 'Prevod',
    
    // Forms & Modals
    addMoneyTitle: 'Vložiť peniaze na účet',
    selectDestination: 'Vybrať cieľový účet',
    amount: 'Suma',
    descriptionOpt: 'Popis (voliteľný)',
    processing: 'Spracováva sa...',
    depositSuccess: 'Vklad bol úspešný',
    depositSuccessDesc: 'bolo úspešne pripísané.',
    currentBalance: 'Aktuálny zostatok',
    backToDashboard: 'Späť na nástenku',
    accountTransactions: 'Transakcie účtu',
    noAccountTransactions: 'Tento účet nemá zatiaľ žiadne transakcie',
    transferMoney: 'Previesť peniaze',
    depositFunds: 'Vložiť prostriedky',
    sendTo: 'Poslať na',
    selectRecipient: 'Vybrať príjemcu',
    transferSuccess: 'Prevod bol úspešne dokončený!',
    depositSuccessMessage: 'Vklad bol úspešne dokončený!',
    needMultipleAccounts: 'Na uskutočnenie prevodov potrebujete aspoň 2 účty',
    
    // Types
    withdrawal: 'Výber',
    landingDescription: 'Vaše bezpečné a jednoduché online bankovníctvo',
    getStarted: 'Začať',
    secure: 'Bezpečné',
    secureDesc: 'Vaše účty sú chránené priemyselným šifrovaním',
    fast: 'Rýchle',
    fastDesc: 'Prevod prostriedkov okamžite pomocou pár kliknutí',
    simple: 'Jednoduché',
    simpleDesc: 'Intuitívne rozhranie uľahčuje správu vašich peňazí',
  }
}

export function getTranslation(lang: Language = 'sk') {
  return dictionaries[lang] || dictionaries.sk
}
