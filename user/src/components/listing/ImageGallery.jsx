import { useState } from "react";

const ImageGallery = ({ images = [] }) => {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
        <img src={active} alt="Listing" className="h-full w-full object-cover" />
      </div>
      <div className="flex gap-3 overflow-auto">
        {images.map((image) => (
          <button key={image} onClick={() => setActive(image)} className="h-20 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-transparent focus:border-brand-600">
            <img src={image} alt="Listing thumbnail" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
