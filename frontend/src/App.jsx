import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, ScanLine, User, MapPin, CheckCircle, AlertTriangle, Radio } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'verify'

  // Book Pass State
  const [commuterName, setCommuterName] = useState('');
  const [routeId, setRouteId] = useState('ROUTE-777');
  const [fare, setFare] = useState(250);
  const [qrPayload, setQrPayload] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState(null);

  // Verify Pass State
  const [ticketToken, setTicketToken] = useState('');
  const [verifyStatus, setVerifyStatus] = useState(null); // null, 'success', 'error'
  const [passengerData, setPassengerData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Route Status State
  const [routeStatuses, setRouteStatuses] = useState({
    'ROUTE-777': { status: 'OPERATIONAL', message: '' },
    'ROUTE-101': { status: 'OPERATIONAL', message: '' }
  });

  // Conductor Control State
  const [controlRouteId, setControlRouteId] = useState('ROUTE-777');
  const [controlStatus, setControlStatus] = useState('OPERATIONAL');
  const [controlMessage, setControlMessage] = useState('');
  const [controlLoading, setControlLoading] = useState(false);
  const [controlFeedback, setControlFeedback] = useState(null);

  const handleRouteSelect = (e) => {
    const selected = e.target.value;
    setRouteId(selected);
    if (selected === 'ROUTE-777') setFare(250);
    else if (selected === 'ROUTE-101') setFare(300);
    else setFare(200);
  };

  const handleBookPass = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    setBookError(null);
    setQrPayload(null);
    try {
      const response = await fetch('http://localhost:5000/api/book-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commuterName, routeId, fare })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to book pass');
      
      setQrPayload(data.qrPayload || data.token); // Handle varied backend keys
    } catch (err) {
      setBookError(err.message);
    } finally {
      setBookLoading(false);
    }
  };

  const handleVerifyPass = async (e) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyStatus(null);
    setPassengerData(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/verify-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrPayload: ticketToken })
      });
      const data = await response.json();
      
      if (response.status === 200) {
        setVerifyStatus('success');
        setPassengerData(data.ticket || data);
      } else {
        setVerifyStatus('error');
      }
    } catch (err) {
      setVerifyStatus('error');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setControlLoading(true);
    setControlFeedback(null);
    try {
      const response = await fetch('http://localhost:5000/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId: controlRouteId, routeStatus: controlStatus, statusMessage: controlMessage })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Failed to update status');
      
      setRouteStatuses(prev => ({
        ...prev,
        [controlRouteId]: { status: controlStatus, message: controlMessage }
      }));
      setControlFeedback({ type: 'success', text: 'Live status broadcasted successfully!' });
    } catch (err) {
      setControlFeedback({ type: 'error', text: err.message });
    } finally {
      setControlLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">CloudTransit</h1>
          <div className="text-indigo-200 text-sm font-medium">Smart Bus Pass System</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto mt-8 p-4">
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center transition-all ${activeTab === 'book' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Commuter Portal
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center transition-all ${activeTab === 'verify' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Ticket Checker
          </button>
          <button
            onClick={() => setActiveTab('control')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg flex items-center justify-center transition-all ${activeTab === 'control' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            <Radio className="w-4 h-4 mr-2" />
            Control Tower
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          
          {/* Commuter Portal */}
          {activeTab === 'book' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
                Book a New Pass
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <form onSubmit={handleBookPass} className="space-y-5">
                  
                  {/* Alert Banner */}
                  {routeStatuses[routeId]?.status === 'DELAYED' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-start animate-in fade-in">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-yellow-800">Route Delayed</h3>
                        <p className="text-sm text-yellow-700 mt-1">{routeStatuses[routeId].message || 'This route is currently experiencing delays.'}</p>
                      </div>
                    </div>
                  )}
                  {routeStatuses[routeId]?.status === 'CANCELLED' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start animate-in fade-in">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-bold text-red-800">Route Cancelled</h3>
                        <p className="text-sm text-red-700 mt-1">{routeStatuses[routeId].message || 'This route has been cancelled.'}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Commuter Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="John Doe"
                        value={commuterName}
                        onChange={(e) => setCommuterName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Route</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                      </div>
                      <select
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={routeId}
                        onChange={handleRouteSelect}
                      >
                        <option value="ROUTE-777">ROUTE-777 (Express)</option>
                        <option value="ROUTE-101">ROUTE-101 (Local)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Total Fare:</span>
                    <span className="text-lg font-bold text-indigo-700">₹{fare}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={bookLoading || routeStatuses[routeId]?.status === 'CANCELLED'}
                    className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center ${bookLoading || routeStatuses[routeId]?.status === 'CANCELLED' ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    {bookLoading ? 'Processing...' : 'Generate Pass'}
                  </button>
                  
                  {bookError && (
                    <div className="text-red-500 text-sm mt-2">{bookError}</div>
                  )}
                </form>

                {/* QR Display */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8">
                  {qrPayload ? (
                    <div className="text-center animate-in zoom-in duration-300">
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 inline-block">
                        <QRCodeSVG value={qrPayload} size={200} />
                      </div>
                      <p className="text-sm font-medium text-emerald-600 flex items-center justify-center mb-2">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Pass generated successfully
                      </p>
                      <button 
                        onClick={() => navigator.clipboard.writeText(qrPayload)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 underline font-medium"
                        type="button"
                      >
                        Copy Token String for Testing
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Ticket className="w-16 h-16 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">Your QR ticket will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ticket Checker */}
          {activeTab === 'verify' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto">
              <h2 className="text-xl font-bold mb-6 text-slate-800 text-center">
                Verify Commuter Pass
              </h2>
              
              <form onSubmit={handleVerifyPass} className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                  Paste Token or Payload String
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm shadow-sm"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={ticketToken}
                    onChange={(e) => setTicketToken(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex-shrink-0"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify Ticket'}
                  </button>
                </div>
              </form>

              {/* Status Cards */}
              <div className="min-h-[160px]">
                {verifyStatus === 'success' && (
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 animate-in zoom-in-95 duration-300 shadow-sm">
                    <div className="flex items-center text-emerald-700 mb-4">
                      <CheckCircle className="w-8 h-8 mr-3" />
                      <h3 className="text-xl font-bold">Valid Ticket</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm bg-white p-4 rounded-lg border border-emerald-100">
                      <div>
                        <span className="block text-emerald-600/70 font-medium text-xs uppercase mb-1">Passenger</span>
                        <span className="font-semibold text-slate-800">{passengerData?.commuterName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-emerald-600/70 font-medium text-xs uppercase mb-1">Route</span>
                        <span className="font-semibold text-slate-800">{passengerData?.routeId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-emerald-600/70 font-medium text-xs uppercase mb-1">Fare</span>
                        <span className="font-semibold text-slate-800">₹{passengerData?.fare || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {verifyStatus === 'error' && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 animate-in zoom-in-95 duration-300 shadow-sm">
                    <div className="flex items-center text-red-700 mb-2">
                      <AlertTriangle className="w-8 h-8 mr-3" />
                      <h3 className="text-xl font-bold">Invalid or Expired Ticket</h3>
                    </div>
                    <p className="text-red-600 ml-11">
                      This token could not be verified. Do not permit boarding.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Control Tower */}
          {activeTab === 'control' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto">
              {/* Transit Control Dashboard */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-indigo-600" />
                  Transit Control Dashboard
                </h3>
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Route</label>
                      <select
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={controlRouteId}
                        onChange={(e) => setControlRouteId(e.target.value)}
                      >
                        <option value="ROUTE-777">ROUTE-777 (Express)</option>
                        <option value="ROUTE-101">ROUTE-101 (Local)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Route Status</label>
                      <select
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={controlStatus}
                        onChange={(e) => setControlStatus(e.target.value)}
                      >
                        <option value="OPERATIONAL">Operational 🟢</option>
                        <option value="DELAYED">Delayed 🟡</option>
                        <option value="CANCELLED">Cancelled 🔴</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Announcement Message (Optional)</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="e.g. Severe weather conditions, expect 30 min delay..."
                      value={controlMessage}
                      onChange={(e) => setControlMessage(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={controlLoading}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg transition-colors border border-indigo-200"
                  >
                    {controlLoading ? 'Broadcasting...' : 'Broadcast Live Status'}
                  </button>
                  {controlFeedback && (
                    <div className={`p-3 rounded-lg text-sm ${controlFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {controlFeedback.text}
                    </div>
                  )}
                </form>
              </div>
              
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
