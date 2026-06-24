import { Send } from "lucide-react";
import { useState } from "react";
import Button from "../common/Button";

const ChatWindow = ({ conversation }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(conversation?.messages || []);

  const send = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setMessages([...messages, { id: crypto.randomUUID(), fromMe: true, text, time: "Now" }]);
    setText("");
  };

  if (!conversation) return <div className="grid min-h-96 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">Select a conversation</div>;

  return (
    <div className="flex min-h-[32rem] flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <p className="font-black">{conversation.user.name}</p>
        <p className="text-sm text-slate-500">{conversation.listingTitle}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${message.fromMe ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
              <p>{message.text}</p>
              <p className="mt-1 text-xs opacity-70">{message.time}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a message" className="h-11 flex-1 rounded-lg border border-slate-200 px-4 outline-none dark:border-slate-700 dark:bg-slate-900" />
        <Button icon={Send}>Send</Button>
      </form>
    </div>
  );
};

export default ChatWindow;
