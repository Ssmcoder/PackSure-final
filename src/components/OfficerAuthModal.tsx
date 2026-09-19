import React, { useState } from 'react';
import { Officer } from '../types';
import { getStoredOfficers, saveStoredOfficers, formatToInspectorName, normalizeOfficerId } from '../utils/officers';
import { Language } from '../utils/translations';

interface OfficerAuthModalProps {
  currentOfficer?: Officer | null;
  isOpen: boolean;
  onClose: () => void;
  onOfficerAuthenticated: (officer: Officer) => void;
  lang?: Language;
  initialMode?: 'login' | 'register';
}

export const OfficerAuthModal: React.FC<OfficerAuthModalProps> = ({
  isOpen,
  onClose,
  onOfficerAuthenticated,
  lang = 'EN',
  initialMode = 'login',
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [officers, setOfficers] = useState<Officer[]>(getStoredOfficers);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login Form State
  const [loginOfficerId, setLoginOfficerId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration Form State
  const [regOfficerId, setRegOfficerId] = useState('');
  const [regName, setRegName] = useState('');
  const [regDesignation, setRegDesignation] = useState('Legal Metrology Inspector (LMI)');
  const [regZone, setRegZone] = useState('North Zone (Delhi HQ)');
  const [regStation, setRegStation] = useState('FEU-4-TOUGHPAD-01');
  const [regPassword, setRegPassword] = useState('1234');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = loginOfficerId.trim();
    if (!trimmedId) {
      setErrorMessage(
        lang === 'EN'
          ? 'Please enter your Officer ID (number).'
          : 'कृपया अपना अधिकारी आईडी (संख्या) दर्ज करें।'
      );
      return;
    }

    const normInputId = normalizeOfficerId(trimmedId);
    const currentList = getStoredOfficers();
    const matched = currentList.find(
      o => o.officerId === trimmedId || o.officerId === normInputId || o.officerId.toUpperCase() === trimmedId.toUpperCase()
    );

    if (!matched) {
      setErrorMessage(
        lang === 'EN'
          ? `Officer ID "${loginOfficerId}" not found in Department Registry. Please verify or register below.`
          : `अधिकारी आईडी "${loginOfficerId}" विभाग रजिस्ट्री में नहीं मिली। कृपया जांचें या नीचे पंजीकरण करें।`
      );
      return;
    }

    if (matched.password && loginPassword && matched.password !== loginPassword) {
      setErrorMessage(
        lang === 'EN'
          ? 'Incorrect PIN/Password. Default PIN for test accounts is 1234.'
          : 'गलत पिन/पासवर्ड। परीक्षण खातों के लिए डिफ़ॉल्ट पिन 1234 है।'
      );
      return;
    }

    setSuccessMessage(
      lang === 'EN'
        ? `Authenticated as ${matched.name} (ID: ${matched.officerId})`
        : `${matched.name} (आईडी: ${matched.officerId}) के रूप में प्रमाणित किया गया`
    );

    setTimeout(() => {
      onOfficerAuthenticated(matched);
      onClose();
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericId = normalizeOfficerId(regOfficerId);
    const trimmedName = regName.trim();

    if (!regOfficerId.trim() || !trimmedName) {
      setErrorMessage(
        lang === 'EN'
          ? 'Officer ID (number) and Full Name are mandatory.'
          : 'अधिकारी आईडी (संख्या) और पूरा नाम अनिवार्य हैं।'
      );
      return;
    }

    const currentList = getStoredOfficers();
    if (currentList.some(o => o.officerId === numericId)) {
      setErrorMessage(
        lang === 'EN'
          ? `Officer ID "${numericId}" is already registered. Please log in instead.`
          : `अधिकारी आईडी "${numericId}" पहले से पंजीकृत है। कृपया लॉगिन करें।`
      );
      return;
    }

    const formattedInspectorName = formatToInspectorName(trimmedName, numericId);

    const newOfficer: Officer = {
      id: `off-${Date.now()}`,
      officerId: numericId,
      name: formattedInspectorName,
      designation: regDesignation,
      zone: regZone,
      stationCode: regStation || `FEU-${numericId.slice(-4)}`,
      password: regPassword || '1234',
      registeredAt: new Date().toISOString(),
    };

    const updatedList = [newOfficer, ...currentList];
    saveStoredOfficers(updatedList);
    setOfficers(updatedList);

    setSuccessMessage(
      lang === 'EN'
        ? `Registered & logged in: ${newOfficer.name} (ID: ${newOfficer.officerId})`
        : `सफलतापूर्वक पंजीकृत व लॉगिन: ${newOfficer.name} (आईडी: ${newOfficer.officerId})`
    );

    setTimeout(() => {
      onOfficerAuthenticated(newOfficer);
      onClose();
    }, 500);
  };

  const handleQuickSelectOfficer = (officer: Officer) => {
    setLoginOfficerId(officer.officerId);
    setLoginPassword(officer.password || '1234');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#dce9ff] overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-[#131b2e] text-white px-6 py-4 flex items-center justify-between border-b border-[#006a61]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006a61] flex items-center justify-center text-[#86f2e4] shadow-xs">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">
                {lang === 'EN'
                  ? 'Legal Metrology Officer Portal'
                  : 'विधिक मापविज्ञान अधिकारी पोर्टल'}
              </h3>
              <p className="text-[11px] text-[#86f2e4] opacity-90">
                Department of Consumer Affairs • Govt. of India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-[#eff4ff] bg-[#f8f9ff] text-xs font-semibold">
          <button
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'border-[#006a61] text-[#006a61] bg-white'
                : 'border-transparent text-[#76777d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>{lang === 'EN' ? 'Officer Login' : 'अधिकारी लॉगिन'}</span>
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'border-[#006a61] text-[#006a61] bg-white'
                : 'border-transparent text-[#76777d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>{lang === 'EN' ? 'Register New Officer' : 'नया अधिकारी पंजीकरण'}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg bg-[#d1f2e8] border border-[#006a61]/30 text-[#006a61] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  {lang === 'EN'
                    ? 'Officer ID (Number)*'
                    : 'अधिकारी आईडी (संख्या)*'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#76777d]">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9921, 4401, 1188"
                    value={loginOfficerId}
                    onChange={e => setLoginOfficerId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#c6c6cd] text-xs font-mono bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  {lang === 'EN' ? 'Security PIN / Password' : 'सुरक्षा पिन / पासवर्ड'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#76777d]">
                    lock
                  </span>
                  <input
                    type="password"
                    placeholder="Enter PIN (Default: 1234)"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#c6c6cd] text-xs bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  />
                </div>
              </div>

              {/* Quick Select from Registered Officers */}
              <div className="pt-2 border-t border-[#eff4ff]">
                <div className="text-[11px] font-semibold text-[#76777d] mb-2 flex items-center justify-between">
                  <span>{lang === 'EN' ? 'Or Quick Select Registered Officer:' : 'या पंजीकृत अधिकारी चुनें:'}</span>
                  <span className="text-[10px] text-[#006a61]">{officers.length} Active</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {officers.map(off => (
                    <div
                      key={off.id}
                      onClick={() => handleQuickSelectOfficer(off)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                        loginOfficerId.toUpperCase() === off.officerId.toUpperCase()
                          ? 'bg-[#eff4ff] border-[#006a61] text-[#0b1c30]'
                          : 'bg-white border-[#dce9ff] hover:bg-[#f8f9ff] text-[#45464d]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-[#0b1c30]">{off.name}</div>
                        <div className="text-[10px] font-mono text-[#006a61]">{off.officerId}</div>
                      </div>
                      <div className="text-[10px] text-right text-[#76777d]">
                        <div>{off.zone.split(' ')[0]}</div>
                        <span className="text-[#006a61] font-semibold">Select</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] transition-colors"
                >
                  {lang === 'EN' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#006a61] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>{lang === 'EN' ? 'Sign In' : 'साइन इन करें'}</span>
                </button>
              </div>
            </form>
          )}

          {/* REGISTRATION FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  {lang === 'EN'
                    ? 'Officer ID (Number)*'
                    : 'अधिकारी आईडी (संख्या)*'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9921 or 1082"
                  value={regOfficerId}
                  onChange={e => setRegOfficerId(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] text-xs font-mono bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                />
                <p className="text-[10px] text-[#76777d] mt-0.5">
                  {lang === 'EN' ? 'Official badge number (numbers only).' : 'आधिकारिक बैज संख्या (केवल संख्या)।'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  {lang === 'EN' ? 'Inspector Number / Identifier*' : 'इंस्पेक्टर संख्या / पहचानकर्ता*'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector 42 or 42"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] text-xs bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                />
                <p className="text-[10px] text-[#76777d] mt-0.5">
                  {lang === 'EN'
                    ? 'Official format: Inspector (number). Enter number or full call sign.'
                    : 'आधिकारिक प्रारूप: Inspector (संख्या). संख्या दर्ज करें।'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                    {lang === 'EN' ? 'Designation / Rank' : 'पदनाम / रैंक'}
                  </label>
                  <select
                    value={regDesignation}
                    onChange={e => setRegDesignation(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#c6c6cd] text-xs bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  >
                    <option value="Legal Metrology Inspector (LMI)">Legal Metrology Inspector</option>
                    <option value="Senior Metrology Officer">Senior Metrology Officer</option>
                    <option value="Assistant Controller (Enforcement)">Assistant Controller</option>
                    <option value="Deputy Controller (LM)">Deputy Controller</option>
                    <option value="Weights & Measures Inspector">W&amp;M Inspector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                    {lang === 'EN' ? 'Enforcement Zone' : 'प्रवर्तन क्षेत्र'}
                  </label>
                  <select
                    value={regZone}
                    onChange={e => setRegZone(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#c6c6cd] text-xs bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  >
                    <option value="North Zone (Delhi HQ)">North Zone (Delhi HQ)</option>
                    <option value="West Zone (Mumbai Region)">West Zone (Mumbai)</option>
                    <option value="South Zone (Bengaluru Region)">South Zone (Bengaluru)</option>
                    <option value="East Zone (Kolkata Region)">East Zone (Kolkata)</option>
                    <option value="Central Zone (Bhopal Region)">Central Zone (Bhopal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                    {lang === 'EN' ? 'Station / Terminal ID' : 'स्टेशन / टर्मिनल आईडी'}
                  </label>
                  <input
                    type="text"
                    placeholder="FEU-4-TOUGHPAD-01"
                    value={regStation}
                    onChange={e => setRegStation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] text-xs font-mono bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                    {lang === 'EN' ? 'Security PIN' : 'सुरक्षा पिन'}
                  </label>
                  <input
                    type="password"
                    placeholder="4-digit PIN (1234)"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#c6c6cd] text-xs bg-[#f8f9ff] text-[#0b1c30] focus:outline-hidden focus:border-[#006a61]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="flex-1 py-2 rounded-lg border border-[#c6c6cd] text-xs font-semibold text-[#45464d] hover:bg-[#eff4ff] transition-colors"
                >
                  {lang === 'EN' ? 'Back to Login' : 'वापस लॉगिन पर जाएं'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#006a61] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  <span>{lang === 'EN' ? 'Register & Sign In' : 'पंजीकरण करें व साइन इन करें'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
