import { MessageCircle, Phone, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { getTelHref } from "../../utils/phone";

const SellerCard = ({ seller, listingId }) => {
  const navigate = useNavigate();

  const callSeller = async () => {
    try {
      await navigator.clipboard?.writeText(seller.phone);
      toast.success("Phone number copied");
    } catch {
      toast.success(seller.phone);
    }

    window.location.href = getTelHref(seller.phone);
  };

  const chatSeller = () => {
    if (listingId) {
      navigate(`/listings/${listingId}/chat`);
      return;
    }

    navigate("/chat");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-black">Seller Information</h2>
      <div className="mt-4 flex items-center gap-3">
        <img src={seller.avatar} alt={seller.name} className="h-14 w-14 rounded-full object-cover" />
        <div>
          <p className="font-bold">{seller.name}</p>
          <p className="flex items-center gap-1 text-sm text-amber-600"><Star className="h-4 w-4 fill-current" />{seller.rating} seller rating</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <Button icon={MessageCircle} onClick={chatSeller}>Chat Seller</Button>
        <button type="button" onClick={callSeller} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <Phone className="h-5 w-5" />
          Call {seller.phone}
        </button>
      </div>
    </div>
  );
};

export default SellerCard;
