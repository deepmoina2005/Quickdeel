const ConversationList = ({ conversations, activeId, onSelect }) => (
  <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="border-b border-slate-200 p-4 font-black dark:border-slate-800">Messages</div>
    {conversations.map((conversation) => (
      <button key={conversation.id} onClick={() => onSelect(conversation.id)} className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${activeId === conversation.id ? "bg-brand-50 dark:bg-brand-900/20" : ""}`}>
        <img src={conversation.user.avatar} alt={conversation.user.name} className="h-11 w-11 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="truncate font-bold">{conversation.user.name}</p>
          <p className="truncate text-sm text-slate-500">{conversation.listingTitle}</p>
        </div>
      </button>
    ))}
  </div>
);

export default ConversationList;
