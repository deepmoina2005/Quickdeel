import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required in .env");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: process.env.ADMIN_NAME || "QuickDeal Admin",
      phone: process.env.ADMIN_PHONE || null,
      password: hashedPassword,
      role: "ADMIN",
      isVerifiedSeller: true,
      isEliteSeller: true
    },
    create: {
      name: process.env.ADMIN_NAME || "QuickDeal Admin",
      email,
      phone: process.env.ADMIN_PHONE || null,
      password: hashedPassword,
      role: "ADMIN",
      isVerifiedSeller: true,
      isEliteSeller: true
    }
  });

  const demoPassword = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "user@quickdeal.com" },
    update: {
      password: demoPassword,
      name: "QuickDeal User",
      phone: "+91 99999 99999",
      avatar: "https://i.pravatar.cc/120?img=7",
    },
    create: {
      name: "QuickDeal User",
      email: "user@quickdeal.com",
      phone: "+91 99999 99999",
      password: demoPassword,
      avatar: "https://i.pravatar.cc/120?img=7",
    },
  });
  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: "rohit.seller@quickdeal.local" },
      update: { password: demoPassword },
      create: {
        name: "Rohit Sharma",
        email: "rohit.seller@quickdeal.local",
        phone: "+91 98765 43210",
        password: demoPassword,
        avatar: "https://i.pravatar.cc/120?img=12",
        isVerifiedSeller: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "aisha.seller@quickdeal.local" },
      update: { password: demoPassword },
      create: {
        name: "Aisha Khan",
        email: "aisha.seller@quickdeal.local",
        phone: "+91 99887 76655",
        password: demoPassword,
        avatar: "https://i.pravatar.cc/120?img=32",
        isVerifiedSeller: true,
      },
    }),
  ]);

  const categoryImages = {
    Cars: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    Mobiles: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    Property: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    Electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
    Bikes: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
    Furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    Fashion: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
    Jobs: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
  };

  const categoryEntries = await Promise.all(
    Object.entries(categoryImages).map(([name, image]) =>
      prisma.category.upsert({
        where: { name },
        update: { image },
        create: { name, image },
      }),
    ),
  );
  const categoryByName = Object.fromEntries(categoryEntries.map((category) => [category.name, category]));

  const listingCount = await prisma.listing.count();
  if (listingCount === 0) {
    const demoListings = [
      {
        title: "2021 Hyundai i20 Sportz",
        description: "Single owner, full service history, insurance valid, clean interiors, and ready for immediate transfer.",
        price: 645000,
        condition: "GOOD",
        status: "APPROVED",
        location: "Kolkata",
        userId: sellers[0].id,
        categoryId: categoryByName.Cars.id,
        images: [
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=80",
        ],
      },
      {
        title: "iPhone 14 Pro 128GB",
        description: "Deep purple, bill box available, battery health 92 percent, no dents or scratches.",
        price: 68999,
        condition: "LIKE_NEW",
        status: "APPROVED",
        location: "Delhi",
        userId: sellers[1].id,
        categoryId: categoryByName.Mobiles.id,
        images: ["https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&w=1000&q=80"],
      },
      {
        title: "Royal Enfield Classic 350",
        description: "Low running, matte black, new tyres, recently serviced.",
        price: 142000,
        condition: "GOOD",
        status: "APPROVED",
        location: "Pune",
        userId: sellers[0].id,
        categoryId: categoryByName.Bikes.id,
        images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80"],
      },
      {
        title: "Solid Wood Dining Table",
        description: "Six seater dining set, strong build, minor signs of use.",
        price: 18000,
        condition: "GOOD",
        status: "APPROVED",
        location: "Hyderabad",
        userId: sellers[1].id,
        categoryId: categoryByName.Furniture.id,
        images: ["https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=80"],
      },
    ];

    for (const listing of demoListings) {
      const { images, ...data } = listing;
      await prisma.listing.create({
        data: {
          ...data,
          images: { create: images.map((imageUrl) => ({ imageUrl })) },
        },
      });
    }
  }

  console.log(`Admin user ready: ${email}`);
  console.log(`Demo user ready: ${demoUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
