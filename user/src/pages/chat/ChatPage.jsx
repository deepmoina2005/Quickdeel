import { MessageCircle, MoreVertical, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import ChatWindow from "../../components/chat/ChatWindow";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const ChatPage = () => {
  const { data } = useMarketplace(() => marketplaceService.getConversations(), []);
  const conversations = Array.isArray(data) ? data : [];
  const [activeId, setActiveId] = useState("");
  const active = conversations.find((conversation) => conversation.id === activeId);

  return (
    <section className="mx-auto flex h-full max-w-7xl px-4 py-4">
      <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[24rem_1fr]">
        <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
            <h1 className="text-2xl font-black">Inbox</h1>
            <div className="flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Search chats">
                <Search className="h-5 w-5" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="More options">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="space-y-5 p-5">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Quick filters</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["All", "Unread", "Important", "Buyer", "Seller"].map((filter, index) => (
                  <button key={filter} className={`rounded-full border px-4 py-2 text-sm font-semibold ${index === 0 ? "border-brand-100 bg-brand-50 text-brand-700" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}>
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 text-sm dark:bg-yellow-500/15">
              <span className="inline-flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 text-blue-600" />Get Badge of Trust</span>
              <span className="text-sm font-black text-blue-700 dark:text-blue-300">Get Verified</span>
            </div>
            <div className="-mx-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${activeId === conversation.id ? "bg-brand-50 dark:bg-brand-500/15" : ""}`}
                >
                  <img src={conversation.user.avatar} alt={conversation.user.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="truncate font-black">{conversation.user.name}</p>
                      <span className="text-xs text-slate-500">21:59</span>
                    </div>
                    <p className="truncate text-sm font-semibold">{conversation.listingTitle}</p>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{conversation.messages?.[0]?.text || "Open conversation"}</p>
                  </div>
                  <MoreVertical className="mt-8 h-5 w-5 shrink-0 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </aside>
        <div className="hidden min-h-0 bg-white dark:bg-slate-950 lg:block">
          {active ? (
            <div className="h-full p-5">
              <ChatWindow conversation={active} />
            </div>
          ) : (
            <div className="grid h-full place-items-center p-8 text-center">
              <div>
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-100">
                  <MessageCircle className="h-14 w-14" />
                </div>
                <p className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">Select a chat to view conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatPage;
