import { ImagePlus, MapPin, Paperclip, Send } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";

const mapQuery = (message) => (
  message.locationLat && message.locationLng
    ? `${message.locationLat},${message.locationLng}`
    : message.locationLabel || message.label || message.text || ""
);
const mapUrl = (message) => `https://www.google.com/maps?q=${encodeURIComponent(mapQuery(message))}`;
const mapEmbedUrl = (location) => `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery(location))}&output=embed`;

const ChatBubble = ({ message }) => (
  <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm ${message.fromMe ? "bg-brand-600 text-white" : "bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"}`}>
    {message.type === "IMAGE" && message.imageUrl ? (
      <a href={message.imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
        <img src={message.imageUrl} alt={message.text || "Chat image"} className="max-h-72 w-full min-w-48 object-cover" />
      </a>
    ) : message.type === "LOCATION" && mapQuery(message) ? (
      <a href={mapUrl(message)} target="_blank" rel="noreferrer" className={`flex min-w-48 items-center gap-3 rounded-xl p-3 ${message.fromMe ? "bg-white/10" : "bg-slate-50 dark:bg-slate-800"}`}>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
          <MapPin className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-black">Location shared</span>
          <span className="block text-xs opacity-75">{message.locationLabel || `${message.locationLat}, ${message.locationLng}`}</span>
        </span>
      </a>
    ) : (
      <p>{message.text}</p>
    )}
    <p className="mt-1 text-xs opacity-70">{message.time}</p>
  </div>
);

const ChatPanel = ({ initialMessages = [], onSendMessage, onSendImage, onSendLocation }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const fileInputRef = useRef(null);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    const nextMessage = {
      id: crypto.randomUUID(),
      fromMe: true,
      text: text.trim(),
      time: "Now",
    };

    setMessages((value) => [...value, nextMessage]);
    setText("");
    const savedMessage = await onSendMessage?.(nextMessage);
    if (savedMessage === null) {
      setMessages((value) => value.filter((message) => message.id !== nextMessage.id));
      return;
    }
    if (savedMessage) {
      setMessages((value) => value.map((message) => (
        message.id === nextMessage.id ? savedMessage : message
      )));
    }
  };

  const sendImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const nextMessage = {
      id: crypto.randomUUID(),
      fromMe: true,
      type: "IMAGE",
      imageUrl: previewUrl,
      text: "Image shared",
      time: "Now",
    };

    setMessages((value) => [...value, nextMessage]);
    const savedMessage = await onSendImage?.(file);
    URL.revokeObjectURL(previewUrl);
    if (savedMessage === null) {
      setMessages((value) => value.filter((message) => message.id !== nextMessage.id));
      return;
    }
    if (savedMessage) {
      setMessages((value) => value.map((message) => (
        message.id === nextMessage.id ? savedMessage : message
      )));
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not available in this browser");
      return;
    }

    setSendingLocation(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        label: "Current location",
      });
      setLocationText("Current location");
      setSendingLocation(false);
    }, () => {
      toast.error("Location permission denied");
      setSendingLocation(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const sendLocation = async () => {
    const typedLocation = locationText.trim();
    const location = currentLocation && typedLocation === "Current location"
      ? currentLocation
      : { label: typedLocation };

    if (!location.lat && !location.lng && !location.label) {
      toast.error("Enter location or use current location");
      return;
    }

    setSendingLocation(true);
      const nextMessage = {
        id: crypto.randomUUID(),
        fromMe: true,
        type: "LOCATION",
        locationLat: location.lat,
        locationLng: location.lng,
        locationLabel: location.label,
        text: "Location shared",
        time: "Now",
      };

      setMessages((value) => [...value, nextMessage]);
      const savedMessage = await onSendLocation?.(location);
      if (savedMessage === null) {
        setMessages((value) => value.filter((message) => message.id !== nextMessage.id));
      } else if (savedMessage) {
        setMessages((value) => value.map((message) => (
          message.id === nextMessage.id ? savedMessage : message
        )));
      }
      setLocationDialogOpen(false);
      setLocationText("");
      setCurrentLocation(null);
      setSendingLocation(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}>
            <ChatBubble message={message} />
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="relative flex gap-2 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={sendImage} />
        {attachmentOpen ? (
          <div className="absolute bottom-16 left-4 z-30 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => {
                setAttachmentOpen(false);
                fileInputRef.current?.click();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-100">
                <ImagePlus className="h-5 w-5" />
              </span>
              Image
            </button>
            <button
              type="button"
              onClick={() => {
                setAttachmentOpen(false);
                setLocationDialogOpen(true);
              }}
              disabled={sendingLocation}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-slate-800"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-100">
                <MapPin className="h-5 w-5" />
              </span>
              Location
            </button>
          </div>
        ) : null}
        {locationDialogOpen ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4">
            <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-soft dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Send Location</h2>
                <button
                  type="button"
                  onClick={() => setLocationDialogOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close location dialog"
                >
                  x
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  {mapQuery({ locationLabel: locationText, ...currentLocation }) ? (
                    <iframe
                      title="Location map"
                      src={mapEmbedUrl({ locationLabel: locationText, ...currentLocation })}
                      className="h-64 w-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-64 place-items-center bg-slate-50 text-center text-sm font-semibold text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      Enter location or choose current location
                    </div>
                  )}
                </div>
                <input
                  value={locationText}
                  onChange={(event) => {
                    setLocationText(event.target.value);
                    setCurrentLocation(null);
                  }}
                  placeholder="Enter location"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <div className="flex flex-wrap justify-between gap-3">
                  <Button type="button" variant="secondary" icon={MapPin} loading={sendingLocation} onClick={useCurrentLocation}>Current Location</Button>
                  <Button type="button" icon={Send} loading={sendingLocation} onClick={sendLocation}>Send Location</Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setAttachmentOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Open attachment options"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message"
          className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <Button icon={Send}>Send</Button>
      </form>
    </div>
  );
};

export default ChatPanel;
