import { Flag, MessageCircle, MoreVertical, Search, ShieldCheck, Tag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Skeleton from "../../components/common/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";
import { formatCurrency } from "../../utils/format";
import ChatPanel from "./ChatPanel";
import OfferPanel from "./OfferPanel";

const RECENT_CHAT_KEY = "quickdeal_recent_chats";
const HIDDEN_CHAT_KEY = "quickdeal_hidden_chats";
const userStorageKey = (key, userId) => `${key}_${userId || "guest"}`;

const readRecentChats = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(userStorageKey(RECENT_CHAT_KEY, userId))) || [];
  } catch {
    return [];
  }
};

const writeRecentChats = (userId, chats) => {
  localStorage.setItem(userStorageKey(RECENT_CHAT_KEY, userId), JSON.stringify(chats));
};

const readHiddenChats = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(userStorageKey(HIDDEN_CHAT_KEY, userId))) || [];
  } catch {
    return [];
  }
};

const writeHiddenChats = (userId, chatIds) => {
  localStorage.setItem(userStorageKey(HIDDEN_CHAT_KEY, userId), JSON.stringify(chatIds));
};

const conversationFromListing = (listing, lastMessage = "Hi, I am interested in this product.") => ({
  id: `listing-${listing.id}`,
  listingId: listing.id,
  listingTitle: listing.title,
  listingPrice: listing.price,
  listingLocation: listing.location,
  listingImage: listing.images?.[0],
  user: listing.seller,
  messages: [{ id: `intro-${listing.id}`, fromMe: true, text: lastMessage, time: "Now" }],
  offers: [],
  updatedAt: Date.now(),
});

