import { Bell, KeyRound, Trash2 } from "lucide-react";
import { useState } from "react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const tabs = [
  { id: "notifications", label: "Notification", icon: Bell },
  { id: "password", label: "Password Change", icon: KeyRound },
  { id: "delete", label: "Delete Account", icon: Trash2 },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("notifications");

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black text-slate-950 dark:text-white">Settings</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {activeTab === "notifications" ? (
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Notification</h2>
              <div className="mt-6 space-y-4">
                {["Email notifications", "Chat alerts", "Listing updates"].map((label) => (
                  <label key={label} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{label}</span>
                    <input type="checkbox" defaultChecked className="h-5 w-5 accent-brand-600" />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "password" ? (
            <form className="max-w-xl">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Password Change</h2>
              <div className="mt-6 grid gap-4">
                <Input label="Current Password" type="password" placeholder="Enter current password" />
                <Input label="New Password" type="password" placeholder="Enter new password" />
                <Input label="Confirm Password" type="password" placeholder="Confirm new password" />
              </div>
              <Button className="mt-5" icon={KeyRound}>Update Password</Button>
            </form>
          ) : null}

          {activeTab === "delete" ? (
            <div className="max-w-xl">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Delete Account</h2>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Deleting your account will remove your profile, listings, chats, and saved data.
              </p>
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
                <p className="font-bold text-red-700 dark:text-red-300">This action cannot be undone.</p>
              </div>
              <Button className="mt-5" variant="danger" icon={Trash2}>Delete Account</Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;
