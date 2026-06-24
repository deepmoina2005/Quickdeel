import {
  CalendarDays,
  Camera,
  Edit,
  Plus,
  Save,
  Share2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import { useAuth } from "../../context/AuthContext";
import { useMarketplace } from "../../hooks/useMarketplace";
import { marketplaceService } from "../../services/marketplace.service";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { ...user, contactEmail: user?.contactEmail || user?.email },
  });
  const [editOpen, setEditOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(null);
  const [imageError, setImageError] = useState(false);
  const { data } = useMarketplace(() => marketplaceService.getMyListings(), []);
  const listings = Array.isArray(data) ? data : [];
  const followers = Array.isArray(user?.followers) ? user.followers : [];
  const following = Array.isArray(user?.following) ? user.following : [];
  const activeConnections = connectionsOpen === "followers" ? followers : following;
  const activeConnectionsTitle = connectionsOpen === "followers" ? "Followers" : "Following";
  const initial = (user?.name || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();
  const showImage = user?.avatar && !imageError;
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat("en-IN", {
        month: "short",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "Jun 2026";
  const profileDefaults = {
    ...user,
    phone: user?.phone || "",
    about: user?.about || "",
    contactEmail: user?.contactEmail || user?.email || "",
  };

  useEffect(() => {
    reset(profileDefaults);
  }, [reset, user]);

  const submitProfile = async (values) => {
    try {
      await updateProfile(values);
      setEditOpen(false);
    } catch (err) {
      toast.error(err?.message || "Profile could not be updated");
    }
  };

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
          <aside className="space-y-6">
            <div className="text-center">
              <div className="mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-full bg-brand-600 text-7xl font-black text-white shadow-sm">
                {showImage ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <h1 className="mt-6 text-2xl font-black text-slate-950 dark:text-white">
                {user.name}
              </h1>
            </div>

            <div className="space-y-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Member since {memberSince}
              </p>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <button
                  type="button"
                  onClick={() => setConnectionsOpen("followers")}
                  className="font-medium transition hover:text-brand-600"
                >
                  <span className="font-black text-slate-950 dark:text-white">
                    {followers.length}
                  </span>{" "}
                  Followers
                </button>
                <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setConnectionsOpen("following")}
                  className="font-medium transition hover:text-brand-600"
                >
                  <span className="font-black text-slate-950 dark:text-white">
                    {following.length}
                  </span>{" "}
                  Following
                </button>
              </div>
            </div>

            <Button
              className="w-full"
              icon={Edit}
              onClick={() => setEditOpen(true)}
            >
              Edit Profile
            </Button>
            <Button className="w-full" variant="ghost" icon={Share2}>
              Share Profile
            </Button>
          </aside>

          <div className="min-h-[34rem]">
            {!listings.length ? (
              <div className="grid min-h-[32rem] place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-48 w-48 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                    <Plus className="h-24 w-24" />
                  </div>
                  <h2 className="mt-8 text-2xl font-black text-slate-800 dark:text-white">
                    You haven't listed anything yet
                  </h2>
                  <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
                    Let go of what you don't use anymore
                  </p>
                  <Link to="/sell">
                    <Button className="mt-8">Start selling</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  Your Listings
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/listings/${listing.id}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900"
                    >
                      <img
                        src={listing.images?.[0]}
                        alt={listing.title}
                        className="h-40 w-full object-cover"
                      />
                      <div className="p-4">
                        <p className="truncate font-black text-slate-950 dark:text-white">
                          {listing.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {listing.location}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {editOpen ? (
        <div
          className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setEditOpen(false)}
            aria-label="Close edit profile dialog"
          />
          <form
            onSubmit={handleSubmit(submitProfile)}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="edit-profile-title"
                className="text-2xl font-black text-slate-950 dark:text-white"
              >
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Basic Information
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    placeholder="Enter your name"
                    {...register("name")}
                  />
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  <label className="block space-y-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Profile Photo
                    </span>
                    <span className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                      <Camera className="h-5 w-5 text-slate-400" />
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-bold file:text-brand-700 dark:file:bg-brand-500/10 dark:file:text-brand-300"
                        {...register("avatarFile")}
                      />
                    </span>
                  </label>
                  <Textarea
                    label="About Me"
                    placeholder="Write something about yourself"
                    className="sm:col-span-2"
                    {...register("about")}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Contact Information
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    {...register("phone")}
                  />
                  <Input
                    label="Email"
                    placeholder="Enter your contact email"
                    {...register("contactEmail")}
                  />
                </div>
              </section>
            </div>

            <Button className="mt-5" icon={Save}>
              Save Changes
            </Button>
          </form>
        </div>
      ) : null}

      {connectionsOpen ? (
        <div
          className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="connections-title"
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setConnectionsOpen(null)}
            aria-label={`Close ${activeConnectionsTitle.toLowerCase()} dialog`}
          />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="connections-title"
                className="text-2xl font-black text-slate-950 dark:text-white"
              >
                {activeConnectionsTitle}
              </h2>
              <button
                type="button"
                onClick={() => setConnectionsOpen(null)}
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 max-h-[60vh] overflow-y-auto">
              {activeConnections.length ? (
                <div className="space-y-3">
                  {activeConnections.map((person) => {
                    const personInitial = (person.name || person.email || "U")
                      .trim()
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <div
                        key={person.id || person.email || person.name}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                      >
                        <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-brand-600 font-black text-white">
                          {person.avatar ? (
                            <img
                              src={person.avatar}
                              alt={person.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            personInitial
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-black text-slate-950 dark:text-white">
                            {person.name || "QuickDeal User"}
                          </p>
                          {person.email ? (
                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                              {person.email}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-lg font-black text-slate-950 dark:text-white">
                    No {activeConnectionsTitle.toLowerCase()} yet
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {connectionsOpen === "followers"
                      ? "People who follow you will appear here."
                      : "People you follow will appear here."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProfilePage;