const mergeItems = (primary = [], secondary = []) => {
  const seen = new Set();
  return [...primary, ...secondary].filter((item) => {
    const key = String(item.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const mergeConversation = (localConversation, backendConversation) => ({
  ...localConversation,
  ...backendConversation,
  messages: mergeItems(backendConversation.messages || [], localConversation.messages || []),
  offers: mergeItems(backendConversation.offers || [], localConversation.offers || []),
  updatedAt: Math.max(Number(localConversation.updatedAt || 0), Number(backendConversation.updatedAt || 0)),
});

const MakeOfferPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "guest";
  const [activeTab, setActiveTab] = useState("chat");
  const [activeId, setActiveId] = useState(id ? `listing-${id}` : "");
  const [openMenuId, setOpenMenuId] = useState("");
  const [recentChats, setRecentChats] = useState(() => readRecentChats(userId));
  const [hiddenChatIds, setHiddenChatIds] = useState(() => readHiddenChats(userId));
  const { data: listing, loading, error, reload } = useMarketplace(() => (id ? marketplaceService.getListing(id) : Promise.resolve(null)), [id]);
  const { data: baseConversations, reload: reloadConversations } = useMarketplace(() => marketplaceService.getConversations(), []);
  const conversations = useMemo(() => {
    const base = (Array.isArray(baseConversations) ? baseConversations : []).map((conversation) => ({
      ...conversation,
      offers: conversation.offers || [],
      updatedAt: 0,
    }));
    const baseById = new Map(base.map((conversation) => [conversation.id, conversation]));
    const mergedRecent = recentChats.map((conversation) => (
      baseById.has(conversation.id) ? mergeConversation(conversation, baseById.get(conversation.id)) : conversation
    ));
    const recentIds = new Set(mergedRecent.map((conversation) => conversation.id));
    return [...mergedRecent, ...base.filter((conversation) => !recentIds.has(conversation.id))]
      .filter((conversation) => !hiddenChatIds.includes(conversation.id) || conversation.messages?.length || conversation.offers?.length);
  }, [baseConversations, hiddenChatIds, recentChats]);
  const activeConversation = conversations.find((conversation) => conversation.id === activeId);
  const activeListing = listing || activeConversation;

  const offerOptions = useMemo(() => {
    const price = Number(activeListing?.price || activeListing?.listingPrice || 0);
    if (!price) return [];
    return [price, Math.round(price * 0.92), Math.round(price * 0.85), Math.round(price * 0.78)];
  }, [activeListing?.price, activeListing?.listingPrice]);

  useEffect(() => {
    setRecentChats(readRecentChats(userId));
    setHiddenChatIds(readHiddenChats(userId));
  }, [userId]);

  useEffect(() => {
    if (!listing) return;

    let cancelled = false;
    const connectConversation = async () => {
      let nextConversation = conversationFromListing(listing);
      try {
        nextConversation = await marketplaceService.startListingConversation(listing.id) || nextConversation;
      } catch (err) {
        toast.error(err?.message || "Could not open chat");
      }
      if (cancelled) return;
      setActiveId(nextConversation.id);
      setHiddenChatIds((value) => {
        const nextIds = value.filter((chatId) => (
          chatId !== nextConversation.id &&
          chatId !== `listing-${listing.id}` &&
          chatId !== String(nextConversation.id)
        ));
        writeHiddenChats(userId, nextIds);
        return nextIds;
      });
      setRecentChats((value) => {
        const existing = value.find((conversation) => conversation.id === nextConversation.id);
        const merged = existing ? { ...mergeConversation(existing, nextConversation), updatedAt: Date.now() } : { ...nextConversation, updatedAt: Date.now() };
        const nextChats = [merged, ...value.filter((conversation) => conversation.id !== nextConversation.id)];
        writeRecentChats(userId, nextChats);
        return nextChats;
      });
    };

    connectConversation();

    return () => {
      cancelled = true;
    };
  }, [listing, userId]);

  useEffect(() => {
    const timer = window.setInterval(reloadConversations, 5000);
    return () => window.clearInterval(timer);
  }, [reloadConversations]);

  useEffect(() => {
    if (!id || activeConversation || !conversations.length) return;

    const nextConversation = conversations.find((conversation) => (
      String(conversation.listingId) === String(id) ||
      String(conversation.id) === `listing-${id}`
    ));

    if (nextConversation) {
      setActiveId(nextConversation.id);
    }
  }, [activeConversation, conversations, id]);

  if (error) return <section className="mx-auto max-w-7xl px-4 py-8"><ErrorState message={error} onRetry={reload} /></section>;
  if (id && loading) return <section className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-[36rem] w-full" /></section>;
  if (id && !listing) return <section className="mx-auto max-w-7xl px-4 py-8"><EmptyState title="Listing not found" /></section>;

  const sendOffer = async (amount) => {
    let nextOffer = {
      id: crypto.randomUUID(),
      amount,
      fromMe: true,
      status: "Sent",
      time: "Now",
    };
    let sentConversationId = activeConversation?.id || activeId;

    try {
      if (!/^\d+$/.test(String(sentConversationId)) && activeListing?.id) {
        const conversation = await marketplaceService.startListingConversation(activeListing.id);
        sentConversationId = conversation.id;
        setActiveId(conversation.id);
        setRecentChats((value) => {
          const nextChats = [conversation, ...value.filter((item) => item.id !== conversation.id)];
          writeRecentChats(userId, nextChats);
          return nextChats;
        });
      }

      nextOffer = await marketplaceService.sendOffer(sentConversationId, amount);
    } catch (err) {
      toast.error(err?.message || "Offer could not be sent");
      return;
    }

    setRecentChats((value) => {
      const nextChats = value.map((conversation) => (
        conversation.id === sentConversationId
          ? {
              ...conversation,
              offers: [nextOffer, ...(conversation.offers || [])],
              messages: [...(conversation.messages || []), { id: crypto.randomUUID(), fromMe: true, text: `Offer sent: ${formatCurrency(amount)}`, time: "Now" }],
              updatedAt: Date.now(),
            }
          : conversation
      ));
      writeRecentChats(userId, nextChats);
      return nextChats;
    });
    reloadConversations();
    toast.success(`Offer sent: ${formatCurrency(amount)}`);
  };

  const acceptOffer = async (offerId) => {
    let acceptedOffer;
    try {
      acceptedOffer = await marketplaceService.acceptOffer(offerId);
    } catch (err) {
      toast.error(err?.message || "Offer could not be accepted");
      return;
    }

    setRecentChats((value) => {
      const nextChats = value.map((conversation) => (
        conversation.id === activeId
          ? {
              ...conversation,
              offers: (conversation.offers || []).map((offer) => (
                offer.id === acceptedOffer.id
                  ? acceptedOffer
                  : String(offer.status).toUpperCase() === "SENT"
                    ? { ...offer, status: "SUPERSEDED" }
                    : offer
              )),
              messages: [...(conversation.messages || []), { id: crypto.randomUUID(), fromMe: true, text: `Offer accepted: ${formatCurrency(acceptedOffer.amount)}`, time: "Now" }],
              updatedAt: Date.now(),
            }
          : conversation
      ));
      writeRecentChats(userId, nextChats);
      return nextChats;
    });
    reloadConversations();
    toast.success(`Offer accepted: ${formatCurrency(acceptedOffer.amount)}`);
  };

  const rejectOffer = async (offerId) => {
    let rejectedOffer;
    try {
      rejectedOffer = await marketplaceService.rejectOffer(offerId);
    } catch (err) {
      toast.error(err?.message || "Offer could not be rejected");
      return;
    }

    setRecentChats((value) => {
      const nextChats = value.map((conversation) => (
        conversation.id === activeId
          ? {
              ...conversation,
              offers: (conversation.offers || []).map((offer) => (
                offer.id === rejectedOffer.id ? rejectedOffer : offer
              )),
              messages: [...(conversation.messages || []), { id: crypto.randomUUID(), fromMe: true, text: `Offer rejected: ${formatCurrency(rejectedOffer.amount)}`, time: "Now" }],
              updatedAt: Date.now(),
            }
          : conversation
      ));
      writeRecentChats(userId, nextChats);
      return nextChats;
    });
    reloadConversations();
    toast.success("Offer rejected");
  };

  const sendMessage = async (message) => {
    let nextMessage = message;
    let sentConversationId = activeConversation?.id || activeId;
    try {
      if (!/^\d+$/.test(String(sentConversationId)) && activeListing?.id) {
        const conversation = await marketplaceService.startListingConversation(activeListing.id);
        sentConversationId = conversation.id;
        setActiveId(conversation.id);
        setRecentChats((value) => {
          const nextChats = [conversation, ...value.filter((item) => item.id !== conversation.id)];
          writeRecentChats(userId, nextChats);
          return nextChats;
        });
      }

      nextMessage = await marketplaceService.sendMessage(sentConversationId, message.text);
    } catch (err) {
      toast.error(err?.message || "Message could not be sent");
      return null;
    }

    setRecentChats((value) => {
      const nextChats = value.map((conversation) => (
        conversation.id === sentConversationId
          ? { ...conversation, messages: [...(conversation.messages || []), nextMessage], updatedAt: Date.now() }
          : conversation
      ));
      writeRecentChats(userId, nextChats);
      return nextChats;
    });
    reloadConversations();
    return nextMessage;
  };

  const sendImage = async (file) => {
    let nextMessage;
    let sentConversationId = activeConversation?.id || activeId;
    try {
      if (!/^\d+$/.test(String(sentConversationId)) && activeListing?.id) {
        const conversation = await marketplaceService.startListingConversation(activeListing.id);
        sentConversationId = conversation.id;
        setActiveId(conversation.id);
        setRecentChats((value) => {
          const nextChats = [conversation, ...value.filter((item) => item.id !== conversation.id)];
          writeRecentChats(userId, nextChats);
          return nextChats;
        });
      }

      nextMessage = await marketplaceService.sendImageMessage(sentConversationId, file);
    } catch (err) {
      toast.error(err?.message || "Image could not be sent");
      return null;
    }

    setRecentChats((value) => {
      const nextChats = value.map((conversation) => (
        conversation.id === sentConversationId
          ? { ...conversation, messages: [...(conversation.messages || []), nextMessage], updatedAt: Date.now() }
          : conversation
      ));
      writeRecentChats(userId, nextChats);
      return nextChats;
    });
    reloadConversations();
    return nextMessage;
  };

  const sendLocation = async (location) => {
    let nextMessage;
    let sentConversationId = activeConversation?.id || activeId;
    try {
      if (!/^\d+$/.test(String(sentConversationId)) && activeListing?.id) {
        const conversation = await marketplaceService.startListingConversation(activeListing.id);
        sentConversationId = conversation.id;
        setActiveId(conversation.id);
        setRecentChats((value) => {
          const nextChats = [conversation, ...value.filter((item) => item.id !== conversation.id)];
          writeRecentChats(userId, nextChats);
          return nextChats;
        });
      }

      nextMessage = await marketplaceService.sendLocationMessage(sentConversationId, location);
    } catch (err) {
      toast.error(err?.message || "Location could not be sent");
      return null;
    }

    setRecentChats((value) => {
      const nextChats = value.map((conversation) => (
        conversation.id === sentConversationId
          ? { ...conversation, messages: [...(conversation.messages || []), nextMessage], updatedAt: Date.now() }
          : conversation
      ));
      writeRecentChats(userId, nextChats);
      return nextChats;
    });
    reloadConversations();
    return nextMessage;
  };

  const removeChat = async (conversationId) => {
    try {
      await marketplaceService.removeConversation(conversationId);
    } catch (err) {
      toast.error(err?.message || "Chat could not be removed");
      return;
    }

    setRecentChats((value) => {
      const nextChats = value.filter((conversation) => conversation.id !== conversationId);
      writeRecentChats(userId, nextChats);
      return nextChats;
    });

    if (activeId === conversationId) {
      setActiveId("");
    }

    setHiddenChatIds((value) => {
      const nextIds = [...new Set([...value, conversationId])];
      writeHiddenChats(userId, nextIds);
      return nextIds;
    });

    setOpenMenuId("");
    toast.success("Chat removed");
    reloadConversations();
  };

  const tabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "offers", label: `Offers (${activeConversation?.offers?.length || 0})`, icon: Tag },
  ];

  if (!id && conversations.length === 0) {
    return (
      <section className="grid h-full place-items-center px-4 text-center">
        <div>
          <p className="text-xl font-semibold text-slate-950 dark:text-white">No messages, yet?</p>
          <div className="mx-auto mt-8 grid h-52 w-52 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-100">
            <MessageCircle className="h-28 w-28" />
          </div>
          <p className="mt-8 text-lg font-medium text-slate-700 dark:text-slate-300">We'll keep messages for any item you're selling in here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex h-full max-w-7xl px-4 py-4">
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid h-full min-h-0 lg:grid-cols-[24rem_1fr]">
          <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:border-b-0 lg:border-r">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
              <h1 className="text-2xl font-black">Inbox</h1>
              <div className="flex items-center gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Search">
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
                  <div key={conversation.id} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(conversation.id);
                        setActiveTab("chat");
                        setOpenMenuId("");
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl p-3 pr-10 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${activeId === conversation.id ? "bg-brand-50 dark:bg-brand-500/15" : ""}`}
                    >
                      <img src={conversation.listingImage || conversation.user.avatar} alt={conversation.listingTitle} className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <p className="truncate font-black">{conversation.user.name}</p>
                          <span className="text-xs text-slate-500">{conversation.updatedAt ? "Now" : "21:59"}</span>
                        </div>
                        <p className="truncate text-sm font-semibold">{conversation.listingTitle}</p>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{conversation.messages?.at(-1)?.text || "Open conversation"}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId((value) => (value === conversation.id ? "" : conversation.id));
                      }}
                      className="absolute right-2 top-9 grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                      aria-label="Chat options"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {openMenuId === conversation.id ? (
                      <div className="absolute right-2 top-16 z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => removeChat(conversation.id)}
                          className="block w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        >
                          Remove chat
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex min-h-0 flex-col bg-slate-50 dark:bg-slate-950">
            <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-16 items-center justify-between px-5">
                <div className="flex items-center gap-3">
                  <img src={activeConversation?.user?.avatar} alt={activeConversation?.user?.name} className="h-11 w-11 rounded-lg object-cover" />
                  <div>
                    <p className="font-black">{activeConversation?.user?.name || "Select a chat"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Usually replies quickly</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Report chat">
                    <Flag className="h-5 w-5" />
                  </button>
                  <button onClick={() => activeConversation?.listingId ? navigate(`/listings/${activeConversation.listingId}`) : navigate("/")} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close chat page">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {activeConversation ? (
                <Link to={activeConversation.listingId ? `/listings/${activeConversation.listingId}` : "/chat"} className="grid gap-3 border-t border-slate-200 px-5 py-3 dark:border-slate-800 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <p className="truncate font-semibold">{activeConversation.listingTitle}</p>
                  <p className="font-black">{activeConversation.listingPrice ? formatCurrency(activeConversation.listingPrice) : ""}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{activeConversation.listingLocation}</p>
                </Link>
              ) : null}
            </div>

            <div className="border-b border-slate-200 bg-white px-4 pt-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-black transition ${active ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex min-h-0 flex-1 transition-all duration-200">
              {!activeConversation ? (
                <div className="grid flex-1 place-items-center p-8 text-center">
                  <div>
                    <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-100">
                      <MessageCircle className="h-14 w-14" />
                    </div>
                    <p className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">Select a chat to view conversation</p>
                  </div>
                </div>
              ) : activeTab === "chat" ? (
                <ChatPanel key={activeConversation.id} initialMessages={activeConversation.messages || []} onSendMessage={sendMessage} onSendImage={sendImage} onSendLocation={sendLocation} />
              ) : (
                <OfferPanel key={activeConversation.id} listing={{ price: activeConversation.listingPrice || 0 }} offerOptions={offerOptions} offers={activeConversation.offers || []} onAcceptOffer={acceptOffer} onRejectOffer={rejectOffer} onSendOffer={sendOffer} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MakeOfferPage;
