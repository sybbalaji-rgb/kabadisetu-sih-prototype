import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Loading } from "./components/Loading";
import { Login } from "./pages/Login";
import { CollectorDashboard } from "./pages/CollectorDashboard";
import { RecyclerDashboard } from "./pages/RecyclerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ScrapScanner } from "./pages/ScrapScanner";
import { CreateLot } from "./pages/CreateLot";
import { PriceOffers } from "./pages/PriceOffers";
import { Pickup } from "./pages/Pickup";
import { MaterialPassport } from "./pages/MaterialPassport";
import { Transactions } from "./pages/Transactions";
import { getStoredSession, clearSession } from "./services/auth";
import { fetchPlatformData } from "./services/api";

export function App() {
  const [session, setSession] = useState(getStoredSession);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const loadData = async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const data = await fetchPlatformData(session.id);
      setPlatformData(data);
    } catch (e) {
      console.error("Failed to load platform data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.id) {
      loadData();
    }
  }, [session]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setPlatformData(null);
  };

  if (!session) {
    return <Login onLoginSuccess={(prof) => setSession(prof)} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f2] text-[#173d30]">
      <Navbar session={session} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <Sidebar
            role={session.role}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <section className="flex-1">
            {loading && !platformData ? (
              <Loading label="Syncing live KabadiSetu records..." />
            ) : (
              <>
                {activeTab === "dashboard" && session.role === "collector" && (
                  <CollectorDashboard
                    session={session}
                    platformData={platformData}
                    onNavigate={setActiveTab}
                  />
                )}

                {activeTab === "dashboard" && session.role === "recycler" && (
                  <RecyclerDashboard
                    session={session}
                    platformData={platformData}
                    onNavigate={setActiveTab}
                  />
                )}

                {activeTab === "dashboard" && session.role === "authority" && (
                  <AdminDashboard
                    session={session}
                    platformData={platformData}
                    onRefresh={loadData}
                  />
                )}

                {activeTab === "scan" && (
                  <ScrapScanner
                    onScanned={(data) => {
                      setScannedData(data);
                      setActiveTab("create");
                    }}
                  />
                )}

                {activeTab === "create" && (
                  <CreateLot
                    session={session}
                    prefillData={scannedData}
                    onCreated={() => {
                      setScannedData(null);
                      loadData();
                      setActiveTab("dashboard");
                    }}
                  />
                )}

                {activeTab === "fairlock" && (
                  <PriceOffers platformData={platformData} session={session} />
                )}

                {activeTab === "cluster" && (
                  <Pickup
                    platformData={platformData}
                    session={session}
                    onRefresh={loadData}
                  />
                )}

                {activeTab === "passport" && (
                  <MaterialPassport platformData={platformData} />
                )}

                {activeTab === "transactions" && (
                  <Transactions platformData={platformData} session={session} />
                )}

                {activeTab === "recyclers" && session.role === "authority" && (
                  <AdminDashboard
                    session={session}
                    platformData={platformData}
                    onRefresh={loadData}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
